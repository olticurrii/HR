"""
Run migration 012: Add work_summary to time_entries table
"""

import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')

# Read the migration SQL
migration_path = os.path.join(os.path.dirname(__file__), 'migrations', '012_add_work_summary_to_time_entry.sql')

with open(migration_path, 'r') as f:
    migration_sql = f.read()

# Execute the migration
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute(migration_sql)
    conn.commit()
    print("✓ Migration 012 completed successfully!")
    print("✓ Added work_summary column to time_entries table")
    
except sqlite3.Error as e:
    print(f"✗ Migration failed: {e}")
    conn.rollback()
    raise

finally:
    conn.close()

