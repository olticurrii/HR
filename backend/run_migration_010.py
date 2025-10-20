"""
Run migration 010: Create organization settings table
"""

import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')

# Read the migration SQL
migration_path = os.path.join(os.path.dirname(__file__), 'migrations', '010_create_organization_settings.sql')

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
    print("✓ Migration 010 completed successfully!")
    print("✓ Organization settings table created with default values")
    
except sqlite3.Error as e:
    print(f"✗ Migration failed: {e}")
    conn.rollback()
    raise

finally:
    conn.close()

