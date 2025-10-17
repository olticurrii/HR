"""Run the task-performance linking migration"""
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')
migration_path = os.path.join(os.path.dirname(__file__), 'migrations', '002_link_performance_to_tasks.sql')

print(f"📊 Running migration on database: {db_path}")

with open(migration_path, 'r', encoding='utf-8') as f:
    migration_sql = f.read()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.executescript(migration_sql)
    conn.commit()
    print("✅ Migration completed successfully!")
    
    # Verify
    cursor.execute("PRAGMA table_info(tasks)")
    tasks_cols = [col[1] for col in cursor.fetchall()]
    if 'objective_id' in tasks_cols:
        print("✅ Tasks table updated with objective_id")
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='performance_metrics'")
    if cursor.fetchone():
        print("✅ performance_metrics table created")
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()

