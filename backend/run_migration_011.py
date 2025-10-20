"""
Run migration 011: Add require_documentation to organization settings
"""

import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')

# Read the migration SQL
migration_path = os.path.join(os.path.dirname(__file__), 'migrations', '011_add_require_documentation.sql')

with open(migration_path, 'r') as f:
    migration_sql = f.read()

# Execute the migration
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute(migration_sql)
    conn.commit()
    print("✓ Migration 011 completed successfully!")
    print("✓ Added require_documentation column to organization_settings")
    
except sqlite3.Error as e:
    print(f"✗ Migration failed: {e}")
    conn.rollback()
    raise

finally:
    conn.close()

