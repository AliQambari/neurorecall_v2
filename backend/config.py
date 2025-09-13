import os
import secrets
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Basic Flask config
    SECRET_KEY = "1dv51fdg5b1fdv51fd5g1d1f5d1v5fdff55"
    
    # Application info
    APP_NAME = "NeuroRecall"
    APP_VERSION = "1.0.0"
    
    # Database config (default SQLite, override for prod)
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, "db", "app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'connect_args': {'check_same_thread': False}
    }
    
    # Session security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=2)
    SESSION_COOKIE_NAME = "session"
    SESSION_REFRESH_EACH_REQUEST = True
    
    # CSRF Protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = 3600
    WTF_CSRF_SECRET_KEY = "bbbbbbfgbhvdkdv5d15f1vg45frefi4u5trcki3cc"
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = "memory://"
    RATELIMIT_DEFAULT = "100 per hour"
    RATELIMIT_ENABLED = True
    
    # Security rate limits
    MAX_LOGIN_ATTEMPTS = 5
    LOGIN_LOCKOUT_DURATION = 900
    MAX_RESET_ATTEMPTS = 5
    RESET_RATE_LIMIT_WINDOW = 3600
    RESET_TOKEN_EXPIRY_HOURS = 1
    
    # Password security
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_MAX_LENGTH = 128
    PASSWORD_REQUIRE_UPPERCASE = True
    PASSWORD_REQUIRE_LOWERCASE = True
    PASSWORD_REQUIRE_DIGITS = True
    PASSWORD_REQUIRE_SPECIAL = True
    
    # Mail settings
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 465
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_USERNAME = "neurorecall@gmail.com"
    MAIL_PASSWORD = "wdnvciiuabuarhem"
    MAIL_DEFAULT_SENDER = "neurorecall@gmail.com"
    MAIL_TIMEOUT = 30
    MAIL_SUPPRESS_SEND = False
    
    # Admin settings
    ADMIN_EMAIL = "admin@neurorecall.ir"
    ADMIN_USERNAME = "admin"
    
    # Frontend and CORS
    FRONTEND_URL = "http://localhost:3000"
    ALLOWED_REDIRECT_DOMAINS = ["yourdomain.com", "localhost"]
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Content Security Policy
    CSP_DEFAULT_SRC = "'self'"
    CSP_SCRIPT_SRC = "'self' 'unsafe-inline'"
    CSP_STYLE_SRC = "'self' 'unsafe-inline'"
    CSP_IMG_SRC = "'self' data: https:"
    
    # File upload settings
    UPLOAD_FOLDER = os.path.join(basedir, 'app', 'static', 'uploads', 'voices')
    MAX_CONTENT_LENGTH = 52428800  # 50 MB
    ALLOWED_EXTENSIONS = {"wav", "mp3", "m4a", "flac", "ogg"}
    UPLOAD_SCAN_ENABLED = False
    UPLOAD_QUARANTINE_FOLDER = os.path.join(basedir, 'quarantine')
    
    # Logging configuration
    LOG_TO_STDOUT = True
    LOG_LEVEL = "INFO"
    LOG_FILE = os.path.join(basedir, 'logs', 'app.log')
    LOG_MAX_BYTES = 10485760
    LOG_BACKUP_COUNT = 5
    
    # Security headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
    
    # API settings
    API_TITLE = "Flask API"
    API_VERSION = "v1"
    API_RATE_LIMIT = "1000 per hour"
    
    # Feature flags
    ENABLE_REGISTRATION = True
    ENABLE_PASSWORD_RESET = True
    ENABLE_EMAIL_VERIFICATION = False
    
    # Performance settings
    SLOW_QUERY_THRESHOLD = 1.0
    
    # Monitoring
    SENTRY_DSN = None
    ENABLE_METRICS = False
    
    @staticmethod
    def init_app(app):
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        os.makedirs(os.path.dirname(app.config['LOG_FILE']), exist_ok=True)
        if app.config.get('UPLOAD_QUARANTINE_FOLDER'):
            os.makedirs(app.config['UPLOAD_QUARANTINE_FOLDER'], exist_ok=True)


class DevelopmentConfig(Config):
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    LOG_LEVEL = 'DEBUG'
    WTF_CSRF_ENABLED = False
    MAIL_SUPPRESS_SEND = False 
    TEMPLATES_AUTO_RELOAD = True
    LOG_TO_STDOUT = True
    RATELIMIT_DEFAULT = "1000 per hour"
    MAX_LOGIN_ATTEMPTS = 4

    @staticmethod
    def init_app(app):
        Config.init_app(app)
        print("Running in DEVELOPMENT mode")
        print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_size': 10,
        'max_overflow': 20,
        'pool_timeout': 30,
        'connect_args': {'check_same_thread': False}
    }
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    LOG_TO_STDOUT = True
    RATELIMIT_DEFAULT = "100 per hour"
    WTF_CSRF_ENABLED = True
    MAIL_SUPPRESS_SEND = False

    @staticmethod
    def init_app(app):
        Config.init_app(app)
        import logging
        from logging.handlers import RotatingFileHandler, SysLogHandler

        if not app.config['LOG_TO_STDOUT']:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            file_handler = RotatingFileHandler(
                app.config['LOG_FILE'],
                maxBytes=app.config['LOG_MAX_BYTES'],
                backupCount=app.config['LOG_BACKUP_COUNT']
            )
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)

        if os.path.exists('/dev/log'):
            syslog_handler = SysLogHandler()
            syslog_handler.setLevel(logging.WARNING)
            app.logger.addHandler(syslog_handler)

        app.logger.setLevel(logging.INFO)
        app.logger.info('Application startup')


class TestingConfig(Config):
    TESTING = True
    DEBUG = True 
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    SESSION_COOKIE_SECURE = False
    MAIL_SUPPRESS_SEND = False
    RATELIMIT_ENABLED = False
    LOG_TO_STDOUT = True
    LOG_LEVEL = 'DEBUG'
    PASSWORD_MIN_LENGTH = 4
    MAX_LOGIN_ATTEMPTS = 10
    UPLOAD_FOLDER = '/tmp/test_uploads'

    @staticmethod
    def init_app(app):
        Config.init_app(app)
        import logging
        handler = logging.StreamHandler()
        handler.setLevel(logging.DEBUG)
        handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.DEBUG)
        app.logger.info("Testing environment initialized")


class DockerConfig(ProductionConfig):
    @staticmethod
    def init_app(app):
        ProductionConfig.init_app(app)
        import logging
        from logging import StreamHandler
        handler = StreamHandler()
        handler.setLevel(logging.INFO)
        handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s'
        ))
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.INFO)


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'docker': DockerConfig,
    'default': DevelopmentConfig
}

def get_config(config_name=None):
    config_name = config_name or "development"
    return config.get(config_name, DevelopmentConfig)
