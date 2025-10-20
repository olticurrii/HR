#!/usr/bin/env python3
"""
Run migration 019: Create insights aggregates tables
"""
import sqlite3
from pathlib import Path

def run_migration():
    # Use the backend directory's database
    db_path = Path(__file__).parent / "hr_app.db"
    
    print(f"Running migration 019 on database: {db_path}")
    
    if not db_path.exists():
        print(f"ERROR: Database not found at {db_path}")
        return
    
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        # Read and execute migration
        migration_file = Path(__file__).parent / "migrations" / "019_create_insights_aggregates.sql"
        
        if not migration_file.exists():
            print(f"ERROR: Migration file not found at {migration_file}")
            return
        
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        # Execute the migration
        cursor.executescript(migration_sql)
        conn.commit()
        
        print("✅ Migration 019 completed successfully!")
        
        # Verify tables were created
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name IN ('daily_feedback_aggregates', 'feedback_keywords')
        """)
        tables = cursor.fetchall()
        print(f"Created tables: {[t[0] for t in tables]}")
        
    except sqlite3.Error as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
