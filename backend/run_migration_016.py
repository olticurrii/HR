import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), "hr_app.db")
migration_path = os.path.join(os.path.dirname(__file__), "migrations", "016_enhance_feedback.sql")

def run_migration():
    """Run migration 016"""
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
        
        print("✅ Migration 016 completed successfully!")
        print("   Enhanced feedback module with:")
        print("   - Threading support (parent_id)")
        print("   - Moderation flags (is_flagged, flagged_reason)")
        print("   - Notification tracking table")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migration()

