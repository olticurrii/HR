from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.models.project import Project
from app.schemas.task import TaskResponse, TaskCreate, TaskUpdate
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[TaskStatus] = None,
    assignee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tasks based on filters"""
    query = db.query(Task)
    
    # Filter by status
    if status:
        query = query.filter(Task.status == status)
    
    # Filter by assignee
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    
    # Apply visibility rules
    if not current_user.is_admin:
        # Users can see tasks assigned to them or created by them, or non-private tasks
        query = query.filter(
            (Task.assignee_id == current_user.id) |
            (Task.created_by == current_user.id) |
            (Task.is_private == False)
        )
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task"""
    # Check if assignee exists
    if task.assignee_id:
        assignee = db.query(User).filter(User.id == task.assignee_id).first()
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")
    
    # Check if project exists
    if task.project_id:
        project = db.query(Project).filter(Project.id == task.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
    
    # Handle position for project tasks
    task_dict = task.dict()
    task_dict["created_by"] = current_user.id
    
    if task.project_id and (not task.position or task.position == 1):
        # Auto-assign position at the end if not specified
        max_position = db.query(Task).filter(Task.project_id == task.project_id).count()
        task_dict["position"] = max_position + 1
    
    db_task = Task(**task_dict)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check visibility
    if not current_user.is_admin:
        if task.is_private and task.assignee_id != current_user.id and task.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this task"
            )
    
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions
    if not current_user.is_admin:
        if task.assignee_id != current_user.id and task.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update this task"
            )
    
    update_data = task_update.dict(exclude_unset=True)
    
    # Set completion date if status is being changed to completed
    if "status" in update_data and update_data["status"] == TaskStatus.COMPLETED:
        update_data["completed_at"] = datetime.utcnow()
    elif "status" in update_data and update_data["status"] != TaskStatus.COMPLETED:
        update_data["completed_at"] = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions
    if not current_user.is_admin and task.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this task"
        )
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
