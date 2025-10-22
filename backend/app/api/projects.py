from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectWithTasks
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project (Admin/Higher role only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create projects"
        )
    
    project = Project(
        title=project_data.title,
        description=project_data.description,
        created_by=current_user.id
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        created_by=project.created_by,
        created_at=project.created_at,
        creator_name=current_user.full_name,
        task_count=0,
        completed_tasks=0,
        progress_percentage=0.0
    )

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all projects"""
    projects = db.query(Project).all()
    
    result = []
    for project in projects:
        # Get creator name
        creator = db.query(User).filter(User.id == project.created_by).first()
        creator_name = creator.full_name if creator else "Unknown"
        
        # Get task statistics
        tasks = db.query(Task).filter(Task.project_id == project.id).all()
        task_count = len(tasks)
        completed_tasks = len([t for t in tasks if t.status in ["completed", "Done"]])
        progress_percentage = (completed_tasks / task_count * 100) if task_count > 0 else 0.0
        
        result.append(ProjectResponse(
            id=project.id,
            title=project.title,
            description=project.description,
            created_by=project.created_by,
            created_at=project.created_at,
            creator_name=creator_name,
            task_count=task_count,
            completed_tasks=completed_tasks,
            progress_percentage=progress_percentage
        ))
    
    return result

@router.get("/{project_id}", response_model=ProjectWithTasks)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project details with tasks"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get creator name
    creator = db.query(User).filter(User.id == project.created_by).first()
    creator_name = creator.full_name if creator else "Unknown"
    
    # Get tasks ordered by position
    tasks = db.query(Task).filter(Task.project_id == project_id).order_by(Task.position).all()
    
    # Convert tasks to dict format
    task_list = []
    for task in tasks:
        assignee = db.query(User).filter(User.id == task.assignee_id).first()
        creator = db.query(User).filter(User.id == task.created_by).first()
        
        task_list.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "assignee_id": task.assignee_id,
            "assignee_name": assignee.full_name if assignee else None,
            "created_by": task.created_by,
            "creator_name": creator.full_name if creator else "Unknown",
            "due_date": task.due_date,
            "completed_at": task.completed_at,
            "is_private": task.is_private,
            "created_at": task.created_at,
            "updated_at": task.updated_at
        })
    
    # Calculate progress
    task_count = len(tasks)
    completed_tasks = len([t for t in tasks if t.status in ["completed", "Done"]])
    progress_percentage = (completed_tasks / task_count * 100) if task_count > 0 else 0.0
    
    return ProjectWithTasks(
        id=project.id,
        title=project.title,
        description=project.description,
        created_by=project.created_by,
        created_at=project.created_at,
        creator_name=creator_name,
        task_count=task_count,
        completed_tasks=completed_tasks,
        progress_percentage=progress_percentage,
        tasks=task_list
    )

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project (Admin/Higher role only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update projects"
        )
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update fields if provided
    if project_data.title is not None:
        project.title = project_data.title
    if project_data.description is not None:
        project.description = project_data.description
    
    db.commit()
    db.refresh(project)
    
    # Get creator name
    creator = db.query(User).filter(User.id == project.created_by).first()
    creator_name = creator.full_name if creator else "Unknown"
    
    # Get task statistics
    tasks = db.query(Task).filter(Task.project_id == project.id).all()
    task_count = len(tasks)
    completed_tasks = len([t for t in tasks if t.status in ["completed", "Done"]])
    progress_percentage = (completed_tasks / task_count * 100) if task_count > 0 else 0.0
    
    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        created_by=project.created_by,
        created_at=project.created_at,
        creator_name=creator_name,
        task_count=task_count,
        completed_tasks=completed_tasks,
        progress_percentage=progress_percentage
    )