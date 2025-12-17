from flask import Blueprint, render_template, session, redirect
from datetime import datetime
import calendar
from models import MoodLog
from functools import wraps

# Create a Blueprint for health routes
health_bp = Blueprint("health", __name__, url_prefix="/health")

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return redirect("/signin")
        return f(*args, **kwargs)
    return decorated_function

@health_bp.route("/")
@login_required
def health():
    user_id = session.get("user_id")

    # Get all logs for this user (Ordered by newest first)
    logs = MoodLog.query.filter_by(user_id=user_id).order_by(MoodLog.created_at.desc()).all()

    # --- Daily progress ---
    today_logs = [log for log in logs if log.created_at.date() == datetime.utcnow().date()]
    daily_percentage = min(len(today_logs) * 20, 100)  # scale: 5 logs = 100%

    # --- Time of day progress ---
    morning_logs = [log for log in logs if log.created_at.hour < 12]
    afternoon_logs = [log for log in logs if 12 <= log.created_at.hour < 18]
    evening_logs = [log for log in logs if log.created_at.hour >= 18]

    morning_percentage = min(len(morning_logs) * 20, 100)
    afternoon_percentage = min(len(afternoon_logs) * 20, 100)
    evening_percentage = min(len(evening_logs) * 20, 100)

    # --- Weekly progress with stress-based colors ---
    weekly_data = {}
    for i in range(7):  # 0=Mon, 6=Sun
        day_name = calendar.day_abbr[i]
        day_logs = [log for log in logs if log.created_at.weekday() == i]
        percent = int(min(len(day_logs) * 20, 100)) if day_logs else 0

        # Average stress for the day
        avg_stress = sum([log.stress_value or 0 for log in day_logs]) / len(day_logs) if day_logs else 0

        if avg_stress <= 2:
            color_class = "low-stress"
        elif avg_stress <= 4:
            color_class = "medium-stress"
        else:
            color_class = "high-stress"

        weekly_data[day_name] = {"percent": percent, "color_class": color_class}

    return render_template(
        "user/health.html",
        daily_percentage=daily_percentage,
        morning_percentage=morning_percentage,
        afternoon_percentage=afternoon_percentage,
        evening_percentage=evening_percentage,
        weekly_data=weekly_data,
        logs=logs  # <--- ADDED THIS to pass the logs to the HTML
    )