"""
Universal search endpoint - Search across all resources in the system
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime
import time

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.department import Department
from app.models.feedback import Feedback
from app.models.chat import ChatRoom
from app.schemas.search import SearchResult, SearchResponse

router = APIRouter()


def calculate_relevance(text: str, query: str) -> float:
    """Calculate relevance score based on query match"""
    if not text or not query:
        return 0.0
    
    text_lower = text.lower()
    query_lower = query.lower()
    
    # Exact match
    if query_lower == text_lower:
        return 1.0
    
    # Starts with query
    if text_lower.startswith(query_lower):
        return 0.9
    
    # Contains query
    if query_lower in text_lower:
        return 0.7
    
    # Word match
    query_words = query_lower.split()
    text_words = text_lower.split()
    matches = sum(1 for qw in query_words if any(qw in tw for tw in text_words))
    if matches > 0:
        return 0.5 * (matches / len(query_words))
    
    return 0.0


@router.get("/search", response_model=SearchResponse)
async def universal_search(
    q: str = Query(..., min_length=1, description="Search query"),
    types: Optional[str] = Query(None, description="Comma-separated list of types to search (user,task,project,etc)"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Universal search across all resources.
    Searches: Users, Tasks, Projects, Departments, Feedback, Chat Rooms.
    """
    start_time = time.time()
    
    # Parse types filter
    search_types = types.split(',') if types else ['user', 'task', 'project', 'department', 'feedback', 'chat']
    
    results: List[SearchResult] = []
    results_by_type = {t: 0 for t in search_types}
    
    search_pattern = f"%{q}%"
    
    # Search Users
    if 'user' in search_types:
        users = db.query(User).filter(
            or_(
                User.full_name.ilike(search_pattern),
                User.email.ilike(search_pattern),
                User.job_role.ilike(search_pattern)
            )
        ).limit(10).all()
        
        for user in users:
            relevance = max(
                calculate_relevance(user.full_name, q),
                calculate_relevance(user.email, q),
                calculate_relevance(user.job_role or '', q)
            )
            
            results.append(SearchResult(
                id=user.id,
                type='user',
                title=user.full_name,
                subtitle=user.job_role or 'No role',
                description=user.email,
                avatar_url=user.avatar_url,
                icon='user',
                url=f'/people/{user.id}',
                metadata={
                    'email': user.email,
                    'department_id': user.department_id,
                    'is_active': user.is_active
                },
                relevance_score=relevance
            ))
            results_by_type['user'] += 1
    
    # Search Tasks
    if 'task' in search_types:
        tasks = db.query(Task).filter(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        ).limit(10).all()
        
        for task in tasks:
            relevance = max(
                calculate_relevance(task.title, q),
                calculate_relevance(task.description or '', q)
            )
            
            results.append(SearchResult(
                id=task.id,
                type='task',
                title=task.title,
                subtitle=f'Status: {task.status}',
                description=task.description[:100] if task.description else None,
                icon='task',
                url=f'/tasks/{task.id}',
                metadata={
                    'status': task.status,
                    'priority': task.priority,
                    'due_date': task.due_date.isoformat() if task.due_date else None
                },
                relevance_score=relevance
            ))
            results_by_type['task'] += 1
    
    # Search Projects
    if 'project' in search_types:
        projects = db.query(Project).filter(
            or_(
                Project.name.ilike(search_pattern),
                Project.description.ilike(search_pattern)
            )
        ).limit(10).all()
        
        for project in projects:
            relevance = max(
                calculate_relevance(project.name, q),
                calculate_relevance(project.description or '', q)
            )
            
            results.append(SearchResult(
                id=project.id,
                type='project',
                title=project.name,
                subtitle=f'Status: {project.status}',
                description=project.description[:100] if project.description else None,
                icon='project',
                url=f'/projects/{project.id}',
                metadata={
                    'status': project.status
                },
                relevance_score=relevance
            ))
            results_by_type['project'] += 1
    
    # Search Departments
    if 'department' in search_types:
        departments = db.query(Department).filter(
            or_(
                Department.name.ilike(search_pattern),
                Department.description.ilike(search_pattern)
            )
        ).limit(10).all()
        
        for dept in departments:
            relevance = max(
                calculate_relevance(dept.name, q),
                calculate_relevance(dept.description or '', q)
            )
            
            results.append(SearchResult(
                id=dept.id,
                type='department',
                title=dept.name,
                subtitle='Department',
                description=dept.description,
                icon='department',
                url=f'/people/org-chart?department={dept.id}',
                metadata={
                    'description': dept.description
                },
                relevance_score=relevance
            ))
            results_by_type['department'] += 1
    
    # Search Feedback
    if 'feedback' in search_types and (current_user.is_admin or current_user.role == 'admin'):
        feedback_items = db.query(Feedback).filter(
            Feedback.content.ilike(search_pattern)
        ).limit(10).all()
        
        for feedback in feedback_items:
            relevance = calculate_relevance(feedback.content, q)
            
            results.append(SearchResult(
                id=feedback.id,
                type='feedback',
                title=f'Feedback: {feedback.content[:50]}...',
                subtitle=f'{feedback.sentiment_label.value if feedback.sentiment_label else "Neutral"}',
                description=feedback.content[:100],
                icon='feedback',
                url=f'/feedback',
                metadata={
                    'sentiment': feedback.sentiment_label.value if feedback.sentiment_label else None,
                    'is_anonymous': feedback.is_anonymous
                },
                relevance_score=relevance
            ))
            results_by_type['feedback'] += 1
    
    # Search Chat Rooms
    if 'chat' in search_types:
        chat_rooms = db.query(ChatRoom).filter(
            ChatRoom.name.ilike(search_pattern)
        ).limit(10).all()
        
        for room in chat_rooms:
            relevance = calculate_relevance(room.name, q)
            
            results.append(SearchResult(
                id=room.id,
                type='chat',
                title=room.name,
                subtitle=f'Chat Room - {room.type}',
                description=None,
                icon='chat',
                url=f'/chat?room={room.id}',
                metadata={
                    'type': room.type
                },
                relevance_score=relevance
            ))
            results_by_type['chat'] += 1
    
    # Sort by relevance score
    results.sort(key=lambda x: x.relevance_score, reverse=True)
    
    # Apply pagination
    total_results = len(results)
    results = results[offset:offset + limit]
    
    execution_time = (time.time() - start_time) * 1000  # Convert to milliseconds
    
    return SearchResponse(
        query=q,
        total_results=total_results,
        results=results,
        results_by_type=results_by_type,
        execution_time_ms=round(execution_time, 2)
    )

