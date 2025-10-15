from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.task import Task
from app.models.project import Project
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskReorderRequest, TaskAttachRequest
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/{project_id}/tasks", response_model=TaskResponse)
async def create_task_in_project(
    project_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task under a project (Admin/Higher role only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create tasks in projects"
        )
    
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if assignee exists
    if task_data.assignee_id:
        assignee = db.query(User).filter(User.id == task_data.assignee_id).first()
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")
    
    # Get the next position for this project
    max_position = db.query(Task).filter(Task.project_id == project_id).count()
    next_position = max_position + 1
    
    # Create task with project assignment
    task_dict = task_data.dict()
    task_dict.update({
        "created_by": current_user.id,
        "project_id": project_id,
        "position": next_position
    })
    
    db_task = Task(**task_dict)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task

@router.post("/{project_id}/tasks/{task_id}", response_model=TaskResponse)
async def attach_task_to_project(
    project_id: int,
    task_id: int,
    attach_data: TaskAttachRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Attach an existing task to a project (Admin/Higher role only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can attach tasks to projects"
        )
    
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify task exists and is not already in a project
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.project_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task is already assigned to a project"
        )
    
    # Determine position
    if attach_data.position is None:
        # Add to end
        max_position = db.query(Task).filter(Task.project_id == project_id).count()
        position = max_position + 1
    else:
        # Insert at specified position
        position = attach_data.position
        # Shift other tasks down
        db.query(Task).filter(
            Task.project_id == project_id,
            Task.position >= position
        ).update({Task.position: Task.position + 1})
    
    # Attach task to project
    task.project_id = project_id
    task.position = position
    
    db.commit()
    db.refresh(task)
    
    return task

@router.patch("/{project_id}/tasks/reorder")
async def reorder_project_tasks(
    project_id: int,
    reorder_data: TaskReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reorder tasks within a project (Admin/Higher role only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can reorder project tasks"
        )
    
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify all tasks belong to this project
    tasks = db.query(Task).filter(
        Task.id.in_(reorder_data.task_ids),
        Task.project_id == project_id
    ).all()
    
    if len(tasks) != len(reorder_data.task_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some tasks do not belong to this project"
        )
    
    # Update positions
    for position, task_id in enumerate(reorder_data.task_ids, 1):
        db.query(Task).filter(Task.id == task_id).update({"position": position})
    
    db.commit()
    
    return {"message": "Tasks reordered successfully"}

@router.delete("/{project_id}/tasks/{task_id}")
async def detach_task_from_project(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Detach a task from a project (Admin/Higher role only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can detach tasks from projects"
        )
    
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify task exists and belongs to this project
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.project_id == project_id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found in this project"
        )
    
    # Get the position of the task being removed
    removed_position = task.position
    
    # Shift remaining tasks up
    db.query(Task).filter(
        Task.project_id == project_id,
        Task.position > removed_position
    ).update({Task.position: Task.position - 1})
    
    # Detach task (set project_id to NULL and reset position)
    task.project_id = None
    task.position = 1
    
    db.commit()
    
    return {"message": "Task detached from project successfully"}
