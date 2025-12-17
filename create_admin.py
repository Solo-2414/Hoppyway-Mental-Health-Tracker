#!/usr/bin/env python3
"""
Script to create an admin account in the Admin table
"""
from app import app, db, bcrypt
from models import Admin, User

def create_admin():
    with app.app_context():
        # Remove admin from User table if it exists
        admin_user = User.query.filter_by(email="admin@hoppyway.com").first()
        if admin_user:
            db.session.delete(admin_user)
            db.session.commit()
            print("🗑️  Removed admin from User table")
        
        # Check if admin already exists in Admin table
        admin = Admin.query.filter_by(username="admin").first()
        if admin:
            # Update email if missing
            if not admin.email:
                admin.email = "admin@hoppyway.com"
                db.session.commit()
                print("✅ Updated admin email!")
            else:
                print("❌ Admin account already exists in Admin table!")
            return
        
        # Create admin account in Admin table
        hashed_pw = bcrypt.generate_password_hash("admin123").decode("utf-8")
        
        new_admin = Admin(
            username="admin",
            email="admin@hoppyway.com",
            password=hashed_pw
        )
        
        db.session.add(new_admin)
        db.session.commit()
        
        print("✅ Admin account created successfully in Admin table!")
        print(f"Username: admin")
        print(f"Email: admin@hoppyway.com")
        print(f"Password: admin123")

if __name__ == "__main__":
    create_admin()
