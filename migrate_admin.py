#!/usr/bin/env python3
"""
Add email column to admin table
"""
from app import app, db
import pymysql

def migrate_admin_table():
    with app.app_context():
        try:
            # Get connection
            connection = pymysql.connect(
                host='localhost',
                user='root',
                password='zhaizhai',
                database='hoppyway_db'
            )
            cursor = connection.cursor()
            
            # Add email column if it doesn't exist
            try:
                cursor.execute("""
                    ALTER TABLE admin ADD COLUMN email VARCHAR(150) UNIQUE NOT NULL AFTER username
                """)
                connection.commit()
                print("✅ Added email column to admin table")
            except pymysql.err.OperationalError as e:
                if "Duplicate column name" in str(e):
                    print("✅ Email column already exists")
                else:
                    raise
            
            cursor.close()
            connection.close()
            
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    migrate_admin_table()
