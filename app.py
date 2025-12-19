from flask import Flask, render_template, redirect, request, session, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from functools import wraps
import pymysql
import random
import calendar
import os
from datetime import datetime, timedelta
from sqlalchemy import or_, func
from config import Config
from models import db, User, Admin, MoodLog, Notification, Chat, Content, Journal
from health_track import health_bp

pymysql.install_as_MySQLdb()

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
bcrypt = Bcrypt(app)

# ---------------------------------
# POSITIVE QUOTES LIST
# ---------------------------------
POSITIVE_QUOTES = [
    {"text": "Happiness is not by chance, but by choice.", "author": "Jim Rohn"},
    {"text": "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity.", "author": "Unknown"},
    {"text": "You don’t have to control your thoughts. You just have to stop letting them control you.", "author": "Dan Millman"},
    {"text": "There is hope, even when your brain tells you there isn’t.", "author": "John Green"},
    {"text": "Out of your vulnerabilities will come your strength.", "author": "Sigmund Freud"},
    {"text": "Self-care is how you take your power back.", "author": "Lalah Delia"},
    {"text": "It is not the mountain we conquer, but ourselves.", "author": "Sir Edmund Hillary"},
    {"text": "Breathe. It’s just a bad day, not a bad life.", "author": "Unknown"},
    {"text": "Healing takes time, and asking for help is a courageous step.", "author": "Mariska Hargitay"},
    {"text": "You are enough just as you are.", "author": "Meghan Markle"}
]

# ---------------------------------
# CONTEXT PROCESSOR (Notifications)
# ---------------------------------
@app.context_processor
def inject_user_notifications():
    user = None
    notifications = []
    unread_count = 0
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(5).all()
        unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return dict(user=user, notifications=notifications, notif_unread_count=unread_count)

# ---------------------------------
# LOGIN REQUIRED DECORATOR
# ---------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in first.", "danger")
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session or session.get("role") != "admin":
            flash("Admins only!", "error")
            return redirect('/')
        return f(*args, **kwargs)
    return wrapper

# ---------------------------------
# MOOD LOGGING
# ---------------------------------
@app.route("/log_mood", methods=["POST"])
@login_required
def log_mood():
    mood_value = request.form.get("mood_value")
    stress_value = request.form.get("stress_value")
    notes = request.form.get("notes")
    user_id = session.get("user_id")
    if not user_id: return "User not logged in", 403
    
    new_log = MoodLog(
        user_id=user_id, 
        mood_value=int(mood_value), 
        stress_value=int(stress_value) if stress_value else None, 
        notes=notes
    )
    db.session.add(new_log)
    db.session.commit()
    return "Mood logged", 200

# ---------------------------------
# SIGN UP / SIGN IN / PUBLIC
# ---------------------------------
@app.route("/signup", methods=["POST"])
def signup():
    name = request.form["name"]
    username = request.form["username"]
    email = request.form["email"]
    password = request.form["password"]
    confirm = request.form["confirm_password"]

    if User.query.filter_by(email=email).first():
        return render_template("index.html", signup_error="email", message="Email already exists.", show_modal="signup")

    if User.query.filter_by(username=username).first():
        return render_template("index.html", signup_error="username", message="Username already exists.", show_modal="signup")

    if password != confirm:
        return render_template("index.html", signup_error="confirm_password", message="Passwords do not match.", show_modal="signup")

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(name=name, username=username, email=email, password=hashed_pw, role="user")
    
    db.session.add(new_user)
    db.session.commit()

    session["user_id"] = new_user.id
    session["role"] = new_user.role
    session["name"] = new_user.name
    session["username"] = new_user.username
    session["is_first_login"] = True
    
    flash("Account created! Welcome to HoppyWay.", "success")
    return redirect("/home")

@app.route('/signin', methods=['POST'])
def signin():
    email = request.form['email']
    password = request.form['password']

    admin = Admin.query.filter_by(email=email).first()
    if admin:
        if not bcrypt.check_password_hash(admin.password, password):
            return render_template("index.html", login_error="password", message="Wrong password", show_modal="signin")
        
        session['user_id'] = admin.admin_id
        session['username'] = admin.username
        session['role'] = "admin"
        return redirect('/dashboard')

    user = User.query.filter_by(email=email).first()
    if not user: 
        return render_template("index.html", login_error="email", message="Email not found", show_modal="signin")
    
    if not bcrypt.check_password_hash(user.password, password): 
        return render_template("index.html", login_error="password", message="Wrong password", show_modal="signin")

    user.last_login = datetime.now()
    db.session.commit()

    session['user_id'] = user.id
    session['username'] = user.username
    session['name'] = user.name
    session['role'] = user.role
    
    flash("Welcome back!", "success")
    return redirect('/home')

@app.route('/')
def index(): 
    return render_template('index.html')

# ---------------------------------
# UPDATED HOME ROUTE (For Dashboard)
# ---------------------------------
@app.route('/home')
@login_required
def home(): 
    user_id = session.get("user_id")

    if session.pop('is_first_login', False):
        greeting = "Welcome"
    else:
        greeting = "Welcome Back"

    daily_quote = random.choice(POSITIVE_QUOTES)
    
    recent_logs = MoodLog.query.filter_by(user_id=user_id)\
        .order_by(MoodLog.created_at.desc())\
        .limit(3).all()

    logs = MoodLog.query.filter_by(user_id=user_id).all()
    weekly_data = {}
    
    for i in range(7):
        day_abbr = calendar.day_abbr[i]
        day_logs = [log for log in logs if log.created_at.weekday() == i]
        percent = int(min(len(day_logs) * 20, 100)) if day_logs else 0
        
        avg_stress = sum([log.stress_value or 0 for log in day_logs]) / len(day_logs) if day_logs else 0
        if avg_stress <= 2: color = "low-stress"
        elif avg_stress <= 4: color = "medium-stress"
        else: color = "high-stress"
        
        weekly_data[day_abbr] = {"percent": percent, "color_class": color}

    return render_template(
        'user/home.html', 
        active_page='home', 
        quote=daily_quote,
        recent_logs=recent_logs,
        weekly_data=weekly_data,
        greeting=greeting
    )

@app.route("/my_moods")
@login_required
def my_moods():
    logs = MoodLog.query.filter_by(user_id=session["user_id"]).order_by(MoodLog.created_at.desc()).all()
    return render_template("user/moods.html", logs=logs)

# ---------------------------------
# JOURNAL ROUTE (API)
# ---------------------------------
@app.route('/log_journal', methods=['POST'])
@login_required
def log_journal():
    data = request.json
    title = data.get('title')
    entry = data.get('entry')
    user_id = session.get('user_id')

    if not title or not entry:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    new_journal = Journal(
        user_id=user_id, 
        title=title, 
        content=entry
    )
    
    db.session.add(new_journal)
    db.session.commit()
    
    return jsonify({"status": "success"}), 200

# ---------------------------------
# JOURNAL ROUTES (View & Delete)
# ---------------------------------
@app.route('/my_journals')
@login_required
def my_journals():
    user_id = session.get("user_id")
    journals = Journal.query.filter_by(user_id=user_id).order_by(Journal.created_at.desc()).all()
    return render_template('user/journals.html', journals=journals, active_page='journals')

@app.route('/delete_journal/<int:journal_id>', methods=['POST'])
@login_required
def delete_journal(journal_id):
    journal = Journal.query.get_or_404(journal_id)

    if journal.user_id != session.get("user_id"):
        flash("Unauthorized action.", "danger")
        return redirect(url_for('my_journals'))

    db.session.delete(journal)
    db.session.commit()
    flash("Journal entry deleted.", "success")
    return redirect(url_for('my_journals'))

# ---------------------------------
# MESSAGES ROUTE & API (From Code 2)
# ---------------------------------
@app.route('/messages')
@login_required
def messages():
    user_id = session['user_id']

    sent_to = [c.receiver_id for c in Chat.query.filter_by(sender_id=user_id).all()]
    received_from = [c.sender_id for c in Chat.query.filter_by(receiver_id=user_id).all()]
    
    contact_ids = set(sent_to + received_from)

    if contact_ids:
        conversations = User.query.filter(User.id.in_(contact_ids)).all()
    else:
        conversations = []

    return render_template('user/messages.html', active_page='messages', conversations=conversations)

@app.route('/api/search_users', methods=['GET'])
@login_required
def search_users():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])
    
    results = User.query.filter(
        (User.username.ilike(f"%{query}%") | User.name.ilike(f"%{query}%")),
        User.id != session['user_id']
    ).limit(10).all()
    
    return jsonify([{'id': u.id, 'name': u.name, 'username': u.username} for u in results])

@app.route('/api/get_messages/<int:receiver_id>')
@login_required
def get_messages(receiver_id):
    current_user_id = session['user_id']
    chats = Chat.query.filter(
        or_(
            (Chat.sender_id == current_user_id) & (Chat.receiver_id == receiver_id),
            (Chat.sender_id == receiver_id) & (Chat.receiver_id == current_user_id)
        )
    ).order_by(Chat.sent_at.asc()).all()
    
    return jsonify([{
        "text": c.message_text,
        "sender_id": c.sender_id,
        "time": c.sent_at.strftime("%I:%M %p")
    } for c in chats])

@app.route('/api/send_message', methods=['POST'])
@login_required
def send_message():
    data = request.json
    sender_id = session['user_id']
    receiver_id = data.get('receiver_id')
    message_text = data.get('message')

    if not receiver_id or not message_text:
        return jsonify({"error": "Missing data"}), 400

    new_msg = Chat(
        sender_id=sender_id, 
        receiver_id=receiver_id, 
        message_text=message_text
    )
    db.session.add(new_msg)

    existing_notif = Notification.query.filter_by(
        user_id=receiver_id, 
        message=f"You have a new message from {session.get('name', 'a user')}",
        is_read=False
    ).first()

    if not existing_notif:
        sender_name = session.get('name', 'Someone')
        notif = Notification(
            user_id=receiver_id,
            message=f"You have a new message from {sender_name}",
            is_read=False
        )
        db.session.add(notif)

    db.session.commit()
    
    return jsonify({"status": "success"}), 200

# ---------------------------------
# USER CONTENT ROUTES
# ---------------------------------
@app.route('/resources')
@login_required
def resources(): 
    return render_template('user/resources.html', active_page='resources')

@app.route('/call-to-action')
@login_required
def call_to_action(): 
    return render_template('user/call_to_action.html', active_page='call_to_action')

@app.route('/information')
@login_required
def information(): 
    return render_template('user/information.html', active_page='information')

@app.route('/faqs')
@login_required
def faqs(): 
    return render_template('user/faqs.html', active_page='faqs')

@app.route('/logout')
def logout(): 
    session.clear()
    return redirect('/')

# ---------------------------------
# NOTIFICATIONS ROUTES
# ---------------------------------
@app.route('/notifications')
@login_required
def view_notifications():
    user_id = session.get('user_id')
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()

    to_mark = [n for n in notifications if not n.is_read]
    if to_mark:
        for n in to_mark:
            n.is_read = True
        db.session.commit()

    return render_template('user/notifications.html', notifications=notifications, active_page='')

@app.route('/api/notifications/<int:notif_id>', methods=['DELETE'])
@login_required
def api_delete_notification(notif_id):
    notif = Notification.query.get(notif_id)
    user_id = session.get('user_id')
    if not notif or notif.user_id != user_id:
        return jsonify({'error': 'Notification not found'}), 404

    db.session.delete(notif)
    db.session.commit()
    return jsonify({'message': 'Notification deleted'}), 200

# ---------------------------------
# API: GET UNREAD NOTIFICATIONS
# ---------------------------------
@app.route('/api/notifications/poll', methods=['GET'])
@login_required
def api_poll_notifications():
    user_id = session.get('user_id')
    

    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    recent_notifs = Notification.query.filter_by(user_id=user_id, is_read=False)\
        .order_by(Notification.created_at.desc())\
        .limit(5).all()

    notif_list = []
    for n in recent_notifs:
        notif_list.append({
            'id': n.notif_id,
            'message': n.message,
            'time': n.created_at.strftime('%b %d, %I:%M %p')
        })
        
    return jsonify({
        'count': unread_count,
        'notifications': notif_list
    })

# ---------------------------------
# UPDATE PROFILE API
# ---------------------------------
@app.route('/api/user/update', methods=['PUT'])
@login_required
def api_update_profile():
    user = User.query.get(session['user_id'])
    data = request.get_json()
    
    new_name = data.get('name')
    new_username = data.get('username')
    new_email = data.get('email')

    if not new_name or not new_username or not new_email:
        return jsonify({'error': 'All fields are required'}), 400

    existing_user = User.query.filter(
        (User.username == new_username) | (User.email == new_email)
    ).filter(User.id != user.id).first()

    if existing_user:
        return jsonify({'error': 'Username or Email already taken'}), 409

    try:
        user.name = new_name
        user.username = new_username
        user.email = new_email
        db.session.commit()

        session['user_name'] = user.name
        
        return jsonify({'message': 'Profile updated successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error'}), 500

# ---------------------------------
# ADMIN PAGES ROUTES
# ---------------------------------
@app.route('/dashboard')
@admin_required
def admin_dashboard(): 
    return render_template('admin/dashboard.html', active_page='dashboard')

@app.route('/manage_users')
@admin_required
def admin_manage_users():
    users = User.query.all()
    return render_template('admin/manage_users.html', users=users, active_page='manage_users')

@app.route('/manage_content')
@admin_required
def admin_manage_content(): 
    return render_template('admin/manage_content.html', active_page='manage_content')

@app.route('/announcements')
@admin_required
def admin_announcements(): 
    return render_template('admin/announcements.html', active_page='announcements')

# ---------------------------------
# API ROUTES - ADMIN (Integrated from Code 1)
# ---------------------------------

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def api_admin_stats():
    total_users = User.query.filter_by(role='user').count()

    today = datetime.now().date()
    daily_checkins = MoodLog.query.filter(func.date(MoodLog.created_at) == today).count()

    avg_mood_val = db.session.query(func.avg(MoodLog.mood_value)).scalar()
    avg_mood = round(avg_mood_val, 1) if avg_mood_val else 0

    if total_users > 0:
        participation_rate = (daily_checkins / total_users) * 100
    else:
        participation_rate = 0
        
    if participation_rate >= 30:
        engagement_text = "High"
    elif participation_rate >= 10:
        engagement_text = "Medium"
    else:
        engagement_text = "Low"

    return jsonify({
        "total_users": total_users,
        "daily_checkins": daily_checkins,
        "avg_mood": avg_mood,
        "engagement": engagement_text
    })

@app.route('/api/users_demographics', methods=['GET'])
@admin_required
def api_users_demographics():
    """Fetch all users with their latest mood emotional state"""
    users = User.query.filter_by(role="user").all()
    
    mood_mapping = {
    1: "Great", 
    2: "Good", 
    3: "Neutral", 
    4: "Bad", 
    5: "Awful"
    }
    
    users_data = []
    for user in users:
        latest_mood = MoodLog.query.filter_by(user_id=user.id).order_by(MoodLog.created_at.desc()).first()
        emotional_state = mood_mapping.get(latest_mood.mood_value, "Unknown") if latest_mood else "No Data"
        
        users_data.append({
            "id": user.id, "name": user.name, "username": user.username,
            "email": user.email, "emotional_state": emotional_state
        })
    return jsonify(users_data)

@app.route('/api/all_users', methods=['GET'])
@admin_required
def api_all_users():
    """Fetch all users (admin and regular) for manage users page"""
    all_users = User.query.all()
    admins = Admin.query.all()
    users_data = []
    
    for user in all_users:
        last_login = user.last_login.strftime("%Y-%m-%d %H:%M") if user.last_login else "Never"
        users_data.append({
            "id": user.id, "name": user.name, "username": user.username, "email": user.email,
            "role": user.role.capitalize(), "status": "Active", "lastLogin": last_login
        })
    
    for admin in admins:
        users_data.append({
            "id": admin.admin_id, "name": "Admin", "username": admin.username, "email": admin.email,
            "role": "Admin", "status": "Active", "lastLogin": "Never"
        })
    return jsonify(users_data)

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@admin_required
def api_update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()

    if 'name' in data: user.name = data['name']
    if 'username' in data: user.username = data['username']
    if 'email' in data: user.email = data['email']
    if 'role' in data: user.role = data['role'].lower()

    try:
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@admin_required
def api_delete_user(user_id):
    user = User.query.get(user_id)
    if not user: return jsonify({"error": "User not found"}), 404
    MoodLog.query.filter_by(user_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"})

@app.route('/api/users', methods=['POST'])
@admin_required
def api_add_user():
    data = request.get_json()
    if not all([data.get('name'), data.get('username'), data.get('email'), data.get('password'), data.get('role')]):
        return jsonify({"error": "Missing required fields"}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
    
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode("utf-8")
    new_user = User(name=data['name'], username=data['username'], email=data['email'], password=hashed_pw, role=data['role'].lower())
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        "id": new_user.id, "name": new_user.name, "username": new_user.username,
        "email": new_user.email, "role": new_user.role.capitalize(), "status": "Active", "lastLogin": "Never"
    }), 201

# ---------------------------------
# API: RECOMMENDED RESOURCES
# ---------------------------------
@app.route('/api/content/recommended', methods=['GET'])
@login_required
def api_get_recommended_resources():
    user_id = session.get('user_id')

    latest_log = MoodLog.query.filter_by(user_id=user_id).order_by(MoodLog.created_at.desc()).first()

    mood_map = {
        1: 'happy', 
        2: 'okay',    
        3: 'neutral', 
        4: 'sad',    
        5: 'very_sad' 
    }
    
    user_emotion_key = None
    user_emotion_label = "General"

    if latest_log:
        user_emotion_key = mood_map.get(latest_log.mood_value)

        label_map = {
            1: "Great", 
            2: "Good", 
            3: "Neutral", 
            4: "Bad", 
            5: "Devastated"
        }
        user_emotion_label = label_map.get(latest_log.mood_value, "General")

    if user_emotion_key:
        contents = Content.query.filter(
            or_(
                Content.emotion == user_emotion_key, 
                Content.emotion == None,         
                Content.emotion == ""    
            )
        ).order_by(Content.created_at.desc()).all()
    else:
        contents = Content.query.order_by(Content.created_at.desc()).all()

    return jsonify({
        "current_mood": user_emotion_label,
        "resources": [{
            "id": c.id, 
            "title": c.title, 
            "description": c.description, 
            "category": c.category, 
            "emotion": c.emotion,
            "media_url": c.media_url
        } for c in contents]
    })

# ---------------------------------
# CHART API ROUTES
# ---------------------------------
@app.route('/api/chart/mood_distribution', methods=['GET'])
@admin_required
def api_mood_distribution():
    mood_counts = db.session.query(MoodLog.mood_value, func.count(MoodLog.log_id).label('count')).group_by(MoodLog.mood_value).all()
    mood_mapping = {1: "Devastated", 2: "Sad", 3: "Neutral", 4: "Happy", 5: "Excited"}
    
    labels, data = [], []
    for mood_value in [5, 4, 3, 2, 1]:
        count = next((c for v, c in mood_counts if v == mood_value), 0)
        labels.append(mood_mapping[mood_value])
        data.append(count)
    return jsonify({"labels": labels, "data": data})

@app.route('/api/chart/weekly_activity', methods=['GET'])
@admin_required
def api_weekly_activity():
    from datetime import datetime, timedelta
    today = datetime.now().date()
    week_data = {today - timedelta(days=i): 0 for i in range(6, -1, -1)}
    
    logs = db.session.query(func.date(MoodLog.created_at), func.count(func.distinct(MoodLog.user_id)))\
        .filter(MoodLog.created_at >= today - timedelta(days=7)).group_by(func.date(MoodLog.created_at)).all()
    
    for log_date, user_count in logs:
        week_data[log_date] = user_count
    
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    labels = [days[(date.weekday() + 1) % 7] for date in sorted(week_data.keys())]
    data = [week_data[date] for date in sorted(week_data.keys())]
    return jsonify({"labels": labels, "data": data})

@app.route('/api/chart/monthly_activity', methods=['GET'])
@admin_required
def api_monthly_activity():
    from datetime import datetime
    current_year = datetime.now().year
    logs = db.session.query(func.month(MoodLog.created_at), func.count(func.distinct(MoodLog.user_id)))\
        .filter(func.year(MoodLog.created_at) == current_year).group_by(func.month(MoodLog.created_at)).all()
    
    month_data = {i: 0 for i in range(1, 13)}
    for month, user_count in logs: month_data[month] = user_count
    
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return jsonify({"labels": months, "data": [month_data[i] for i in range(1, 13)]})

@app.route('/api/chart/engagement_trends', methods=['GET'])
@admin_required
def api_engagement_trends():
    from datetime import datetime, timedelta
    today = datetime.now().date()
    weeks_data = []
    
    for week_num in range(3, -1, -1):
        week_start = today - timedelta(days=today.weekday() + 7 * week_num)
        week_end = week_start + timedelta(days=6)
        week_logs = db.session.query(MoodLog).filter(func.date(MoodLog.created_at) >= week_start, func.date(MoodLog.created_at) <= week_end).all()
        
        if week_logs:
            unique_users = len(set(log.user_id for log in week_logs))
            avg_mood = sum(log.mood_value for log in week_logs) / len(week_logs)
            weeks_data.append((unique_users * avg_mood) / 10)
        else:
            weeks_data.append(0)
    return jsonify({"labels": ["Week 1", "Week 2", "Week 3", "Week 4"], "data": weeks_data})

# ---------------------------------
# CONTENT MANAGEMENT API
# ---------------------------------
@app.route('/api/content', methods=['GET'])
@admin_required
def api_get_content():
    contents = Content.query.order_by(Content.created_at.desc()).all()
    return jsonify([{
        "id": c.id, "title": c.title, "description": c.description,
        "content_type": c.content_type, "category": c.category, "emotion": c.emotion,
        "media_url": c.media_url, "date_added": c.created_at.strftime("%Y-%m-%d %H:%M")
    } for c in contents])

@app.route('/api/content', methods=['POST'])
@admin_required
def api_add_content():
    data = request.get_json()
    if not all([data.get('title'), data.get('description'), data.get('content_type')]):
        return jsonify({"error": "Missing required fields"}), 400
    
    new_content = Content(
        title=data['title'], description=data['description'], content_type=data['content_type'],
        category=data.get('category'), emotion=data.get('emotion'), media_url=data.get('media_url')
    )
    db.session.add(new_content)
    db.session.commit()
    
    return jsonify({
        "id": new_content.id, "title": new_content.title, "date_added": new_content.created_at.strftime("%Y-%m-%d %H:%M")
    }), 201

@app.route('/api/content/<int:content_id>', methods=['PUT'])
@admin_required
def api_update_content(content_id):
    content = Content.query.get(content_id)
    if not content: return jsonify({"error": "Content not found"}), 404
    data = request.get_json()
    
    content.title = data.get('title', content.title)
    content.description = data.get('description', content.description)
    content.content_type = data.get('content_type', content.content_type)
    content.category = data.get('category', content.category)
    content.emotion = data.get('emotion', content.emotion)
    content.media_url = data.get('media_url', content.media_url)
    db.session.commit()
    
    return jsonify({"id": content.id, "title": content.title})

@app.route('/api/content/<int:content_id>', methods=['DELETE'])
@admin_required
def api_delete_content(content_id):
    content = Content.query.get(content_id)
    if not content: return jsonify({"error": "Content not found"}), 404
    db.session.delete(content)
    db.session.commit()
    return jsonify({"message": "Content deleted successfully"})

@app.route('/api/content/emotion/<emotion>', methods=['GET'])
def api_get_emotion_content(emotion):
    contents = Content.query.filter(Content.content_type == 'emotion', func.lower(Content.emotion) == emotion.lower()).all()
    return jsonify([{
        "id": c.id, "title": c.title, "description": c.description, "category": c.category, "media_url": c.media_url
    } for c in contents])

@app.route('/api/content/resources', methods=['GET'])
def api_get_resources():
    contents = Content.query.filter_by(content_type='resource').all()
    return jsonify([{
        "id": c.id, "title": c.title, "description": c.description, "category": c.category, "media_url": c.media_url
    } for c in contents])

# ---------------------------------
# API: MISC
# ---------------------------------
@app.route('/api/user/has_mood_log')
def api_user_has_mood_log():
    user_id = session.get('user_id')
    if not user_id: return jsonify({'has_mood_log': False})
    has_log = MoodLog.query.filter_by(user_id=user_id).first() is not None
    return jsonify({'has_mood_log': has_log})

# ---------------------------------
# ANNOUNCEMENTS API
# ---------------------------------
@app.route('/api/announcements', methods=['POST'])
@admin_required
def api_create_announcement():
    data = request.get_json()
    
    title = data.get('title')
    content = data.get('content')
    
    if not title or not content:
        return jsonify({'error': 'Missing title or content'}), 400

    full_message = f"📢 {title}: {content}"
    
    users = User.query.filter_by(role='user').all()
    
    new_notifications = []
    for user in users:
        notif = Notification(
            user_id=user.id,
            message=full_message,
            is_read=False
        )
        new_notifications.append(notif)

    if new_notifications:
        db.session.add_all(new_notifications)
        db.session.commit()
        return jsonify({
            'message': 'Announcement published successfully', 
            'recipient_count': len(new_notifications)
        }), 201
    else:
        return jsonify({'message': 'No users found to notify'}), 200


app.register_blueprint(health_bp)

if __name__ == "__main__":
    with app.app_context(): db.create_all()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)