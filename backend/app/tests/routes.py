import os
from flask import request, jsonify
from flask_login import current_user, login_required
from datetime import datetime
from app.models.score import Score
from app.tests.utils import save_and_keep_original, recognize_audio, calculate_score, allowed_upload
from app.tests import bp
from app import db
import logging
import traceback

MAX_FILE_SIZE_MB = 5
BASE_VOICES_DIR = os.path.join(os.getcwd(), 'voices')  # مسیر مطلق برای ذخیره فایل‌ها

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@bp.route('/submit-audio', methods=['POST'])
@login_required
def submit_audio():
    try:
        # بررسی فرم
        try:
            test_number = int(request.form.get('test_number'))
            round_number = int(request.form.get('round_number'))
        except (TypeError, ValueError):
            return jsonify({"error": "شماره تست یا دور نامعتبر است"}), 400

        if test_number not in [1, 2, 3, 4]:
            return jsonify({"error": "شماره تست باید بین 1 تا 4 باشد"}), 400
        if round_number not in [1, 2, 3, 4, 5]:
            return jsonify({"error": "شماره دور باید بین 1 تا 5 باشد"}), 400

        if 'audio' not in request.files:
            return jsonify({"error": "هیچ فایل صوتی ارسال نشده است"}), 400

        audio_file = request.files['audio']

        # چک فرمت
        if not allowed_upload(getattr(audio_file, 'filename', ''), getattr(audio_file, 'mimetype', None)):
            return jsonify({"error": "فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: MP3, M4A, WAV, OGG, WebM"}), 400

        # چک حجم
        audio_file.seek(0, os.SEEK_END)
        file_size_mb = audio_file.tell() / (1024 * 1024)
        audio_file.seek(0)
        if file_size_mb > MAX_FILE_SIZE_MB:
            return jsonify({"error": f"حجم فایل از {MAX_FILE_SIZE_MB} مگابایت بیشتر است"}), 400
        if file_size_mb == 0:
            return jsonify({"error": "فایل خالی است"}), 400

        username = current_user.username
        save_path, error = save_and_keep_original(audio_file, username, test_number, round_number)
        if error:
            return jsonify({"error": error}), 400

        # تبدیل و تشخیص صدا
        text = recognize_audio(save_path)
        if not text or not text.strip():
            return jsonify({"error": "متن قابل تشخیصی در فایل صوتی یافت نشد. لطفاً مجدداً تلاش کنید."}), 400

        score, correct_words, incorrect_words = calculate_score(text, test_number)

        # ذخیره نمره با مدیریت تلاش‌ها (attempt)
        user_id = current_user.id

        # آخرین شماره تلاش برای این تست را پیدا کن
        max_attempt = db.session.query(db.func.max(Score.attempt_number)).filter_by(
            user_id=user_id, test_number=test_number
        ).scalar() or 0

        if round_number == 1:
            # شروع تلاش جدید
            attempt_number = max_attempt + 1
        else:
            # ادامه آخرین تلاش موجود؛ اگر وجود ندارد، تلاش 1 را شروع کن
            attempt_number = max_attempt if max_attempt > 0 else 1

        # اگر همان دور در همان تلاش ارسال شود، رکورد را جایگزین کن
        score_entry = Score.query.filter_by(
            user_id=user_id,
            test_number=test_number,
            attempt_number=attempt_number,
            round_number=round_number
        ).first()

        if score_entry:
            score_entry.score = score
            score_entry.correct_words = correct_words
            score_entry.incorrect_words = incorrect_words
            score_entry.test_time = datetime.now()
        else:
            score_entry = Score(
                user_id=user_id,
                test_number=test_number,
                attempt_number=attempt_number,
                round_number=round_number,
                score=score,
                correct_words=correct_words,
                incorrect_words=incorrect_words,
                test_time=datetime.now()
            )
            db.session.add(score_entry)

        db.session.commit()

        tokens = text.split()
        return jsonify({
            "transcribed_words": tokens,
            "total_words": len(tokens),
            "correct_words": score,
            "incorrect_words": incorrect_words,
            "round_completed": round_number == 5,
            "message": "فایل با موفقیت پردازش شد"
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error processing audio for user {current_user.username}: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "خطا در پردازش فایل صوتی. لطفاً مجدداً تلاش کنید."}), 500
