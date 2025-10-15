from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.task import TaskStatus, TaskPriority

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    assignee_id: Optional[int] = None
    project_id: Optional[int] = None
    position: Optional[int] = 1
    due_date: Optional[datetime] = None
    is_private: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[int] = None
    project_id: Optional[int] = None
    position: Optional[int] = None
    due_date: Optional[datetime] = None
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
