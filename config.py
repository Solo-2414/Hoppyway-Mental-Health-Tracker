import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hoppyway-secret-key-123'
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        "mysql+pymysql://root:241405@localhost/hoppy_way_db"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    BCRYPT_LOG_ROUNDS = 12