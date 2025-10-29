#!/usr/bin/env python3
"""Run migration 021: Office Booking & Meeting Scheduler"""

import sqlite3
import sys

def run_migration():
    """Execute migration 021"""
    try:
        # Connect to database
        conn = sqlite3.connect('hr_app.db')
        cursor = conn.cursor()
        
        # Read migration file
        with open('migrations/021_create_office_booking.sql', 'r') as f:
            migration_sql = f.read()
        
        # Execute migration
        cursor.executescript(migration_sql)
        conn.commit()
        
        print("✅ Migration 021 completed successfully!")
        print("   - Created offices table")
        print("   - Created meeting_bookings table")
        print("   - Created indexes")
        print("   - Inserted sample offices")
        
        # Verify tables
        cursor.execute("SELECT COUNT(*) FROM offices")
        office_count = cursor.fetchone()[0]
        print(f"   - Total offices: {office_count}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)

