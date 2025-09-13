import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
from flask.cli import FlaskGroup
from app import create_app, db
from app.models.user import User
from app.models.score import Score

# ----------------------------
# Load environment variables
# ----------------------------
load_dotenv() 

# ----------------------------
# Create Flask app
# ----------------------------
def create_application():
    """Create Flask application with proper configuration"""
    config_name = os.environ.get('FLASK_ENV', 'development')
    app = create_app(config_name)
    return app

app = create_application()

# ----------------------------
# Shell context
# ----------------------------
@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Score': Score,
        'app': app
    }

# ----------------------------
# CLI commands
# ----------------------------
@app.cli.command()
def init_db():
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")

@app.cli.command()
def drop_db():
    with app.app_context():
        if input("Are you sure you want to drop all tables? (yes/no): ").lower() == 'yes':
            db.drop_all()
            print("Database tables dropped successfully!")
        else:
            print("Operation cancelled.")

@app.cli.command()
def reset_db():
    with app.app_context():
        if input("Are you sure you want to reset the database? (yes/no): ").lower() == 'yes':
            db.drop_all()
            db.create_all()
            print("Database reset successfully!")
        else:
            print("Operation cancelled.")

@app.cli.command()
def create_admin():
    from app.auth.utils import create_user
    import getpass

    with app.app_context():
        admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@localhost')

        existing_admin = User.query.filter_by(username=admin_username).first()
        if existing_admin:
            print(f"Admin user '{admin_username}' already exists!")
            return

        password = getpass.getpass("Enter admin password: ")
        confirm_password = getpass.getpass("Confirm admin password: ")

        if password != confirm_password:
            print("Passwords don't match!")
            return

        try:
            admin_user = create_user(admin_username, admin_email, password)
            if hasattr(admin_user, 'role'):
                admin_user.role = 'admin'
                db.session.commit()
            print(f"Admin user '{admin_username}' created successfully!")
        except Exception as e:
            print(f"Error creating admin user: {str(e)}")
            db.session.rollback()

@app.cli.command()
def cleanup_tokens():
    from app.auth.utils import cleanup_expired_tokens
    with app.app_context():
        count = cleanup_expired_tokens()
        print(f"Cleaned up {count} expired tokens.")

@app.cli.command()
def show_config():
    sensitive_keys = [
        'SECRET_KEY', 'WTF_CSRF_SECRET_KEY', 'MAIL_PASSWORD',
        'DATABASE_URL', 'REDIS_URL', 'SENTRY_DSN'
    ]
    print(f"\nCurrent Configuration ({os.environ.get('FLASK_ENV', 'unknown')}):")
    print("-" * 50)
    for key in sorted(app.config.keys()):
        if key.startswith('_'):
            continue
        value = app.config[key]
        if key in sensitive_keys:
            if value:
                value = f"{'*' * (len(str(value)) - 4)}{str(value)[-4:]}" if len(str(value)) > 4 else "****"
            else:
                value = "Not set"
        print(f"{key}: {value}")

# ----------------------------
# Logging
# ----------------------------
def init_logging():
    import logging
    from logging.handlers import RotatingFileHandler

    if app.logger.hasHandlers():
        return

    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO').upper())
    app.logger.setLevel(log_level)
    formatter = logging.Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')

    if app.config.get('LOG_TO_STDOUT'):
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        console_handler.setFormatter(formatter)
        app.logger.addHandler(console_handler)

    if not app.config.get('TESTING'):
        log_file = app.config.get('LOG_FILE')
        if log_file:
            log_dir = os.path.dirname(log_file)
            if log_dir and not os.path.exists(log_dir):
                os.makedirs(log_dir)
            file_handler = RotatingFileHandler(
                log_file,
                maxBytes=app.config.get('LOG_MAX_BYTES', 10 * 1024 * 1024),
                backupCount=app.config.get('LOG_BACKUP_COUNT', 5)
            )
            file_handler.setLevel(logging.INFO)
            file_handler.setFormatter(formatter)
            app.logger.addHandler(file_handler)

# ----------------------------
# Error Handlers
# ----------------------------
def setup_error_handlers():
    @app.errorhandler(404)
    def not_found_error(error):
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        app.logger.error(f'Server Error: {error}')
        return {'error': 'Internal server error'}, 500

# ----------------------------
# Production config validation
# ----------------------------
def validate_production_config():
    if os.environ.get('FLASK_ENV') != 'production':
        return

    required_configs = [
        'SECRET_KEY',
        'MAIL_DEFAULT_SENDER',
        'DATABASE_URL'
    ]
    missing_configs = [k for k in required_configs if not os.environ.get(k)]
    if missing_configs:
        app.logger.warning(f"Missing required production configurations: {', '.join(missing_configs)}")

# ----------------------------
# Development server
# ----------------------------
def run_development_server():
    host = os.environ.get('FLASK_HOST', '127.0.0.1')
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() in ['true', '1', 'on']

    print(f"🚀 Starting development server on http://{host}:{port}")
    print(f"Debug mode: {debug}")
    print(f"Environment: {os.environ.get('FLASK_ENV', 'unknown')}")
    print("-" * 50)

    app.run(
        host=host,
        port=port,
        debug=debug,
        use_reloader=debug,
        threaded=True
    )

# ----------------------------
# Initialize
# ----------------------------
init_logging()
setup_error_handlers()
validate_production_config()

with app.app_context():
    try:
        db.create_all()
        app.logger.info("Database tables verified/created successfully")
    except Exception as e:
        app.logger.error(f"Database initialization error: {str(e)}")
        if __name__ == '__main__':
            sys.exit(1)

# ----------------------------
# Run if main
# ----------------------------
if __name__ == '__main__':
    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        print("🚨 PRODUCTION MODE DETECTED! Use a proper WSGI server.")
        if input("Continue with development server anyway? [y/N]: ").lower() not in ['y', 'yes']:
            sys.exit(0)
    run_development_server()
else:
    app.logger.info(f"Flask app loaded for WSGI (Environment: {os.environ.get('FLASK_ENV', 'unknown')})")
