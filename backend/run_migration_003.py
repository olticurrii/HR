#!/usr/bin/env python3
"""
Run migration 003: Create time tracking tables
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')

def run_migration():
    """Execute the migration SQL"""
    migration_file = os.path.join(os.path.dirname(__file__), 'migrations', '003_create_time_tracking.sql')
    
    print(f"Running migration from: {migration_file}")
    print(f"Database: {db_path}")
    
    # Read migration SQL
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Execute migration
        cursor.executescript(migration_sql)
        conn.commit()
        print("✓ Migration completed successfully!")
        
        # Verify table was created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='time_entries'")
        result = cursor.fetchone()
        if result:
            print("✓ time_entries table created successfully")
        else:
            print("✗ Warning: time_entries table not found after migration")
            
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()

