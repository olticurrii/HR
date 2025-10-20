#!/usr/bin/env python3
"""
Run migration 004: Add user roles for RBAC
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')

def run_migration():
    """Execute the migration SQL"""
    migration_file = os.path.join(os.path.dirname(__file__), 'migrations', '004_add_user_roles.sql')
    
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
        
        # Verify column was added
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        role_column = [col for col in columns if col[1] == 'role']
        if role_column:
            print("✓ role column added successfully")
        else:
            print("✗ Warning: role column not found after migration")
        
        # Show role distribution
        cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        results = cursor.fetchall()
        print("\n📊 User role distribution:")
        for role, count in results:
            print(f"  {role}: {count} user(s)")
            
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()

