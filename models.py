from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="user")
    status = db.Column(db.String(20), default="active")
    last_login = db.Column(db.DateTime, nullable=True)

class Admin(db.Model):
    __tablename__ = "admin"
    admin_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class MoodLog(db.Model):
    __tablename__ = "mood_log"
    log_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    mood_value = db.Column(db.Integer)
    stress_value = db.Column(db.Integer)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user = db.relationship("User", backref=db.backref("mood_logs", lazy=True))

class Notification(db.Model):
    __tablename__ = "notification"
    notif_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    message = db.Column(db.String(150))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user = db.relationship("User", backref=db.backref("notifications", lazy=True))

class Chat(db.Model):
    __tablename__ = "chat"
    chat_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    message_text = db.Column(db.Text)
    sent_at = db.Column(db.DateTime, server_default=db.func.now())

    sender = db.relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    receiver = db.relationship("User", foreign_keys=[receiver_id], backref="received_messages")

class Content(db.Model):
    __tablename__ = "content"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    content_type = db.Column(db.String(50), nullable=False)  # 'resource' or 'emotion'
    category = db.Column(db.String(100), nullable=True)  # Article, Video, Tips, etc.
    description = db.Column(db.Text, nullable=False)
    emotion = db.Column(db.String(50), nullable=True)  # For emotion-based: 'happy', 'sad', 'neutral', 'okay', 'very_sad'
    media_url = db.Column(db.String(500), nullable=True)  # YouTube or other media links
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Journal(db.Model):
    __tablename__ = "journal"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user = db.relationship("User", backref=db.backref("journals", lazy=True))