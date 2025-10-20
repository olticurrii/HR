from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TimeEntryBase(BaseModel):
    is_terrain: bool = False


class TimeEntryCreate(TimeEntryBase):
    pass


class TimeEntryUpdate(BaseModel):
    clock_out: Optional[datetime] = None
    break_start: Optional[datetime] = None
    break_end: Optional[datetime] = None
    is_terrain: Optional[bool] = None


class TimeEntryResponse(TimeEntryBase):
    id: int
    user_id: int
    clock_in: datetime
    clock_out: Optional[datetime] = None
    break_start: Optional[datetime] = None
    break_end: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ActiveUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    department_name: Optional[str] = None
    clock_in: datetime
    is_on_break: bool
    is_terrain: bool
    current_duration_minutes: int
    
    class Config:
        from_attributes = True


class TimeEntryRecordResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    department_name: Optional[str] = None
    clock_in: datetime
    clock_out: Optional[datetime] = None
    break_start: Optional[datetime] = None
    break_end: Optional[datetime] = None
    is_terrain: bool
    total_worked_hours: Optional[float] = None
    break_duration_minutes: Optional[int] = None
    
    class Config:
        from_attributes = True


class TimeTrackingStatusResponse(BaseModel):
    is_clocked_in: bool
    is_on_break: bool
    is_terrain: bool
    current_entry: Optional[TimeEntryResponse] = None
    current_duration_minutes: Optional[int] = None


class UserWithStatusResponse(BaseModel):
    id: int
    full_name: str
    email: str
    department_name: Optional[str] = None
    job_role: Optional[str] = None
    is_clocked_in: bool
    is_on_break: bool
    is_terrain: bool
    clock_in: Optional[datetime] = None
    current_duration_minutes: Optional[int] = None
    
    class Config:
        from_attributes = True

