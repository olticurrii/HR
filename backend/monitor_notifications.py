#!/usr/bin/env python3
"""
Monitor notifications in real-time
Run this in a terminal while testing to see notifications being created
"""

import sqlite3
import time
from datetime import datetime

def monitor_notifications():
    db_path = 'hr_app.db'
    
    # Get initial count
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM notifications")
    initial_count = cursor.fetchone()[0]
    conn.close()
    
    print(f"🔍 Monitoring notifications (initial count: {initial_count})")
    print("=" * 80)
    print("Waiting for new notifications...")
    print("(Try creating a task, sending a message, or posting feedback)")
    print("=" * 80)
    
    last_count = initial_count
    
    while True:
        try:
            time.sleep(2)  # Check every 2 seconds
            
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Get current count
            cursor.execute("SELECT COUNT(*) FROM notifications")
            current_count = cursor.fetchone()[0]
            
            # If count increased, show new notifications
            if current_count > last_count:
                new_count = current_count - last_count
                print(f"\n🔔 {new_count} NEW NOTIFICATION(S) at {datetime.now().strftime('%H:%M:%S')}!")
                print("-" * 80)
                
                # Get the new notifications
                cursor.execute("""
                    SELECT n.id, n.type, n.title, n.message, u.full_name, n.created_at
                    FROM notifications n
                    JOIN users u ON n.user_id = u.id
                    ORDER BY n.created_at DESC
                    LIMIT ?
                """, (new_count,))
                
                for notif_id, notif_type, title, message, user_name, created in cursor.fetchall():
                    print(f"  ID: {notif_id}")
                    print(f"  Type: {notif_type}")
                    print(f"  For: {user_name}")
                    print(f"  Title: {title}")
                    print(f"  Message: {message[:100]}...")
                    print(f"  Created: {created}")
                    print("-" * 80)
                
                last_count = current_count
            
            conn.close()
            
        except KeyboardInterrupt:
            print("\n\n✅ Monitoring stopped")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    monitor_notifications()

