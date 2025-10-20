"""
Pydantic schemas for role permissions
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RolePermissionBase(BaseModel):
    role: str
    resource: str
    can_view: bool = False
    can_create: bool = False
    can_edit: bool = False
    can_delete: bool = False


class RolePermissionCreate(RolePermissionBase):
    pass


class RolePermissionUpdate(BaseModel):
    can_view: Optional[bool] = None
    can_create: Optional[bool] = None
    can_edit: Optional[bool] = None
    can_delete: Optional[bool] = None


class RolePermissionResponse(RolePermissionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PermissionCheckRequest(BaseModel):
    """Request to check if a user has a specific permission"""
    resource: str
    action: str  # view, create, edit, delete


class PermissionCheckResponse(BaseModel):
    """Response indicating if user has permission"""
    has_permission: bool
    role: str
    resource: str
    action: str

