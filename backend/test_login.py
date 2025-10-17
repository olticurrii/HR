from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

db = SessionLocal()

# Find user
user = db.query(User).filter(User.email == 'sarah.johnson@company.com').first()

if user:
    print(f"User found: {user.email}")
    print(f"User ID: {user.id}")
    print(f"Has password: {bool(user.hashed_password)}")
    
    # Test password
    test_password = "password123"
    is_valid = verify_password(test_password, user.hashed_password)
    print(f"Password 'password123' is valid: {is_valid}")
    
    if not is_valid:
        print("\nPassword is invalid! Let me reset it...")
        new_hash = get_password_hash(test_password)
        user.hashed_password = new_hash
        db.commit()
        print("Password has been reset to 'password123'")
        
        # Test again
        user = db.query(User).filter(User.email == 'sarah.johnson@company.com').first()
        is_valid = verify_password(test_password, user.hashed_password)
        print(f"Password now valid: {is_valid}")
else:
    print("User not found!")

db.close()

