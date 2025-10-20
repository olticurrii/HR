"""
Pydantic schemas for custom role management
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CustomRoleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Unique role identifier (lowercase, no spaces)")
    display_name: str = Field(..., min_length=2, max_length=100, description="Human-readable role name")
    description: Optional[str] = Field(None, description="Role description")


class CustomRoleCreate(CustomRoleBase):
    pass


class CustomRoleUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None


class CustomRoleResponse(CustomRoleBase):
    id: int
    is_system_role: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class RoleAssignmentRequest(BaseModel):
    """Request to assign a role to a user"""
    user_id: int
    role_name: str

