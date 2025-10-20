import sqlite3
import os

def run_migration():
    # Path to database
    db_path = os.path.join(os.path.dirname(__file__), "hr_app.db")
    
    # Path to migration SQL
    migration_path = os.path.join(os.path.dirname(__file__), "migrations", "005_create_role_permissions.sql")
    
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
        print("✅ Migration 005 completed successfully!")
        print("✅ Role permissions table created and seeded with default permissions")
        
        # Show what was created
        cursor.execute("SELECT role, resource, can_view, can_create, can_edit, can_delete FROM role_permissions_v2")
        permissions = cursor.fetchall()
        
        print(f"\n📋 Created {len(permissions)} permission entries:")
        current_role = None
        for perm in permissions:
            if current_role != perm[0]:
                current_role = perm[0]
                print(f"\n{current_role.upper()}:")
            actions = []
            if perm[2]: actions.append("view")
            if perm[3]: actions.append("create")
            if perm[4]: actions.append("edit")
            if perm[5]: actions.append("delete")
            print(f"  - {perm[1]}: {', '.join(actions)}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()

