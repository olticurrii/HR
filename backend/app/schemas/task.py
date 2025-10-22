from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "To-Do"  # 'To-Do','pending','In-Progress','in_progress','Done','completed','cancelled'
    priority: str = "Medium"  # 'Low','low','Medium','medium','High','high','urgent'
    assignee_id: Optional[int] = None
    project_id: Optional[int] = None
    position: Optional[int] = 1
    due_date: Optional[str] = None  # Changed to string for compatibility
    is_private: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None
    project_id: Optional[int] = None
    position: Optional[int] = None
    due_date: Optional[str] = None  # Changed to string for compatibility
    is_private: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    created_by: int
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    assignee_name: Optional[str] = None
    creator_name: Optional[str] = None
    project_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class TaskReorderRequest(BaseModel):
    task_ids: list[int] = Field(..., description="List of task IDs in the desired order")

class TaskAttachRequest(BaseModel):
    position: Optional[int] = None
