#!/usr/bin/env python3
"""
Add last_login column to user table
"""
import pymysql

def migrate_user_table():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='zhaizhai',
            database='hoppyway_db'
        )
        cursor = connection.cursor()
        
        # Add last_login column if it doesn't exist
        try:
            cursor.execute("""
                ALTER TABLE user ADD COLUMN last_login DATETIME NULL AFTER role
            """)
            connection.commit()
            print("✅ Added last_login column to user table")
        except pymysql.err.OperationalError as e:
            if "Duplicate column name" in str(e):
                print("✅ last_login column already exists")
            else:
                raise
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    migrate_user_table()
