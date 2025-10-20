"""
Admin-only endpoints for user management and RBAC
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.core.database import get_db
from app.core.rbac import admin_only
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.core.security import get_password_hash
from pydantic import BaseModel, EmailStr


router = APIRouter()


class UserRoleUpdate(BaseModel):
    """Schema for updating user role"""
    role: str


class AdminUserCreate(BaseModel):
    """Schema for admin creating a user"""
    email: EmailStr
    full_name: str
    password: str
    role: str = "employee"  # System role
    custom_roles: list[str] | None = None  # Additional custom roles
    job_role: str | None = None
    department_id: int | None = None
    phone: str | None = None


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Get all users - Admin only"""
    users = db.query(User).offset(skip).limit(limit).all()
    
    # Build response with department names and custom roles
    result = []
    for user in users:
        # Get custom roles for this user
        custom_roles_result = db.execute(
            text("SELECT role_name FROM user_custom_roles WHERE user_id = :user_id"),
            {"user_id": user.id}
        ).fetchall()
        custom_roles = [row[0] for row in custom_roles_result]
        
        user_dict = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "job_role": user.job_role,
            "department_id": user.department_id,
            "role": user.role,
            "custom_roles": custom_roles,
            "phone": user.phone,
            "avatar_url": user.avatar_url,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "hire_date": user.hire_date,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "department_name": user.department.name if user.department else None
        }
        result.append(user_dict)
    
    return result


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Get a specific user by ID - Admin only"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get custom roles
    custom_roles_result = db.execute(
        text("SELECT role_name FROM user_custom_roles WHERE user_id = :user_id"),
        {"user_id": user.id}
    ).fetchall()
    custom_roles = [row[0] for row in custom_roles_result]
    
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "job_role": user.job_role,
        "department_id": user.department_id,
        "role": user.role,
        "custom_roles": custom_roles,
        "phone": user.phone,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "hire_date": user.hire_date,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "department_name": user.department.name if user.department else None
    }


@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Create a new user - Admin only"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate role
    valid_roles = ["admin", "manager", "employee"]
    if user_data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role,
        job_role=user_data.job_role,
        department_id=user_data.department_id,
        phone=user_data.phone,
        is_admin=(user_data.role == "admin")  # Sync with is_admin flag
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Add custom roles if provided
    custom_roles = []
    if user_data.custom_roles:
        for role_name in user_data.custom_roles:
            # Verify role exists in custom_roles table
            role_exists = db.execute(
                text("SELECT 1 FROM custom_roles WHERE name = :name AND is_system_role = 0"),
                {"name": role_name}
            ).fetchone()
            
            if role_exists:
                db.execute(
                    text("INSERT INTO user_custom_roles (user_id, role_name) VALUES (:user_id, :role_name)"),
                    {"user_id": new_user.id, "role_name": role_name}
                )
                custom_roles.append(role_name)
        
        db.commit()
    
    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "job_role": new_user.job_role,
        "department_id": new_user.department_id,
        "role": new_user.role,
        "custom_roles": custom_roles,
        "phone": new_user.phone,
        "avatar_url": new_user.avatar_url,
        "is_active": new_user.is_active,
        "is_admin": new_user.is_admin,
        "hire_date": new_user.hire_date,
        "created_at": new_user.created_at,
        "updated_at": new_user.updated_at,
        "department_name": new_user.department.name if new_user.department else None
    }


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Update a user - Admin only"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Handle custom roles separately
    custom_roles_to_update = update_data.pop('custom_roles', None)
    
    # Validate role if it's being updated
    if 'role' in update_data:
        valid_roles = ["admin", "manager", "employee"]
        if update_data['role'] not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
        # Sync is_admin flag
        user.is_admin = (update_data['role'] == "admin")
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    
    # Update custom roles if provided
    if custom_roles_to_update is not None:
        # Remove existing custom roles
        db.execute(text("DELETE FROM user_custom_roles WHERE user_id = :user_id"), {"user_id": user.id})
        
        # Add new custom roles
        for role_name in custom_roles_to_update:
            # Verify role exists and is not a system role
            role_exists = db.execute(
                text("SELECT 1 FROM custom_roles WHERE name = :name AND is_system_role = 0"),
                {"name": role_name}
            ).fetchone()
            
            if role_exists:
                db.execute(
                    text("INSERT INTO user_custom_roles (user_id, role_name) VALUES (:user_id, :role_name)"),
                    {"user_id": user.id, "role_name": role_name}
                )
        
        db.commit()
    
    db.refresh(user)
    
    # Get custom roles for response
    custom_roles_result = db.execute(
        text("SELECT role_name FROM user_custom_roles WHERE user_id = :user_id"),
        {"user_id": user.id}
    ).fetchall()
    custom_roles = [row[0] for row in custom_roles_result]
    
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "job_role": user.job_role,
        "department_id": user.department_id,
        "role": user.role,
        "custom_roles": custom_roles,
        "phone": user.phone,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "hire_date": user.hire_date,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "department_name": user.department.name if user.department else None
    }


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Update user role - Admin only"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate role
    valid_roles = ["admin", "manager", "employee"]
    if role_update.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Prevent admin from removing their own admin role
    if user.id == current_user.id and role_update.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove your own admin privileges"
        )
    
    user.role = role_update.role
    user.is_admin = (role_update.role == "admin")  # Sync is_admin flag
    
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "job_role": user.job_role,
        "department_id": user.department_id,
        "role": user.role,
        "phone": user.phone,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "hire_date": user.hire_date,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "department_name": user.department.name if user.department else None
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Delete a user - Admin only"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user.email} deleted successfully"}


@router.get("/role-options")
async def get_available_role_options(current_user: User = Depends(admin_only)):
    """Get list of available system role options for dropdowns - Admin only"""
    return {
        "roles": [
            {"value": "admin", "label": "Administrator", "description": "Full system access"},
            {"value": "manager", "label": "Manager", "description": "Can manage team and department"},
            {"value": "employee", "label": "Employee", "description": "Standard user access"}
        ]
    }

@router.get("/custom-roles")
async def get_custom_roles(db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    """Get list of custom roles (non-system roles) - Admin only"""
    custom_roles = db.execute(
        text("SELECT name, display_name, description FROM custom_roles WHERE is_system_role = 0")
    ).fetchall()
    
    return {
        "custom_roles": [
            {
                "value": row[0],
                "label": row[1],
                "description": row[2] or ""
            }
            for row in custom_roles
        ]
    }

