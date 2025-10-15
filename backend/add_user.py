#!/usr/bin/env python3
"""
Script to add a new user to the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from app.core.database import engine
from app.models.user import User
from app.models.department import Department
from app.core.security import get_password_hash

def add_new_user():
    """Add a new user to the database"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get the first department (Engineering)
        department = db.query(Department).first()
        
        if not department:
            print("❌ No departments found. Please run init_db.py first.")
            return
        
        # Create new user
        new_user = User(
            full_name="Sarah Wilson",
            email="sarah.wilson@company.com",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            is_admin=False,
            job_role="UX Designer",
            department_id=department.id,
            phone="+1-555-0123",
            avatar_url=None
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print("✅ New user created successfully!")
        print(f"👤 User: {new_user.full_name}")
        print(f"📧 Email: {new_user.email}")
        print(f"🔑 Password: password123")
        print(f"🏢 Department: {department.name}")
        print(f"💼 Job Role: {new_user.job_role}")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_new_user()
