import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), "hr_app.db")
migration_path = os.path.join(os.path.dirname(__file__), "migrations", "014_add_missing_permissions.sql")

def run_migration():
    """Run migration 014"""
    try:
        # Read migration SQL
        with open(migration_path, 'r') as f:
            migration_sql = f.read()
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Execute migration
        cursor.executescript(migration_sql)
        conn.commit()
        
        print("✅ Migration 014 completed successfully!")
        print("   Added permissions for:")
        print("   - Profile (view, edit own profile)")
        print("   - Performance (view goals, KPIs, reviews)")
        print("   - OrgChart (view organizational structure)")
        print("   - Sessions (manage login sessions)")
        print("   - Reports (generate and view reports)")
        print("   - Analytics (view analytics dashboards)")
        print("   - Insights (feedback insights)")
        print("   - Comments (task/project comments)")
        print("   - Notifications (user notifications)")
        
        # Show current permissions count
        cursor.execute("SELECT COUNT(*) FROM role_permissions_v2")
        total_perms = cursor.fetchone()[0]
        print(f"\n   Total permissions in system: {total_perms}")
        
        # Show resources
        cursor.execute("SELECT DISTINCT resource FROM role_permissions_v2 ORDER BY resource")
        resources = [row[0] for row in cursor.fetchall()]
        print(f"   Available resources: {', '.join(resources)}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migration()

