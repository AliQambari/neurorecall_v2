from flask_login import login_required, current_user
from app.main import bp
from app.models.score import Score
import os
from flask import request, jsonify, current_app, send_from_directory, send_file
from werkzeug.utils import secure_filename
from app.models.user import User
from app import db
"""
@bp.route('/')   #handeled by react app
def index():
    return render_template('main/index.html')
"""
from flask import jsonify, request, session
from flask_login import login_required, current_user
from datetime import datetime, timedelta


@bp.route('/user-profile', methods=['GET'])
@login_required
def api_user_profile():
    # Use Flask-Login's current_user instead of session
    user = current_user

    # grab query params
    f_test = request.args.get('test_number')
    f_time = request.args.get('test_time')  # ISO like "2025-04-12T13:45"

    # start base query
    q = Score.query.filter_by(user_id=user.id)

    # apply filters
    if f_test:
        try:
            q = q.filter(Score.test_number == int(f_test))
        except ValueError:
            return jsonify({'error': 'Bad test_number'}), 400

    if f_time:
        try:
            dt = datetime.fromisoformat(f_time)
            dt_end = dt + timedelta(days=1)
            q = q.filter(Score.test_time >= dt, Score.test_time < dt_end)
        except ValueError:
            return jsonify({'error': 'Bad date'}), 400

    all_scores = q.all()

    # Group by (test_number, attempt_number)
    from collections import defaultdict
    groups = defaultdict(list)
    for s in all_scores:
        groups[(s.test_number, getattr(s, 'attempt_number', 1))].append(s)

    rows = []
    for (test_number, attempt_number), items in groups.items():
        # sort by round_number to compute approval and end time
        items_sorted = sorted(items, key=lambda x: x.round_number)
        round_set = {it.round_number for it in items_sorted}
        times = [it.test_time for it in items_sorted]
        approved = (round_set == {1, 2, 3, 4, 5} and times == sorted(times))
        total_score = sum(it.score for it in items_sorted) if approved else 'N/A'
        # build row with round1..round5
        row = {
            'test_number': test_number,
            'attempt_number': attempt_number,
            'round1': next((it.score for it in items_sorted if it.round_number == 1), None),
            'round2': next((it.score for it in items_sorted if it.round_number == 2), None),
            'round3': next((it.score for it in items_sorted if it.round_number == 3), None),
            'round4': next((it.score for it in items_sorted if it.round_number == 4), None),
            'round5': next((it.score for it in items_sorted if it.round_number == 5), None),
            # use last round time as test end time if exists, else latest time
            'test_time': (max(times).isoformat() if times else None),
            'approved': 'Yes' if approved else 'No',
            'total_score': total_score
        }
        rows.append(row)

    from datetime import datetime
    # sort rows latest to oldest by test_time
    rows.sort(key=lambda r: (datetime.fromisoformat(r['test_time']) if r['test_time'] else datetime.min, r['test_number'], r['attempt_number']), reverse=True)

    return jsonify({
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_photo": user.profile_photo
        },
        "scores": rows
    })

#----------------------profile photo------------------------ 

   
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload-profile-photo', methods=['POST'])
def upload_profile_photo():
    user_id = request.form.get('user_id')
    if 'photo' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['photo']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Ensure upload folder exists
        upload_folder = os.path.join(current_app.root_path, 'static/profile_photos')
        os.makedirs(upload_folder, exist_ok=True)

        # Make filename unique per user to avoid overwriting
        filename = f"user_{user_id}_{secure_filename(file.filename)}"
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user.profile_photo = filename
        db.session.commit()

        return jsonify({"message": "Uploaded successfully", "photo": filename}), 200

    return jsonify({"error": "Invalid file type"}), 400

@bp.route('/profile_photos/<filename>')
def get_profile_photo(filename):
    return send_from_directory(os.path.join(current_app.root_path, 'static/profile_photos'), filename)


@bp.route("/audio/<filename>")
def serve_audio(filename):
    return send_file(f"static/audio/{filename}", mimetype="audio/mp4", as_attachment=False)
