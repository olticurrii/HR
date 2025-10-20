#!/usr/bin/env python3
"""
Create an admin user
"""
import sqlite3
import os
from app.core.security import get_password_hash

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')

def create_admin():
    """Create an admin user"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("=" * 60)
    print("Create Admin User")
    print("=" * 60)
    
    # Get admin details
    email = input("Enter admin email: ").strip()
    full_name = input("Enter admin full name: ").strip()
    password = input("Enter password: ").strip()
    
    # Validate inputs
    if not email or not full_name or not password:
        print("❌ All fields are required!")
        conn.close()
        return
    
    try:
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()
        
        if existing:
            print(f"\n❌ User with email {email} already exists!")
            
            # Ask if they want to update to admin
            update = input("Would you like to update this user to admin? (yes/no): ").strip().lower()
            if update in ['yes', 'y']:
                cursor.execute("""
                    UPDATE users 
                    SET role = 'admin', is_admin = 1
                    WHERE email = ?
                """, (email,))
                conn.commit()
                print(f"✅ User {email} has been updated to admin!")
            
            conn.close()
            return
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create admin user
        cursor.execute("""
            INSERT INTO users (
                email, hashed_password, full_name, role, is_admin, is_active
            ) VALUES (?, ?, ?, 'admin', 1, 1)
        """, (email, hashed_password, full_name))
        
        conn.commit()
        
        print("\n" + "=" * 60)
        print("✅ Admin user created successfully!")
        print("=" * 60)
        print(f"Email: {email}")
        print(f"Name: {full_name}")
        print(f"Role: admin")
        print(f"Password: {password}")
        print("=" * 60)
        print("\n🔐 You can now login with these credentials")
        
    except Exception as e:
        print(f"\n❌ Error creating admin user: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin()

