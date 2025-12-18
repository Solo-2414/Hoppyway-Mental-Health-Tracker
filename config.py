import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        "mysql+pymysql://root:241405@localhost/hoppy_way_db"

    if os.environ.get('DATABASE_URL'):
        SQLALCHEMY_ENGINE_OPTIONS = {
            "connect_args": {
                "ssl": {
                    "fake_flag_to_trigger_ssl": True
                }
            }
        }
    
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hoppyway-secret-key-123'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    BCRYPT_LOG_ROUNDS = 12