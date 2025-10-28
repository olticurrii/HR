"""
Seed database with sample data for KPI calculations
Creates tasks, projects, and time entries for testing
"""

from datetime import datetime, timedelta
import random
from app.core.database import SessionLocal
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.time_entry import TimeEntry
from app.models.department import Department
from app.services.kpi_calculator import run_kpi_calculation_job

def seed_data():
    db = SessionLocal()
    
    print("🌱 Starting data seeding...")
    
    # Get admin user
    admin = db.query(User).filter(User.email == "admin@company.com").first()
    if not admin:
        print("❌ Admin user not found!")
        return
    
    print(f"✅ Found admin user: {admin.full_name}")
    
    # Create department if doesn't exist
    dept = db.query(Department).first()
    if not dept:
        dept = Department(
            name="Engineering",
            description="Engineering Department"
        )
        db.add(dept)
        db.commit()
        print("✅ Created Engineering department")
    
    # Create sample projects
    projects = []
    project_names = [
        "HR System Redesign",
        "Mobile App Development",
        "Innovation Lab - AI Features",
        "R&D: Performance Optimization",
        "Customer Portal",
    ]
    
    for title in project_names:
        existing = db.query(Project).filter(Project.title == title).first()
        if not existing:
            project = Project(
                title=title,
                description=f"Sample project: {title}",
                created_by=admin.id,
                created_at=datetime.utcnow() - timedelta(days=random.randint(30, 90))
            )
            db.add(project)
            projects.append(project)
    
    db.commit()
    print(f"✅ Created {len(projects)} projects")
    
    # Create sample tasks
    task_titles = [
        "Design user interface",
        "Implement authentication",
        "Setup database",
        "Write API endpoints",
        "Create documentation",
        "Review code changes",
        "Fix reported bugs",
        "Deploy to production",
        "Optimize performance",
        "Write unit tests",
        "Update dependencies",
        "Refactor legacy code",
        "Conduct user research",
        "Design new feature",
        "Implement dashboard",
        "Setup CI/CD pipeline",
        "Security audit",
        "Load testing",
        "Mobile responsiveness",
        "Accessibility improvements",
    ]
    
    tasks_created = 0
    for i, title in enumerate(task_titles):
        # Create task in the past
        created_date = datetime.utcnow() - timedelta(days=random.randint(1, 80))
        
        # Randomly assign status
        status_choice = random.choices(
            ['Done', 'In Progress', 'Todo'],
            weights=[70, 20, 10]  # Most done, some in progress
        )[0]
        
        # Set due date and completion
        due_date = created_date + timedelta(days=random.randint(5, 15))
        completed_at = None
        
        if status_choice == 'Done':
            # 80% on time, 20% late
            if random.random() < 0.8:
                completed_at = created_date + timedelta(days=random.randint(3, 10))
            else:
                completed_at = due_date + timedelta(days=random.randint(1, 5))
        
        task = Task(
            title=title,
            description=f"Sample task: {title}",
            status=status_choice,
            priority=random.choice(['Low', 'Medium', 'High']),
            assignee_id=admin.id,
            created_by=admin.id,
            due_date=due_date.isoformat() if due_date else None,
            completed_at=completed_at,
            created_at=created_date
        )
        db.add(task)
        tasks_created += 1
    
    db.commit()
    print(f"✅ Created {tasks_created} tasks")
    
    # Create sample time entries
    time_entries_created = 0
    for i in range(30):  # Last 30 days
        date = datetime.utcnow() - timedelta(days=i)
        
        # Random work hours (6-9 hours per day)
        hours = random.uniform(6, 9)
        
        entry = TimeEntry(
            user_id=admin.id,
            start_time=date.replace(hour=9, minute=0),
            end_time=date.replace(hour=9, minute=0) + timedelta(hours=hours),
            created_at=date
        )
        db.add(entry)
        time_entries_created += 1
    
    db.commit()
    print(f"✅ Created {time_entries_created} time entries")
    
    print("\n" + "="*60)
    print("🎯 Triggering KPI Calculation...")
    print("="*60)
    
    # Now run KPI calculations
    try:
        result = run_kpi_calculation_job(db, user_id=admin.id)
        print(f"✅ KPI calculation completed: {result}")
    except Exception as e:
        print(f"❌ KPI calculation failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    db.close()
    
    print("\n" + "="*60)
    print("✅ Data seeding complete!")
    print("="*60)
    print("\nYou can now:")
    print("1. Login at http://localhost:3000")
    print("2. Go to Performance → KPI Trends")
    print("3. See auto-calculated metrics!")

if __name__ == "__main__":
    seed_data()

