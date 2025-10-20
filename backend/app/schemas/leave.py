from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

# Leave Type Schemas
class LeaveTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    default_days_per_year: int = 0
    requires_approval: bool = True

class LeaveTypeResponse(LeaveTypeBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Leave Balance Schemas
class LeaveBalanceBase(BaseModel):
    leave_type_id: int
    total_days: float
    year: int

class LeaveBalanceUpdate(BaseModel):
    total_days: float

class LeaveBalanceResponse(LeaveBalanceBase):
    id: int
    user_id: int
    used_days: float
    remaining_days: float
    leave_type_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Leave Request Schemas
class LeaveRequestCreate(BaseModel):
    leave_type_id: int
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveRequestUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reason: Optional[str] = None

class LeaveRequestReview(BaseModel):
    status: str  # 'approved' or 'rejected'
    review_comments: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    leave_type_id: int
    leave_type_name: str
    start_date: date
    end_date: date
    total_days: float
    reason: Optional[str] = None
    status: str
    reviewed_by: Optional[int] = None
    reviewer_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_comments: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard/Summary Schemas
class LeaveSummary(BaseModel):
    total_leave_requests: int
    pending_requests: int
    approved_requests: int
    rejected_requests: int
    total_days_taken: float

class LeaveBalanceSummary(BaseModel):
    leave_balances: List[LeaveBalanceResponse]
    total_allocated: float
    total_used: float
    total_remaining: float

