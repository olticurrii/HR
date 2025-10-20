"""
Run migration 009: Create feedback table
"""

import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')

# Read the migration SQL
migration_path = os.path.join(os.path.dirname(__file__), 'migrations', '009_create_feedback_table.sql')

with open(migration_path, 'r') as f:
    migration_sql = f.read()

# Execute the migration
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Split by semicolon and execute each statement
    statements = [s.strip() for s in migration_sql.split(';') if s.strip()]
    
    for statement in statements:
        print(f"Executing: {statement[:100]}...")
        cursor.execute(statement)
    
    conn.commit()
    print("✓ Migration 009 completed successfully!")
    print("✓ Feedback table created with sentiment analysis fields")
    
except sqlite3.Error as e:
    print(f"✗ Migration failed: {e}")
    conn.rollback()
    raise

finally:
    conn.close()

