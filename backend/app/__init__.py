import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_cors import CORS
from config import get_config

# =======================
# ایجاد نمونه اکستنشن‌ها
# =======================
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()

# =======================
# تابع اصلی ساخت اپلیکیشن
# =======================
def create_app(config_name=None):
    """
    Factory function to create Flask app instance.
    
    Args:
        config_name (str, optional): محیط برنامه (development, production, testing)
    
    Returns:
        Flask app instance
    """
    app = Flask(__name__)

    env = config_name or os.getenv("FLASK_ENV", "development")
    cfg_class = get_config(env)
    app.config.from_object(cfg_class)
    cfg_class.init_app(app)  
    
    # =======================
    # فعال‌سازی CORS برای مسیرهای API
    # =======================
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config.get("FRONTEND_URL", "http://localhost:3000")}},
        supports_credentials=True
    )

    # =======================
    # مقداردهی اکستنشن‌ها
    # =======================
    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)

    # Enable WAL mode for better SQLite concurrency
    if 'sqlite' in app.config['SQLALCHEMY_DATABASE_URI']:
        with app.app_context():
            db.engine.execute("PRAGMA journal_mode=WAL")

    # =======================
    # تنظیمات Login Manager
    # =======================
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'

    @login_manager.user_loader
    def load_user(user_id):
        """Load user by ID for Flask-Login."""
        from app.models.user import User
        return User.query.get(int(user_id))

    # =======================
    # ثبت Blueprints
    # =======================
    from app.main import bp as main_bp
    app.register_blueprint(main_bp, url_prefix='/api')

    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.tests import bp as tests_bp
    app.register_blueprint(tests_bp, url_prefix='/api/tests')

    from app.admin import bp as admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # =======================
    # بعدا برای مسیر های ریکت
    # =======================
    

    return app
