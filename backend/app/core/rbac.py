"""
RBAC Dependencies and utilities for FastAPI
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Callable
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.core.roles import UserRole, Permission, has_permission


def role_required(*allowed_roles: str):
    """
    Dependency factory to check if user has one of the allowed roles
    
    Usage:
        @router.get("/admin/dashboard")
        def admin_route(current_user: User = Depends(role_required("admin"))):
            return {"message": "Admin access granted"}
    """
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return dependency


def permission_required(*required_permissions: Permission):
    """
    Dependency factory to check if user has required permissions
    
    Usage:
        @router.post("/users")
        def create_user(
            current_user: User = Depends(permission_required(Permission.USER_CREATE))
        ):
            return {"message": "User created"}
    """
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_role = UserRole(current_user.role)
        
        for permission in required_permissions:
            if not has_permission(user_role, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access forbidden: missing permission '{permission.value}'"
                )
        
        return current_user
    return dependency


def admin_only(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to check if user is an admin
    
    Usage:
        @router.get("/admin/users")
        def get_all_users(current_user: User = Depends(admin_only)):
            return users
    """
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: admin access required"
        )
    return current_user


def manager_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to check if user is a manager or admin
    
    Usage:
        @router.get("/reports")
        def get_reports(current_user: User = Depends(manager_or_admin)):
            return reports
    """
    if current_user.role not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: manager or admin access required"
        )
    return current_user


def can_access_user(user_id: int, current_user: User, db: Session) -> bool:
    """
    Check if current user can access another user's data
    
    Rules:
    - Admin: can access anyone
    - Manager: can access employees in same department
    - Employee: can only access their own data
    """
    # Check if accessing own data
    if current_user.id == user_id:
        return True
    
    # Admin can access anyone
    if current_user.role == UserRole.ADMIN.value:
        return True
    
    # Manager can access users in same department
    if current_user.role == UserRole.MANAGER.value:
        target_user = db.query(User).filter(User.id == user_id).first()
        if target_user and current_user.department_id == target_user.department_id:
            return True
    
    return False


def verify_user_access(user_id: int):
    """
    Dependency to verify user access to another user's data
    
    Usage:
        @router.get("/users/{user_id}")
        def get_user(
            user_id: int,
            _: None = Depends(verify_user_access(user_id)),
            current_user: User = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            return user
    """
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        if not can_access_user(user_id, current_user, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: insufficient permissions to access this user"
            )
        return None
    return dependency


def can_modify_user_role(current_user: User = Depends(get_current_user)) -> User:
    """
    Only admins can modify user roles
    """
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: only admins can modify user roles"
        )
    return current_user

