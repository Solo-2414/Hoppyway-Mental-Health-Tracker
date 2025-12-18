import os

class Config:
    uri = os.environ.get('DATABASE_URL')
    
    if uri:
        if uri.startswith("mysql://"):
            uri = uri.replace("mysql://", "mysql+pymysql://", 1)
        SQLALCHEMY_DATABASE_URI = uri
    else:
        SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:241405@localhost/hoppy_way_db"

    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "ssl": {"ssl_mode": "REQUIRED"}
        }
    }
    
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hoppyway-secret-key-123'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    BCRYPT_LOG_ROUNDS = 12