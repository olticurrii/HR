import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), "hr_app.db")
migration_path = os.path.join(os.path.dirname(__file__), "migrations", "017_add_feedback_settings.sql")

def run_migration():
    """Run migration 017"""
    try:
        # Read migration SQL
        with open(migration_path, 'r') as f:
            migration_sql = f.read()
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Execute migration
        cursor.executescript(migration_sql)
        conn.commit()
        
        print("✅ Migration 017 completed successfully!")
        print("   Added feedback feature flags:")
        print("   - feedback_allow_anonymous")
        print("   - feedback_enable_threading")
        print("   - feedback_enable_moderation")
        print("   - feedback_notify_managers")
        print("   - feedback_weekly_digest")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migration()

