#!/usr/bin/env python3
"""
Create test notifications for all users
"""

import sqlite3
from datetime import datetime
import json

def create_test_notifications():
    # Connect to database
    db_path = 'hr_app.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all users
    cursor.execute("SELECT id, email, full_name FROM users WHERE is_active = 1")
    users = cursor.fetchall()
    
    if not users:
        print("❌ No users found in database")
        conn.close()
        return
    
    print(f"✅ Found {len(users)} active users")
    
    # Create test notifications for each user
    for user_id, email, full_name in users:
        # Create a welcome notification
        cursor.execute("""
            INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            'task_assigned',
            '🎉 Welcome to the Notification System!',
            f'Hi {full_name}! Your notification system is now fully operational. You will receive real-time updates for tasks, messages, feedback, and more.',
            json.dumps({'test': True}),
            False,
            datetime.utcnow().isoformat()
        ))
        
        # Create a second test notification
        cursor.execute("""
            INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            'private_message',
            '💬 Test Message Notification',
            'This is a test message notification. Click to view!',
            json.dumps({'chat_id': 1, 'test': True}),
            False,
            datetime.utcnow().isoformat()
        ))
        
        print(f"✅ Created 2 test notifications for {full_name} ({email})")
    
    conn.commit()
    conn.close()
    
    print(f"\n🎉 Successfully created test notifications for {len(users)} users!")
    print("\n📋 Next steps:")
    print("1. Refresh your browser")
    print("2. Look for the notification bell (🔔) in the header")
    print("3. Click it to see your notifications")
    print("4. You should see a red badge with the number 2")

if __name__ == "__main__":
    create_test_notifications()

