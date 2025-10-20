from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date


class MeOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    job_role: Optional[str] = None  # title
    avatar_url: Optional[str] = None
    role: str
    timezone: Optional[str] = None
    locale: Optional[str] = None
    theme: Optional[str] = None
    email_notifications: Optional[bool] = None
    
    class Config:
        from_attributes = True


class MeUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    job_role: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    locale: Optional[str] = None
    theme: Optional[str] = None
    email_notifications: Optional[bool] = None


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str


class SessionOut(BaseModel):
    id: int
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    last_seen: datetime
    is_current: bool = False
    
    class Config:
        from_attributes = True


class SessionRevokeIn(BaseModel):
    session_id: Optional[int] = None  # If None, revoke all sessions
    revoke_all: bool = False


class TwoFactorToggleOut(BaseModel):
    enabled: bool
    message: str


# Performance schemas
class GoalOut(BaseModel):
    id: int
    title: str
    status: str
    progress: float
    due_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ReviewOut(BaseModel):
    date: datetime
    reviewer: Optional[dict] = None
    rating: Optional[float] = None
    comment: Optional[str] = None


class KpiOut(BaseModel):
    name: str
    value: float
    unit: Optional[str] = None
    delta: Optional[float] = None


class PerfSummaryOut(BaseModel):
    goals: List[GoalOut]
    kpis: List[KpiOut]
    last_review: Optional[ReviewOut] = None
    trend: List[dict]  # {date, score}

