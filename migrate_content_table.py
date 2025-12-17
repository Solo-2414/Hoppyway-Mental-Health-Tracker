#!/usr/bin/env python3
"""
Create content table in the database
"""
import pymysql

def create_content_table():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='zhaizhai',
            database='hoppyway_db'
        )
        cursor = connection.cursor()
        
        # Create content table
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS content (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content_type VARCHAR(50) NOT NULL,
                    category VARCHAR(100),
                    description LONGTEXT NOT NULL,
                    emotion VARCHAR(50),
                    media_url VARCHAR(500),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            connection.commit()
            print("✅ Content table created successfully")
        except Exception as e:
            print(f"❌ Error creating content table: {e}")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    create_content_table()
