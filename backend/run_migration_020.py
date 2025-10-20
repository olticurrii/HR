#!/usr/bin/env python3
"""
Run migration 020: Create comprehensive notification system
"""

import sqlite3
import os
import sys

def run_migration():
    # Get the database path
    db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return False
    
    # Read the migration SQL
    migration_file = os.path.join(os.path.dirname(__file__), 'migrations', '020_create_notifications.sql')
    
    if not os.path.exists(migration_file):
        print(f"❌ Migration file not found at {migration_file}")
        return False
    
    try:
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Execute migration
        print("🔄 Running migration 020: Create comprehensive notification system...")
        cursor.executescript(migration_sql)
        
        # Commit changes
        conn.commit()
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('notifications', 'user_notification_preferences', 'push_notification_tokens')")
        tables = cursor.fetchall()
        
        if len(tables) == 3:
            print("✅ Migration 020 completed successfully!")
            print("   - Created notifications table")
            print("   - Created user_notification_preferences table")
            print("   - Created push_notification_tokens table")
            print("   - Added notification settings to organization_settings")
            print("   - Inserted default preferences for all users")
        else:
            print(f"⚠️  Migration completed but only {len(tables)}/3 tables were created")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)