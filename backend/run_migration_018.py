#!/usr/bin/env python3
"""
Migration Runner: 018_add_performance_enhancements.sql
Adds performance module feature flags, goal approval, anonymous reviews, and KPI tracking
"""

import sqlite3
import sys
from pathlib import Path

def run_migration():
    db_path = Path(__file__).parent / "hr_app.db"
    migration_file = Path(__file__).parent / "migrations" / "018_add_performance_enhancements.sql"
    
    if not db_path.exists():
        print(f"❌ Database not found: {db_path}")
        sys.exit(1)
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        sys.exit(1)
    
    print(f"📂 Database: {db_path}")
    print(f"📂 Migration: {migration_file}")
    print()
    
    # Read migration SQL
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    # Connect and execute
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Running migration 018...")
        
        # Execute migration (SQLite doesn't support multi-statement, split by semicolon)
        statements = [s.strip() for s in migration_sql.split(';') if s.strip() and not s.strip().startswith('--')]
        
        for i, statement in enumerate(statements, 1):
            if statement:
                print(f"  Executing statement {i}/{len(statements)}...")
                cursor.execute(statement)
        
        conn.commit()
        print("✅ Migration 018 completed successfully!")
        print()
        print("📊 Changes applied:")
        print("  - Added 8 performance feature flags to organization_settings")
        print("  - Added goal approval tracking to performance_objectives")
        print("  - Added anonymous peer review support to review_responses")
        print("  - Created kpi_snapshots table for trend tracking")
        print("  - Created necessary indexes")
        
    except sqlite3.Error as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()

