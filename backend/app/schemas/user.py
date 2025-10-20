from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    job_role: Optional[str] = None
    department_id: Optional[int] = None
    role: Optional[str] = "employee"  # admin, manager, employee
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    job_role: Optional[str] = None
    department_id: Optional[int] = None
    role: Optional[str] = None  # System role - Only admins can change this
    custom_roles: Optional[List[str]] = None  # Custom roles - Only admins can change this
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    role: str  # System role: admin, manager, employee
    custom_roles: Optional[List[str]] = []  # Additional custom roles
    hire_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    department_name: Optional[str] = None
    
    class Config:
        from_attributes = True
