"""
Permission management endpoints - Admin only
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.rbac import admin_only
from app.models.role import RolePermission
from app.models.user import User
from app.schemas.permission import (
    RolePermissionResponse,
    RolePermissionUpdate,
    PermissionCheckRequest,
    PermissionCheckResponse
)

router = APIRouter()


@router.get("/permissions", response_model=List[RolePermissionResponse])
async def get_all_permissions(
    role: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Get all role permissions, optionally filtered by role - Admin only"""
    query = db.query(RolePermission)
    
    if role:
        query = query.filter(RolePermission.role == role)
    
    permissions = query.all()
    return permissions


@router.get("/permissions/roles", response_model=List[str])
async def get_available_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Get list of all roles with permissions - Admin only"""
    roles = db.query(RolePermission.role).distinct().all()
    return [role[0] for role in roles]


@router.get("/permissions/resources", response_model=List[str])
async def get_available_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Get list of all resources - Admin only"""
    resources = db.query(RolePermission.resource).distinct().all()
    return [resource[0] for resource in resources]


@router.get("/permissions/{role}/{resource}", response_model=RolePermissionResponse)
async def get_permission_by_role_resource(
    role: str,
    resource: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Get specific permission for a role and resource - Admin only"""
    permission = db.query(RolePermission).filter(
        RolePermission.role == role,
        RolePermission.resource == resource
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Permission not found for role '{role}' and resource '{resource}'"
        )
    
    return permission


@router.patch("/permissions/{role}/{resource}", response_model=RolePermissionResponse)
async def update_permission(
    role: str,
    resource: str,
    permission_update: RolePermissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Update permissions for a specific role and resource - Admin only"""
    permission = db.query(RolePermission).filter(
        RolePermission.role == role,
        RolePermission.resource == resource
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Permission not found for role '{role}' and resource '{resource}'"
        )
    
    # Prevent admin from removing their own admin permissions
    if role == "admin" and current_user.role == "admin":
        # Check if trying to remove critical admin permissions
        update_data = permission_update.model_dump(exclude_unset=True)
        if any(value is False for value in update_data.values()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove admin role permissions to prevent lockout"
            )
    
    # Update permission
    update_data = permission_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(permission, key, value)
    
    db.commit()
    db.refresh(permission)
    
    return permission


@router.post("/permissions/check", response_model=PermissionCheckResponse)
async def check_permission(
    check_request: PermissionCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_db)
):
    """Check if current user has a specific permission"""
    permission = db.query(RolePermission).filter(
        RolePermission.role == current_user.role,
        RolePermission.resource == check_request.resource
    ).first()
    
    if not permission:
        return PermissionCheckResponse(
            has_permission=False,
            role=current_user.role,
            resource=check_request.resource,
            action=check_request.action
        )
    
    # Check the requested action
    has_permission = False
    if check_request.action == "view":
        has_permission = permission.can_view
    elif check_request.action == "create":
        has_permission = permission.can_create
    elif check_request.action == "edit":
        has_permission = permission.can_edit
    elif check_request.action == "delete":
        has_permission = permission.can_delete
    
    return PermissionCheckResponse(
        has_permission=has_permission,
        role=current_user.role,
        resource=check_request.resource,
        action=check_request.action
    )


@router.post("/permissions/bulk-update")
async def bulk_update_permissions(
    updates: List[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Bulk update multiple permissions - Admin only"""
    updated_count = 0
    
    for update in updates:
        role = update.get("role")
        resource = update.get("resource")
        
        permission = db.query(RolePermission).filter(
            RolePermission.role == role,
            RolePermission.resource == resource
        ).first()
        
        if permission:
            # Prevent admin from removing their own admin permissions
            if role == "admin" and current_user.role == "admin":
                continue
            
            if "can_view" in update:
                permission.can_view = update["can_view"]
            if "can_create" in update:
                permission.can_create = update["can_create"]
            if "can_edit" in update:
                permission.can_edit = update["can_edit"]
            if "can_delete" in update:
                permission.can_delete = update["can_delete"]
            
            updated_count += 1
    
    db.commit()
    
    return {
        "message": f"Successfully updated {updated_count} permissions",
        "updated_count": updated_count
    }

