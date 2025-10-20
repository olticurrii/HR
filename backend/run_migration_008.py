import sqlite3
import os
from datetime import datetime

def run_migration():
    # Path to database
    db_path = os.path.join(os.path.dirname(__file__), "hr_app.db")
    
    # Path to migration SQL
    migration_path = os.path.join(os.path.dirname(__file__), "migrations", "008_create_leave_management.sql")
    
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
        print("✅ Migration 008 completed successfully!")
        print("✅ Leave management tables created")
        
        # Show created tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'leave%' ORDER BY name")
        tables = cursor.fetchall()
        
        print(f"\n📋 Created tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Show default leave types
        cursor.execute("SELECT id, name, default_days_per_year FROM leave_types ORDER BY id")
        leave_types = cursor.fetchall()
        
        print(f"\n📝 Default leave types:")
        for lt in leave_types:
            print(f"  - {lt[1]}: {lt[2]} days/year")
        
        # Initialize leave balances for all existing users for current year
        current_year = datetime.now().year
        cursor.execute("SELECT id FROM users")
        users = cursor.fetchall()
        
        cursor.execute("SELECT id, default_days_per_year FROM leave_types WHERE default_days_per_year > 0")
        leave_types_with_balance = cursor.fetchall()
        
        for user in users:
            user_id = user[0]
            for leave_type in leave_types_with_balance:
                leave_type_id, default_days = leave_type
                
                # Check if balance already exists
                cursor.execute(
                    "SELECT id FROM leave_balances WHERE user_id = ? AND leave_type_id = ? AND year = ?",
                    (user_id, leave_type_id, current_year)
                )
                existing = cursor.fetchone()
                
                if not existing:
                    cursor.execute(
                        """INSERT INTO leave_balances (user_id, leave_type_id, total_days, used_days, remaining_days, year)
                           VALUES (?, ?, ?, 0, ?, ?)""",
                        (user_id, leave_type_id, default_days, default_days, current_year)
                    )
        
        conn.commit()
        print(f"\n✅ Initialized leave balances for {len(users)} users for year {current_year}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()

