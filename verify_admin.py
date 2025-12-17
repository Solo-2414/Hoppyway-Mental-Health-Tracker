#!/usr/bin/env python3
"""
Verify admin account location
"""
from app import app, db
from models import User, Admin

def verify_admin():
    with app.app_context():
        # Check User table
        admin_user = User.query.filter_by(email="admin@hoppyway.com").first()
        if admin_user:
            print("❌ Admin found in User table - needs to be removed")
        else:
            print("✅ No admin in User table")
        
        # Check Admin table
        admin = Admin.query.filter_by(username="admin").first()
        if admin:
            print(f"✅ Admin found in Admin table!")
            print(f"   Admin ID: {admin.admin_id}")
            print(f"   Username: {admin.username}")
            print(f"   Created at: {admin.created_at}")
        else:
            print("❌ No admin in Admin table")

if __name__ == "__main__":
    verify_admin()
