from app import db
from datetime import datetime

class Score(db.Model):
    __tablename__ = 'scores'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    test_number = db.Column(db.Integer, nullable=False, index=True)
    attempt_number = db.Column(db.Integer, nullable=False, server_default="1", index=True)
    round_number = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Float, nullable=False)
    correct_words = db.Column(db.JSON, nullable=False, default=[])
    incorrect_words = db.Column(db.JSON, nullable=False, default=[])
    test_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    __table_args__ = (
        db.Index('idx_user_test_attempt_round', 'user_id', 'test_number', 'attempt_number', 'round_number'),
        db.UniqueConstraint('user_id', 'test_number', 'attempt_number', 'round_number', name='uq_score_attempt_round')
    )
    
    def __repr__(self):
        return f'<Score {self.score} - Test {self.test_number}, Attempt {self.attempt_number}, Round {self.round_number}>'
