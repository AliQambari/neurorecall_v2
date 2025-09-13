# admin/routes.py
from flask import jsonify, request
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from app.models.user import User
from app.models.score import Score
from . import bp  # admin blueprint
from functools import wraps

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin():
            return jsonify({'error': 'Forbidden'}), 403
        return f(*args, **kwargs)
    return decorated_function


@bp.route('/user-results', methods=['GET'])
@login_required
@admin_required
def api_user_results():
    """
    Returns user test results grouped per attempt for admin.
    Optional filters:
    - username
    - test_number
    - test_time (ISO string)
    """

    # Filters
    filter_username = request.args.get('username')
    filter_test_number = request.args.get('test_number')
    filter_test_time = request.args.get('test_time')

    # Base query with join to User
    scores_query = Score.query.join(User, Score.user_id == User.id)

    if filter_username:
        scores_query = scores_query.filter(User.username == filter_username)

    if filter_test_number:
        try:
            scores_query = scores_query.filter(Score.test_number == int(filter_test_number))
        except ValueError:
            return jsonify({'error': 'Invalid test_number'}), 400

    if filter_test_time:
        try:
            test_time_dt = datetime.fromisoformat(filter_test_time)
            test_time_end = test_time_dt + timedelta(days=1)
            scores_query = scores_query.filter(
                Score.test_time >= test_time_dt,
                Score.test_time < test_time_end
            )
        except ValueError:
            return jsonify({'error': 'Invalid test_time format'}), 400

    scores = scores_query.all()

    # Group by (user_id, test_number, attempt_number)
    from collections import defaultdict
    groups = defaultdict(list)
    for s in scores:
        groups[(s.user_id, s.test_number, getattr(s, 'attempt_number', 1))].append(s)

    result = []
    for (user_id, test_number, attempt_number), items in groups.items():
        items_sorted = sorted(items, key=lambda x: x.round_number)
        round_set = {it.round_number for it in items_sorted}
        times = [it.test_time for it in items_sorted]
        approved = (round_set == {1, 2, 3, 4, 5} and times == sorted(times))
        total_score = sum(it.score for it in items_sorted) if approved else 'N/A'

        user = items_sorted[0].user
        row = {
            'username': user.username,
            'age': user.age,
            'sex': user.sex,
            'test_number': test_number,
            'attempt_number': attempt_number,
            'round1': next((it.score for it in items_sorted if it.round_number == 1), None),
            'round2': next((it.score for it in items_sorted if it.round_number == 2), None),
            'round3': next((it.score for it in items_sorted if it.round_number == 3), None),
            'round4': next((it.score for it in items_sorted if it.round_number == 4), None),
            'round5': next((it.score for it in items_sorted if it.round_number == 5), None),
            'test_time': (max(times).isoformat() if times else None),
            'approved': 'Yes' if approved else 'No',
            'total_score': total_score,
        }
        result.append(row)

    # sort results
    result.sort(key=lambda r: (r['username'], r['test_number'], r['attempt_number']))

    # Apply approved filter if requested
    filter_approved = request.args.get('approved')
    if filter_approved == 'Yes':
        result = [r for r in result if r['approved'] == 'Yes']

    return jsonify(result)


@bp.route('/user/<int:user_id>')
@login_required
@admin_required
def get_user_email(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({'email': user.email})
    else:
        return jsonify({'error': 'User not found'}), 404
    
    
@bp.route('/current-user', methods=['GET'])
@login_required
def get_current_user():
    
        if not current_user.is_authenticated:
            return jsonify({'error': 'Unauthorized'}), 401

        response = jsonify({
            'id': current_user.id,
            'username': current_user.username,
            'profile_photo': current_user.profile_photo if hasattr(current_user, 'profile_photo') else None
        })
        
        # Prevent caching
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
        
@bp.route('/user-results/<username>', methods=['GET'])
@login_required
@admin_required
def api_user_results_detail(username):
    """
    Returns approved test results for a specific user.
    """
    # Filters
    filter_test_number = request.args.get('test_number')
    filter_test_time = request.args.get('test_time')

    # Base query with join to User
    scores_query = Score.query.join(User, Score.user_id == User.id).filter(User.username == username)

    if filter_test_number:
        try:
            scores_query = scores_query.filter(Score.test_number == int(filter_test_number))
        except ValueError:
            return jsonify({'error': 'Invalid test_number'}), 400

    if filter_test_time:
        try:
            test_time_dt = datetime.fromisoformat(filter_test_time)
            test_time_end = test_time_dt + timedelta(days=1)
            scores_query = scores_query.filter(
                Score.test_time >= test_time_dt,
                Score.test_time < test_time_end
            )
        except ValueError:
            return jsonify({'error': 'Invalid test_time format'}), 400

    scores = scores_query.all()

    # Group by (user_id, test_number, attempt_number)
    from collections import defaultdict
    groups = defaultdict(list)
    for s in scores:
        groups[(s.user_id, s.test_number, getattr(s, 'attempt_number', 1))].append(s)

    result = []
    for (user_id, test_number, attempt_number), items in groups.items():
        items_sorted = sorted(items, key=lambda x: x.round_number)
        round_set = {it.round_number for it in items_sorted}
        times = [it.test_time for it in items_sorted]
        approved = (round_set == {1, 2, 3, 4, 5} and times == sorted(times))
        if not approved:
            continue  # Only include approved
        total_score = sum(it.score for it in items_sorted)

        user = items_sorted[0].user
        row = {
            'username': user.username,
            'age': user.age,
            'gender': user.sex,
            'test_number': test_number,
            'attempt_number': attempt_number,
            'round1': next((it.score for it in items_sorted if it.round_number == 1), None),
            'round2': next((it.score for it in items_sorted if it.round_number == 2), None),
            'round3': next((it.score for it in items_sorted if it.round_number == 3), None),
            'round4': next((it.score for it in items_sorted if it.round_number == 4), None),
            'round5': next((it.score for it in items_sorted if it.round_number == 5), None),
            'test_time': (max(times).isoformat() if times else None),
            'approved': 'Yes',
            'total_score': total_score,
        }
        result.append(row)

    # sort by test_number, attempt_number
    result.sort(key=lambda r: (r['test_number'], r['attempt_number']))

    return jsonify(result)
