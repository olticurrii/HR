import sqlite3
import os

def run_migration():
    # Path to database
    db_path = os.path.join(os.path.dirname(__file__), "hr_app.db")
    
    # Path to migration SQL
    migration_path = os.path.join(os.path.dirname(__file__), "migrations", "006_create_roles_table.sql")
    
    # Read migration SQL
    with open(migration_path, 'r') as f:
        sql = f.read()
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Execute migration
        cursor.executescript(sql)
        conn.commit()
        print("✅ Migration 006 completed successfully!")
        print("✅ Custom roles table created")
        
        # Show what was created
        cursor.execute("SELECT id, name, display_name, description, is_system_role FROM custom_roles")
        roles = cursor.fetchall()
        
        print(f"\n📋 Created {len(roles)} default roles:")
        for role in roles:
            system = " (SYSTEM)" if role[4] else ""
            print(f"  {role[0]}. {role[2]} ({role[1]}){system}")
            if role[3]:
                print(f"     → {role[3]}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()

