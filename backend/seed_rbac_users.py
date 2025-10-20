#!/usr/bin/env python3
"""
Seed database with users of different roles for RBAC testing
"""
import sqlite3
import os
from app.core.security import get_password_hash

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'hr_app.db')

def seed_users():
    """Create test users with different roles"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Password: "password123" for all test users
    password = "password123"
    hashed = get_password_hash(password)
    
    test_users = [
        # Admins
        {
            'email': 'admin@pristinadata.com',
            'full_name': 'Admin User',
            'role': 'admin',
            'is_admin': 1,
            'job_role': 'System Administrator',
            'department_id': None
        },
        # Managers
        {
            'email': 'manager.it@pristinadata.com',
            'full_name': 'IT Manager',
            'role': 'manager',
            'is_admin': 0,
            'job_role': 'IT Department Manager',
            'department_id': 1  # Assuming IT department exists
        },
        {
            'email': 'manager.hr@pristinadata.com',
            'full_name': 'HR Manager',
            'role': 'manager',
            'is_admin': 0,
            'job_role': 'HR Department Manager',
            'department_id': 2  # Assuming HR department exists
        },
        # Employees
        {
            'email': 'employee1@pristinadata.com',
            'full_name': 'John Employee',
            'role': 'employee',
            'is_admin': 0,
            'job_role': 'Software Developer',
            'department_id': 1
        },
        {
            'email': 'employee2@pristinadata.com',
            'full_name': 'Jane Employee',
            'role': 'employee',
            'is_admin': 0,
            'job_role': 'Designer',
            'department_id': 1
        },
        {
            'email': 'employee3@pristinadata.com',
            'full_name': 'Bob Employee',
            'role': 'employee',
            'is_admin': 0,
            'job_role': 'HR Specialist',
            'department_id': 2
        },
    ]
    
    try:
        print("🌱 Seeding RBAC test users...")
        print(f"📝 Default password for all users: {password}")
        print()
        
        for user_data in test_users:
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = ?", (user_data['email'],))
            existing = cursor.fetchone()
            
            if existing:
                print(f"⚠️  User {user_data['email']} already exists, skipping...")
                continue
            
            # Insert user
            cursor.execute("""
                INSERT INTO users (
                    email, hashed_password, full_name, role, is_admin, 
                    job_role, department_id, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                user_data['email'],
                hashed,
                user_data['full_name'],
                user_data['role'],
                user_data['is_admin'],
                user_data['job_role'],
                user_data['department_id']
            ))
            
            print(f"✓ Created {user_data['role']}: {user_data['email']}")
        
        conn.commit()
        
        # Show summary
        print("\n📊 User role distribution:")
        cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        for role, count in cursor.fetchall():
            print(f"  {role}: {count} user(s)")
        
        print("\n✅ Seeding complete!")
        print("\n🔐 Login credentials:")
        print("   Email: Any from above")
        print(f"   Password: {password}")
        
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_users()

