"""Add media_url and created_at columns to content table if missing"""
import pymysql

try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='zhaizhai',
        database='hoppyway_db'
    )
    
    cursor = conn.cursor()
    
    # Check if media_url column exists
    cursor.execute("""
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME='content' AND COLUMN_NAME='media_url'
    """)
    
    if cursor.fetchone() is None:
        print("Adding media_url column to content table...")
        cursor.execute("""
            ALTER TABLE content 
            ADD COLUMN media_url VARCHAR(500) NULL AFTER description
        """)
        conn.commit()
        print("✅ media_url column added successfully")
    else:
        print("✅ media_url column already exists")
    
    # Check if created_at column exists
    cursor.execute("""
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME='content' AND COLUMN_NAME='created_at'
    """)
    
    if cursor.fetchone() is None:
        print("Adding created_at column to content table...")
        cursor.execute("""
            ALTER TABLE content 
            ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER media_url
        """)
        conn.commit()
        print("✅ created_at column added successfully")
    else:
        print("✅ created_at column already exists")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
