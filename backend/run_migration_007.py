import sqlite3
import os

def run_migration():
    # Path to database
    db_path = os.path.join(os.path.dirname(__file__), "hr_app.db")
    
    # Path to migration SQL
    migration_path = os.path.join(os.path.dirname(__file__), "migrations", "007_user_custom_roles.sql")
    
    # Read migration SQL
    with open(migration_path, 'r') as f:
        sql = f.read()
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Execute migration
        cursor.executescript(sql)
        conn.commit()
        print("✅ Migration 007 completed successfully!")
        print("✅ User custom roles junction table created")
        
        # Show table structure
        cursor.execute("PRAGMA table_info(user_custom_roles)")
        columns = cursor.fetchall()
        
        print(f"\n📋 Table structure:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()

