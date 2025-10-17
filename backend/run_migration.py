"""Run the performance tables migration"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')
migration_path = os.path.join(os.path.dirname(__file__), 'migrations', '001_create_performance_tables.sql')

print(f"📊 Running migration on database: {db_path}")

# Read the migration SQL
with open(migration_path, 'r') as f:
    migration_sql = f.read()

# Connect and execute
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Execute migration
    cursor.executescript(migration_sql)
    conn.commit()
    print("✅ Migration completed successfully!")
    
    # Verify tables were created
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%performance%' OR name LIKE '%review%' OR name LIKE '%competenc%'")
    tables = cursor.fetchall()
    print(f"📋 Created tables: {[t[0] for t in tables]}")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()

