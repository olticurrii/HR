#!/usr/bin/env python3
"""
Database initialization script for HR Management System
Creates tables and populates with sample data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, SessionLocal, init_database
from app.models import User, Department, Task, Project, ChatRoom, Message, Role, Permission
from app.core.security import get_password_hash
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

def create_sample_data():
    """Create sample data for testing"""
    db = SessionLocal()
    
    try:
        # Create departments
        departments_data = [
            {"name": "Engineering", "description": "Software development and technical operations"},
            {"name": "Human Resources", "description": "Employee relations and HR operations"},
            {"name": "Marketing", "description": "Brand management and marketing campaigns"},
            {"name": "Sales", "description": "Customer acquisition and sales operations"},
            {"name": "Finance", "description": "Financial planning and accounting"},
        ]
        
        departments = []
        for dept_data in departments_data:
            dept = Department(**dept_data)
            db.add(dept)
            departments.append(dept)
        
        db.commit()
        
        # Create users
        users_data = [
            {
                "email": "admin@company.com",
                "full_name": "Admin User",
                "job_role": "System Administrator",
                "department_id": departments[1].id,  # HR
                "is_admin": True,
                "is_active": True,
            },
            {
                "email": "john.doe@company.com",
                "full_name": "John Doe",
                "job_role": "Software Engineer",
                "department_id": departments[0].id,  # Engineering
                "is_admin": False,
                "is_active": True,
            },
            {
                "email": "jane.smith@company.com",
                "full_name": "Jane Smith",
                "job_role": "Marketing Manager",
                "department_id": departments[2].id,  # Marketing
                "is_admin": False,
                "is_active": True,
            },
            {
                "email": "mike.johnson@company.com",
                "full_name": "Mike Johnson",
                "job_role": "Sales Representative",
                "department_id": departments[3].id,  # Sales
                "is_admin": False,
                "is_active": True,
            },
            {
                "email": "sarah.wilson@company.com",
                "full_name": "Sarah Wilson",
                "job_role": "Financial Analyst",
                "department_id": departments[4].id,  # Finance
                "is_admin": False,
                "is_active": True,
            },
            {
                "email": "alex.brown@company.com",
                "full_name": "Alex Brown",
                "job_role": "Senior Developer",
                "department_id": departments[0].id,  # Engineering
                "is_admin": False,
                "is_active": True,
            },
        ]
        
        users = []
        for user_data in users_data:
            # Use the proper password hashing function
            password = "password123"
            user_data["hashed_password"] = get_password_hash(password)
            user = User(**user_data)
            db.add(user)
            users.append(user)
        
        db.commit()
        
        # Set department managers
        departments[0].manager_id = users[1].id  # John Doe manages Engineering
        departments[1].manager_id = users[0].id  # Admin manages HR
        departments[2].manager_id = users[2].id  # Jane Smith manages Marketing
        departments[3].manager_id = users[3].id  # Mike Johnson manages Sales
        departments[4].manager_id = users[4].id  # Sarah Wilson manages Finance
        
        # Create projects
        projects_data = [
            {
                "title": "Website Redesign",
                "description": "Complete redesign of company website",
                "created_by": users[2].id,  # Jane Smith
            },
            {
                "title": "Mobile App Development",
                "description": "Development of mobile application",
                "created_by": users[1].id,  # John Doe
            },
            {
                "title": "Q4 Sales Campaign",
                "description": "Quarterly sales campaign planning",
                "created_by": users[3].id,  # Mike Johnson
            },
        ]
        
        projects = []
        for project_data in projects_data:
            project = Project(**project_data)
            db.add(project)
            projects.append(project)
        
        db.commit()
        
        # Create tasks
        tasks_data = [
            {
                "title": "Design homepage mockup",
                "description": "Create wireframes and design for new homepage",
                "assignee_id": users[1].id,  # John Doe
                "created_by": users[2].id,   # Jane Smith
                "project_id": projects[0].id,
                "position": 1,
                "status": "in_progress",
                "priority": "high",
            },
            {
                "title": "Setup development environment",
                "description": "Configure local development setup",
                "assignee_id": users[5].id,  # Alex Brown
                "created_by": users[1].id,   # John Doe
                "project_id": projects[1].id,
                "position": 1,
                "status": "pending",
                "priority": "medium",
            },
            {
                "title": "Research target audience",
                "description": "Conduct market research for Q4 campaign",
                "assignee_id": users[2].id,  # Jane Smith
                "created_by": users[3].id,   # Mike Johnson
                "project_id": projects[2].id,
                "position": 1,
                "status": "completed",
                "priority": "high",
            },
            {
                "title": "Review financial reports",
                "description": "Analyze Q3 financial performance",
                "assignee_id": users[4].id,  # Sarah Wilson
                "created_by": users[0].id,   # Admin
                "position": 1,
                "status": "pending",
                "priority": "medium",
            },
        ]
        
        for task_data in tasks_data:
            task = Task(**task_data)
            db.add(task)
        
        db.commit()
        
        # Create some chat rooms and messages
        # Private chat between John and Jane
        private_chat = ChatRoom(type="private")
        db.add(private_chat)
        db.flush()
        
        # Add participants to private chat
        from app.models.chat import chat_participants
        db.execute(
            chat_participants.insert().values([
                {"chat_id": private_chat.id, "user_id": users[1].id},  # John
                {"chat_id": private_chat.id, "user_id": users[2].id},  # Jane
            ])
        )
        
        # Create some sample messages
        messages_data = [
            {
                "text": "Hey Jane, how's the website redesign going?",
                "sender_id": users[1].id,  # John
                "chat_id": private_chat.id,
            },
            {
                "text": "Going well! I'm working on the homepage mockup. Should have it ready by tomorrow.",
                "sender_id": users[2].id,  # Jane
                "chat_id": private_chat.id,
            },
            {
                "text": "Great! Let me know if you need any technical input.",
                "sender_id": users[1].id,  # John
                "chat_id": private_chat.id,
            },
        ]
        
        for msg_data in messages_data:
            message = Message(**msg_data)
            db.add(message)
        
        db.commit()
        
        print("✅ Sample data created successfully!")
        print(f"📊 Created {len(departments)} departments")
        print(f"👥 Created {len(users)} users")
        print(f"📁 Created {len(projects)} projects")
        print(f"📋 Created {len(tasks_data)} tasks")
        print(f"💬 Created 1 private chat with {len(messages_data)} messages")
        print("\n🔑 Login credentials:")
        print("   Admin: admin@company.com / password123")
        print("   User:  john.doe@company.com / password123")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    """Main function to initialize database"""
    print("🚀 Initializing HR Management System Database...")
    
    try:
        # Initialize database tables
        print("📦 Creating database tables...")
        init_database()
        print("✅ Database tables created successfully!")
        
        # Create sample data
        print("📝 Creating sample data...")
        create_sample_data()
        
        print("\n🎉 Database initialization completed successfully!")
        print("🚀 You can now start the backend server with: uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
