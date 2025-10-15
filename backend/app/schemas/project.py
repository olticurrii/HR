from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_by: int
    created_at: datetime
    creator_name: Optional[str] = None
    task_count: int = 0
    completed_tasks: int = 0
    progress_percentage: float = 0.0

    class Config:
        from_attributes = True

class ProjectWithTasks(ProjectResponse):
    tasks: List[dict] = []  # Will contain task data