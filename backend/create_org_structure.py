from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from app.core.database import engine
from app.models.user import User
from app.models.department import Department
from app.core.security import get_password_hash

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Create departments with conflict resolution
    departments_data = [
        {"name": "Executive", "description": "C-Suite and executive leadership"},
        {"name": "Engineering", "description": "Software development and technical operations"},
        {"name": "Sales", "description": "Customer acquisition and sales operations"},
        {"name": "Marketing", "description": "Brand management and marketing campaigns"},
        {"name": "Human Resources", "description": "Employee relations and HR operations"},
        {"name": "Finance", "description": "Financial planning and accounting"},
        {"name": "Operations", "description": "Business operations and logistics"},
        {"name": "Customer Success", "description": "Customer support and success"},
    ]
    
    dept_objects = []
    for dept_data in departments_data:
        stmt = sqlite_insert(Department).values(**dept_data).on_conflict_do_nothing(index_elements=["name"])
        db.execute(stmt)
    
    db.commit()
    
    # Get department objects
    dept_objects = db.query(Department).all()
    dept_dict = {dept.name: dept for dept in dept_objects}
    
    # Create comprehensive organizational structure with many more users
    users_data = [
        # C-Suite
        {
            "email": "sarah.johnson@company.com",
            "full_name": "Sarah Johnson",
            "job_role": "Chief Executive Officer",
            "department_id": dept_dict["Executive"].id,
            "is_admin": True,
            "is_active": True,
            "manager_id": None,
        },
        
        # VPs (reporting to CEO)
        {
            "email": "michael.chen@company.com",
            "full_name": "Michael Chen",
            "job_role": "Chief Technology Officer",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "greg.rodriguez@company.com",
            "full_name": "Greg Rodriguez",
            "job_role": "VP of Sales",
            "department_id": dept_dict["Sales"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "david.miller@company.com",
            "full_name": "David Miller",
            "job_role": "VP of Marketing",
            "department_id": dept_dict["Marketing"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "lisa.patel@company.com",
            "full_name": "Lisa Patel",
            "job_role": "VP of Finance",
            "department_id": dept_dict["Finance"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "robert.taylor@company.com",
            "full_name": "Robert Taylor",
            "job_role": "VP of Operations",
            "department_id": dept_dict["Operations"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        
        # Directors/Senior Managers
        {
            "email": "alex.thompson@company.com",
            "full_name": "Alex Thompson",
            "job_role": "Engineering Director",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "james.brown@company.com",
            "full_name": "James Brown",
            "job_role": "Sales Director",
            "department_id": dept_dict["Sales"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "maria.garcia@company.com",
            "full_name": "Maria Garcia",
            "job_role": "Marketing Director",
            "department_id": dept_dict["Marketing"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "jennifer.lee@company.com",
            "full_name": "Jennifer Lee",
            "job_role": "HR Director",
            "department_id": dept_dict["Human Resources"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "kevin.wong@company.com",
            "full_name": "Kevin Wong",
            "job_role": "Finance Director",
            "department_id": dept_dict["Finance"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "amanda.clark@company.com",
            "full_name": "Amanda Clark",
            "job_role": "Operations Director",
            "department_id": dept_dict["Operations"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        
        # Managers
        {
            "email": "daniel.kim@company.com",
            "full_name": "Daniel Kim",
            "job_role": "Engineering Manager",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "sarah.williams@company.com",
            "full_name": "Sarah Williams",
            "job_role": "Product Manager",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "chris.anderson@company.com",
            "full_name": "Chris Anderson",
            "job_role": "Sales Manager",
            "department_id": dept_dict["Sales"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "rachel.moore@company.com",
            "full_name": "Rachel Moore",
            "job_role": "Marketing Manager",
            "department_id": dept_dict["Marketing"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "tom.davis@company.com",
            "full_name": "Tom Davis",
            "job_role": "Customer Success Manager",
            "department_id": dept_dict["Customer Success"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        
        # Individual Contributors - Engineering
        {
            "email": "marcus.williams@company.com",
            "full_name": "Marcus Williams",
            "job_role": "Senior Software Engineer",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "sophia.martinez@company.com",
            "full_name": "Sophia Martinez",
            "job_role": "Frontend Developer",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "jake.thompson@company.com",
            "full_name": "Jake Thompson",
            "job_role": "Backend Developer",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "emily.chen@company.com",
            "full_name": "Emily Chen",
            "job_role": "DevOps Engineer",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "ryan.johnson@company.com",
            "full_name": "Ryan Johnson",
            "job_role": "QA Engineer",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "olivia.brown@company.com",
            "full_name": "Olivia Brown",
            "job_role": "UI/UX Designer",
            "department_id": dept_dict["Engineering"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        
        # Individual Contributors - Sales
        {
            "email": "amanda.white@company.com",
            "full_name": "Amanda White",
            "job_role": "Senior Sales Associate",
            "department_id": dept_dict["Sales"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "mike.rodriguez@company.com",
            "full_name": "Mike Rodriguez",
            "job_role": "Account Executive",
            "department_id": dept_dict["Sales"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "lisa.nguyen@company.com",
            "full_name": "Lisa Nguyen",
            "job_role": "Sales Development Rep",
            "department_id": dept_dict["Sales"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "david.kim@company.com",
            "full_name": "David Kim",
            "job_role": "Business Development",
            "department_id": dept_dict["Sales"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        
        # Individual Contributors - Marketing
        {
            "email": "nicole.davis@company.com",
            "full_name": "Nicole Davis",
            "job_role": "Marketing Specialist",
            "department_id": dept_dict["Marketing"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "brian.wilson@company.com",
            "full_name": "Brian Wilson",
            "job_role": "Content Writer",
            "department_id": dept_dict["Marketing"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "jessica.taylor@company.com",
            "full_name": "Jessica Taylor",
            "job_role": "Social Media Manager",
            "department_id": dept_dict["Marketing"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "alex.miller@company.com",
            "full_name": "Alex Miller",
            "job_role": "Digital Marketing Specialist",
            "department_id": dept_dict["Marketing"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        
        # Individual Contributors - Other Departments
        {
            "email": "sarah.jones@company.com",
            "full_name": "Sarah Jones",
            "job_role": "HR Specialist",
            "department_id": dept_dict["Human Resources"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "michael.smith@company.com",
            "full_name": "Michael Smith",
            "job_role": "Financial Analyst",
            "department_id": dept_dict["Finance"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "ashley.garcia@company.com",
            "full_name": "Ashley Garcia",
            "job_role": "Operations Coordinator",
            "department_id": dept_dict["Operations"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "brandon.lee@company.com",
            "full_name": "Brandon Lee",
            "job_role": "Customer Success Specialist",
            "department_id": dept_dict["Customer Success"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
        {
            "email": "michelle.wang@company.com",
            "full_name": "Michelle Wang",
            "job_role": "Customer Support Rep",
            "department_id": dept_dict["Customer Success"].id,
            "is_admin": False,
            "is_active": True,
            "manager_id": None,
        },
    ]
    
    # Create users with conflict resolution
    users = []
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            users.append(existing_user)
            continue
            
        user_data["hashed_password"] = get_password_hash("password123")
        user = User(**user_data)
        db.add(user)
        users.append(user)
    
    db.commit()
    
    # Refresh users from database to get IDs
    users = db.query(User).all()
    user_dict = {user.email: user for user in users}
    
    # Set up comprehensive reporting structure
    # CEO reports to no one (already None)
    
    # VPs report to CEO
    user_dict["michael.chen@company.com"].manager_id = user_dict["sarah.johnson@company.com"].id
    user_dict["greg.rodriguez@company.com"].manager_id = user_dict["sarah.johnson@company.com"].id
    user_dict["david.miller@company.com"].manager_id = user_dict["sarah.johnson@company.com"].id
    user_dict["lisa.patel@company.com"].manager_id = user_dict["sarah.johnson@company.com"].id
    user_dict["robert.taylor@company.com"].manager_id = user_dict["sarah.johnson@company.com"].id
    
    # Directors report to their respective VPs
    user_dict["alex.thompson@company.com"].manager_id = user_dict["michael.chen@company.com"].id  # Eng Director -> CTO
    user_dict["james.brown@company.com"].manager_id = user_dict["greg.rodriguez@company.com"].id  # Sales Director -> VP Sales
    user_dict["maria.garcia@company.com"].manager_id = user_dict["david.miller@company.com"].id  # Marketing Director -> VP Marketing
    user_dict["jennifer.lee@company.com"].manager_id = user_dict["sarah.johnson@company.com"].id  # HR Director -> CEO
    user_dict["kevin.wong@company.com"].manager_id = user_dict["lisa.patel@company.com"].id  # Finance Director -> VP Finance
    user_dict["amanda.clark@company.com"].manager_id = user_dict["robert.taylor@company.com"].id  # Operations Director -> VP Operations
    
    # Managers report to their Directors
    user_dict["daniel.kim@company.com"].manager_id = user_dict["alex.thompson@company.com"].id  # Eng Manager -> Eng Director
    user_dict["sarah.williams@company.com"].manager_id = user_dict["alex.thompson@company.com"].id  # Product Manager -> Eng Director
    user_dict["chris.anderson@company.com"].manager_id = user_dict["james.brown@company.com"].id  # Sales Manager -> Sales Director
    user_dict["rachel.moore@company.com"].manager_id = user_dict["maria.garcia@company.com"].id  # Marketing Manager -> Marketing Director
    user_dict["tom.davis@company.com"].manager_id = user_dict["robert.taylor@company.com"].id  # Customer Success Manager -> VP Operations
    
    # Individual Contributors - Engineering
    user_dict["marcus.williams@company.com"].manager_id = user_dict["daniel.kim@company.com"].id  # Senior Software Engineer -> Eng Manager
    user_dict["sophia.martinez@company.com"].manager_id = user_dict["daniel.kim@company.com"].id  # Frontend Developer -> Eng Manager
    user_dict["jake.thompson@company.com"].manager_id = user_dict["daniel.kim@company.com"].id  # Backend Developer -> Eng Manager
    user_dict["emily.chen@company.com"].manager_id = user_dict["daniel.kim@company.com"].id  # DevOps Engineer -> Eng Manager
    user_dict["ryan.johnson@company.com"].manager_id = user_dict["sarah.williams@company.com"].id  # QA Engineer -> Product Manager
    user_dict["olivia.brown@company.com"].manager_id = user_dict["sarah.williams@company.com"].id  # UI/UX Designer -> Product Manager
    
    # Individual Contributors - Sales
    user_dict["amanda.white@company.com"].manager_id = user_dict["chris.anderson@company.com"].id  # Senior Sales Associate -> Sales Manager
    user_dict["mike.rodriguez@company.com"].manager_id = user_dict["chris.anderson@company.com"].id  # Account Executive -> Sales Manager
    user_dict["lisa.nguyen@company.com"].manager_id = user_dict["chris.anderson@company.com"].id  # Sales Development Rep -> Sales Manager
    user_dict["david.kim@company.com"].manager_id = user_dict["chris.anderson@company.com"].id  # Business Development -> Sales Manager
    
    # Individual Contributors - Marketing
    user_dict["nicole.davis@company.com"].manager_id = user_dict["rachel.moore@company.com"].id  # Marketing Specialist -> Marketing Manager
    user_dict["brian.wilson@company.com"].manager_id = user_dict["rachel.moore@company.com"].id  # Content Writer -> Marketing Manager
    user_dict["jessica.taylor@company.com"].manager_id = user_dict["rachel.moore@company.com"].id  # Social Media Manager -> Marketing Manager
    user_dict["alex.miller@company.com"].manager_id = user_dict["rachel.moore@company.com"].id  # Digital Marketing Specialist -> Marketing Manager
    
    # Individual Contributors - Other Departments
    user_dict["sarah.jones@company.com"].manager_id = user_dict["jennifer.lee@company.com"].id  # HR Specialist -> HR Director
    user_dict["michael.smith@company.com"].manager_id = user_dict["kevin.wong@company.com"].id  # Financial Analyst -> Finance Director
    user_dict["ashley.garcia@company.com"].manager_id = user_dict["amanda.clark@company.com"].id  # Operations Coordinator -> Operations Director
    user_dict["brandon.lee@company.com"].manager_id = user_dict["tom.davis@company.com"].id  # Customer Success Specialist -> Customer Success Manager
    user_dict["michelle.wang@company.com"].manager_id = user_dict["tom.davis@company.com"].id  # Customer Support Rep -> Customer Success Manager
    
    db.commit()
    
    print("✅ Comprehensive organizational structure created successfully!")
    print(f"🏢 Total Users: {len(users)}")
    print(f"🏢 Departments: {len(dept_dict)}")
    print("👑 CEO: Sarah Johnson")
    print("👥 VPs: Michael Chen (CTO), Greg Rodriguez (VP Sales), David Miller (VP Marketing), Lisa Patel (VP Finance), Robert Taylor (VP Operations)")
    print("👨‍💼 Directors: Alex Thompson (Eng), James Brown (Sales), Maria Garcia (Marketing), Jennifer Lee (HR), Kevin Wong (Finance), Amanda Clark (Operations)")
    print("👨‍💻 Managers & ICs: 20+ employees across all departments")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
