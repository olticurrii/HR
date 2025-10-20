#!/usr/bin/env python3
"""
Test notifications by watching database in real-time
This helps verify that notifications ARE being created when events happen
"""

import sqlite3
import time
import sys

def watch_notifications():
    db_path = 'hr_app.db'
    
    print("🔍 LIVE NOTIFICATION WATCHER")
    print("=" * 80)
    
    # Get initial count
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM notifications")
    initial_count = cursor.fetchone()[0]
    print(f"📊 Current notification count: {initial_count}")
    
    # Show recent notifications
    cursor.execute("""
        SELECT n.id, n.type, n.title, u.full_name as recipient, n.created_at, n.is_read
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        ORDER BY n.created_at DESC
        LIMIT 5
    """)
    
    print("\n📝 Last 5 notifications:")
    print("-" * 80)
    for row in cursor.fetchall():
        notif_id, notif_type, title, recipient, created, is_read = row
        status = "✓ Read" if is_read else "• Unread"
        print(f"  {status} | [{notif_type:20}] {title[:40]:40} → {recipient}")
    
    conn.close()
    
    print("\n" + "=" * 80)
    print("👀 NOW WATCHING FOR NEW NOTIFICATIONS...")
    print("=" * 80)
    print("\n🧪 Test by doing these actions in your web app:")
    print("   1. Create a task and assign it to someone")
    print("   2. Send a chat message to another user")
    print("   3. Post feedback to someone")
    print("   4. Reply to a comment")
    print("\nPress Ctrl+C to stop watching\n")
    
    last_count = initial_count
    
    try:
        while True:
            time.sleep(1)  # Check every second
            
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM notifications")
            current_count = cursor.fetchone()[0]
            
            if current_count > last_count:
                new_count = current_count - last_count
                
                # Get the new notification(s)
                cursor.execute("""
                    SELECT n.id, n.type, n.title, n.message, u.full_name, n.created_at
                    FROM notifications n
                    JOIN users u ON n.user_id = u.id
                    ORDER BY n.id DESC
                    LIMIT ?
                """, (new_count,))
                
                print(f"\n🎉 {new_count} NEW NOTIFICATION(S) DETECTED!")
                print("=" * 80)
                
                for notif_id, notif_type, title, message, user_name, created in cursor.fetchall():
                    print(f"  🔔 Notification ID: {notif_id}")
                    print(f"     Type: {notif_type}")
                    print(f"     Recipient: {user_name}")
                    print(f"     Title: {title}")
                    print(f"     Message: {message}")
                    print(f"     Created: {created}")
                    print("-" * 80)
                
                last_count = current_count
                print(f"✅ Notification count is now: {current_count}")
                print(f"👀 Continue watching for more...\n")
            
            conn.close()
            
    except KeyboardInterrupt:
        print("\n\n✅ Stopped watching. Final count: {}\n".format(last_count))
        sys.exit(0)

if __name__ == "__main__":
    watch_notifications()

