import os

class Config:
    # Use the secret key from your code
    SECRET_KEY = "hoppyway-secret-key-123"
    
    # Database Configuration from your code
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:241405@localhost/hoppy_way_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security setting for Bcrypt
    BCRYPT_LOG_ROUNDS = 12