"""
Role management endpoints - Admin only
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.rbac import admin_only
from app.models.custom_role import CustomRole
from app.models.user import User
from app.models.role import RolePermission
from app.schemas.custom_role import (
    CustomRoleResponse,
    CustomRoleCreate,
    CustomRoleUpdate,
    RoleAssignmentRequest
)

router = APIRouter()


@router.get("/roles", response_model=List[CustomRoleResponse])
async def get_all_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Get all custom roles - Admin only"""
    roles = db.query(CustomRole).all()
    return roles


@router.get("/roles/{role_id}", response_model=CustomRoleResponse)
async def get_role_by_id(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Get a specific role by ID - Admin only"""
    role = db.query(CustomRole).filter(CustomRole.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return role


@router.post("/roles", response_model=CustomRoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_data: CustomRoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Create a new custom role - Admin only"""
    # Check if role already exists
    existing_role = db.query(CustomRole).filter(CustomRole.name == role_data.name).first()
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{role_data.name}' already exists"
        )
    
    # Validate role name (lowercase, no spaces)
    if ' ' in role_data.name or role_data.name != role_data.name.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name must be lowercase and contain no spaces"
        )
    
    # Create role
    new_role = CustomRole(
        name=role_data.name,
        display_name=role_data.display_name,
        description=role_data.description,
        is_system_role=False  # Custom roles are never system roles
    )
    
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    
    # Create default permissions for the new role (all disabled)
    resources = db.query(RolePermission.resource).distinct().all()
    for resource_tuple in resources:
        resource = resource_tuple[0]
        permission = RolePermission(
            role=new_role.name,
            resource=resource,
            can_view=False,
            can_create=False,
            can_edit=False,
            can_delete=False
        )
        db.add(permission)
    
    db.commit()
    
    return new_role


@router.put("/roles/{role_id}", response_model=CustomRoleResponse)
async def update_role(
    role_id: int,
    role_update: CustomRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Update a custom role - Admin only"""
    role = db.query(CustomRole).filter(CustomRole.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Cannot edit system roles
    if role.is_system_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit system roles (admin, manager, employee)"
        )
    
    # Update fields
    update_data = role_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(role, key, value)
    
    db.commit()
    db.refresh(role)
    
    return role


@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Delete a custom role - Admin only"""
    role = db.query(CustomRole).filter(CustomRole.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Cannot delete system roles
    if role.is_system_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system roles (admin, manager, employee)"
        )
    
    # Check if any users have this role
    users_with_role = db.query(User).filter(User.role == role.name).count()
    if users_with_role > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete role: {users_with_role} user(s) still have this role"
        )
    
    # Delete associated permissions
    db.query(RolePermission).filter(RolePermission.role == role.name).delete()
    
    # Delete role
    db.delete(role)
    db.commit()
    
    return {"message": f"Role '{role.name}' deleted successfully"}


@router.post("/roles/assign")
async def assign_role_to_user(
    assignment: RoleAssignmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Assign a role to a user - Admin only"""
    # Check if role exists
    role = db.query(CustomRole).filter(CustomRole.name == assignment.role_name).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{assignment.role_name}' not found"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.id == assignment.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from changing their own role
    if user.id == current_user.id and assignment.role_name != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own admin role"
        )
    
    # Assign role
    user.role = assignment.role_name
    user.is_admin = (assignment.role_name == "admin")
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"Role '{assignment.role_name}' assigned to user '{user.full_name}'",
        "user_id": user.id,
        "role": user.role
    }


@router.get("/roles/{role_name}/users")
async def get_users_by_role(
    role_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Get all users with a specific role - Admin only"""
    users = db.query(User).filter(User.role == role_name).all()
    
    return {
        "role": role_name,
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "department_id": user.department_id
            }
            for user in users
        ]
    }

