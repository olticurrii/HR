"""Employee Profile API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.department import Department
from app.models.performance import (
    PerformanceObjective,
    PerformanceKeyResult,
    ReviewCycle,
    ReviewQuestion,
    ReviewResponse,
    Competency,
    CompetencyScore,
    ObjectiveStatus,
    KeyResultStatus,
    ReviewerType,
    ReviewCycleStatus
)
from app.schemas.performance import (
    ObjectiveCreate,
    ObjectiveUpdate,
    ObjectiveResponse,
    KeyResultCreate,
    KeyResultUpdate,
    KeyResultResponse,
    ReviewResponseCreate,
    ReviewResponseItem,
    CompetencyRadarData,
    ReviewsByType,
    PerformanceSummary
)
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/employees", tags=["employee-profile"])


# ============================================================================
# PERMISSION HELPERS
# ============================================================================

def can_view_profile(current_user: User, target_user_id: int, db: Session) -> bool:
    """Check if current user can view target user's profile"""
    # Admin can view anyone
    if current_user.is_admin:
        return True
    
    # Can view own profile
    if current_user.id == target_user_id:
        return True
    
    # Manager can view direct/indirect reports
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if target_user and is_manager_of(current_user, target_user, db):
        return True
    
    return False


def can_edit_profile(current_user: User, target_user_id: int) -> bool:
    """Check if current user can edit target user's profile"""
    # Only admin can edit
    return current_user.is_admin


def is_manager_of(manager: User, employee: User, db: Session) -> bool:
    """Check if manager is direct or indirect manager of employee"""
    current = employee
    while current.manager_id:
        if current.manager_id == manager.id:
            return True
        current = db.query(User).filter(User.id == current.manager_id).first()
        if not current:
            break
    return False


# ============================================================================
# PROFILE HEADER & BASIC INFO
# ============================================================================

class ProfileHeaderResponse(BaseModel):
    id: int
    full_name: str
    email: str
    job_role: Optional[str]
    avatar_url: Optional[str]
    phone: Optional[str]
    department_id: Optional[int]
    department_name: Optional[str]
    manager_id: Optional[int]
    manager_name: Optional[str]
    hire_date: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True


@router.get("/{user_id}/profile_header", response_model=ProfileHeaderResponse)
def get_profile_header(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get employee profile header information"""
    if not can_view_profile(current_user, user_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this profile"
        )
    
    user = db.query(User).options(
        joinedload(User.department),
        joinedload(User.manager)
    ).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return ProfileHeaderResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        job_role=user.job_role,
        avatar_url=user.avatar_url,
        phone=user.phone,
        department_id=user.department_id,
        department_name=user.department.name if user.department else None,
        manager_id=user.manager_id,
        manager_name=user.manager.full_name if user.manager else None,
        hire_date=user.hire_date,
        is_active=user.is_active
    )


class NeighborsResponse(BaseModel):
    prev_user_id: Optional[int]
    next_user_id: Optional[int]


@router.get("/{user_id}/neighbors", response_model=NeighborsResponse)
def get_neighbors(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get prev/next employee IDs for navigation"""
    # Get all users ordered by name
    users = db.query(User.id).order_by(User.full_name).all()
    user_ids = [u.id for u in users]
    
    try:
        current_index = user_ids.index(user_id)
        prev_id = user_ids[current_index - 1] if current_index > 0 else None
        next_id = user_ids[current_index + 1] if current_index < len(user_ids) - 1 else None
        return NeighborsResponse(prev_user_id=prev_id, next_user_id=next_id)
    except ValueError:
        return NeighborsResponse(prev_user_id=None, next_user_id=None)


# ============================================================================
# PERSONAL TAB
# ============================================================================

class PersonalInfoResponse(BaseModel):
    email: str
    phone: Optional[str]
    full_name: str
    avatar_url: Optional[str]

    class Config:
        from_attributes = True


@router.get("/{user_id}/personal", response_model=PersonalInfoResponse)
def get_personal_info(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personal information"""
    if not can_view_profile(current_user, user_id, db):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


class PersonalInfoUpdate(BaseModel):
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


@router.patch("/{user_id}/personal", response_model=PersonalInfoResponse)
def update_personal_info(
    user_id: int,
    data: PersonalInfoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update personal information (admin or self)"""
    if not (current_user.is_admin or current_user.id == user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.phone is not None:
        user.phone = data.phone
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    
    db.commit()
    db.refresh(user)
    return user


# ============================================================================
# JOB TAB
# ============================================================================

class JobInfoResponse(BaseModel):
    job_role: Optional[str]
    hire_date: Optional[datetime]
    manager_id: Optional[int]
    manager_name: Optional[str]
    department_id: Optional[int]
    department_name: Optional[str]

    class Config:
        from_attributes = True


@router.get("/{user_id}/job", response_model=JobInfoResponse)
def get_job_info(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job information"""
    if not can_view_profile(current_user, user_id, db):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).options(
        joinedload(User.department),
        joinedload(User.manager)
    ).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return JobInfoResponse(
        job_role=user.job_role,
        hire_date=user.hire_date,
        manager_id=user.manager_id,
        manager_name=user.manager.full_name if user.manager else None,
        department_id=user.department_id,
        department_name=user.department.name if user.department else None
    )


# ============================================================================
# PERFORMANCE - OBJECTIVES & KEY RESULTS
# ============================================================================

@router.get("/{user_id}/objectives", response_model=List[ObjectiveResponse])
def get_user_objectives(
    user_id: int,
    status: Optional[ObjectiveStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's objectives with key results"""
    if not can_view_profile(current_user, user_id, db):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(PerformanceObjective).options(
        joinedload(PerformanceObjective.key_results)
    ).filter(PerformanceObjective.user_id == user_id)
    
    if status:
        query = query.filter(PerformanceObjective.status == status)
    
    objectives = query.order_by(PerformanceObjective.created_at.desc()).all()
    
    # Calculate progress for each objective
    for obj in objectives:
        if obj.key_results:
            total_weight = sum(kr.weight for kr in obj.key_results)
            if total_weight > 0:
                weighted_progress = sum(kr.progress * kr.weight for kr in obj.key_results)
                obj.progress = round(weighted_progress / total_weight, 2)
            else:
                obj.progress = 0.0
        else:
            obj.progress = 0.0
    
    db.commit()
    return objectives


@router.post("/objectives", response_model=ObjectiveResponse, status_code=201)
def create_objective(
    data: ObjectiveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new objective (admin or for self)"""
    if not (current_user.is_admin or current_user.id == data.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    objective = PerformanceObjective(**data.model_dump())
    db.add(objective)
    db.commit()
    db.refresh(objective)
    return objective


@router.patch("/objectives/{objective_id}", response_model=ObjectiveResponse)
def update_objective(
    objective_id: int,
    data: ObjectiveUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an objective"""
    objective = db.query(PerformanceObjective).filter(
        PerformanceObjective.id == objective_id
    ).first()
    
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    if not (current_user.is_admin or current_user.id == objective.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(objective, key, value)
    
    objective.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(objective)
    return objective


@router.post("/key_results", response_model=KeyResultResponse, status_code=201)
def create_key_result(
    data: KeyResultCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new key result"""
    objective = db.query(PerformanceObjective).filter(
        PerformanceObjective.id == data.objective_id
    ).first()
    
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    if not (current_user.is_admin or current_user.id == objective.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    key_result = PerformanceKeyResult(**data.model_dump())
    db.add(key_result)
    db.commit()
    db.refresh(key_result)
    return key_result


@router.patch("/key_results/{kr_id}", response_model=KeyResultResponse)
def update_key_result(
    kr_id: int,
    data: KeyResultUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a key result (progress, status, etc.)"""
    kr = db.query(PerformanceKeyResult).options(
        joinedload(PerformanceKeyResult.objective)
    ).filter(PerformanceKeyResult.id == kr_id).first()
    
    if not kr:
        raise HTTPException(status_code=404, detail="Key result not found")
    
    if not (current_user.is_admin or current_user.id == kr.objective.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(kr, key, value)
    
    # Auto-calculate progress if current and target values exist
    if kr.target_value and kr.target_value > 0:
        kr.progress = min(100.0, (kr.current_value / kr.target_value) * 100)
    
    kr.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(kr)
    
    # Recalculate objective progress
    objective = kr.objective
    if objective.key_results:
        total_weight = sum(k.weight for k in objective.key_results)
        if total_weight > 0:
            weighted_progress = sum(k.progress * k.weight for k in objective.key_results)
            objective.progress = round(weighted_progress / total_weight, 2)
            objective.updated_at = datetime.utcnow()
            db.commit()
    
    return kr


# ============================================================================
# PERFORMANCE - REVIEWS
# ============================================================================

@router.get("/{user_id}/reviews", response_model=List[ReviewsByType])
def get_user_reviews(
    user_id: int,
    cycle_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get reviews for a user, grouped by reviewer type"""
    if not can_view_profile(current_user, user_id, db):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(ReviewResponse).options(
        joinedload(ReviewResponse.question),
        joinedload(ReviewResponse.reviewer)
    ).filter(ReviewResponse.reviewee_id == user_id)
    
    if cycle_id:
        query = query.filter(ReviewResponse.cycle_id == cycle_id)
    
    responses = query.all()
    
    # Group by reviewer type
    grouped = {}
    for resp in responses:
        rt = resp.reviewer_type
        if rt not in grouped:
            grouped[rt] = []
        grouped[rt].append({
            "question": resp.question.prompt if resp.question else "",
            "rating": resp.rating,
            "comment": resp.comment,
            "reviewer_name": resp.reviewer.full_name if resp.reviewer else "Anonymous"
        })
    
    return [
        ReviewsByType(reviewer_type=ReviewerType(rt), questions_and_answers=qa)
        for rt, qa in grouped.items()
    ]


@router.post("/reviews/submit", status_code=201)
def submit_review(
    data: ReviewResponseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a review"""
    # Check cycle is active
    cycle = db.query(ReviewCycle).filter(ReviewCycle.id == data.cycle_id).first()
    if not cycle or cycle.status != ReviewCycleStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Review cycle not active")
    
    # Check permissions
    if data.reviewer_type == ReviewerType.SELF:
        if current_user.id != data.reviewee_id:
            raise HTTPException(status_code=403, detail="Can only submit self review for yourself")
    
    elif data.reviewer_type == ReviewerType.MANAGER:
        reviewee = db.query(User).filter(User.id == data.reviewee_id).first()
        if not reviewee or not (current_user.is_admin or is_manager_of(current_user, reviewee, db)):
            raise HTTPException(status_code=403, detail="Not authorized to submit manager review")
    
    # Check for duplicates
    existing = db.query(ReviewResponse).filter(
        and_(
            ReviewResponse.cycle_id == data.cycle_id,
            ReviewResponse.reviewee_id == data.reviewee_id,
            ReviewResponse.reviewer_id == current_user.id,
            ReviewResponse.reviewer_type == data.reviewer_type
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Review already submitted")
    
    # Create responses
    for answer in data.answers:
        response = ReviewResponse(
            cycle_id=data.cycle_id,
            reviewee_id=data.reviewee_id,
            reviewer_id=current_user.id,
            reviewer_type=data.reviewer_type,
            question_id=answer.get("question_id"),
            rating=answer.get("rating"),
            comment=answer.get("comment")
        )
        db.add(response)
    
    db.commit()
    return {"message": "Review submitted successfully"}


# ============================================================================
# PERFORMANCE - COMPETENCIES
# ============================================================================

@router.get("/{user_id}/competencies", response_model=List[CompetencyRadarData])
def get_user_competencies(
    user_id: int,
    cycle_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get competency scores for radar chart"""
    if not can_view_profile(current_user, user_id, db):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(CompetencyScore).options(
        joinedload(CompetencyScore.competency)
    ).filter(CompetencyScore.user_id == user_id)
    
    if cycle_id:
        query = query.filter(CompetencyScore.cycle_id == cycle_id)
    
    scores = query.all()
    
    # Group by competency
    competency_map = {}
    for score in scores:
        comp_id = score.competency_id
        if comp_id not in competency_map:
            competency_map[comp_id] = {
                "competency_id": comp_id,
                "competency_name": score.competency.name if score.competency else f"Competency {comp_id}",
                "self_score": None,
                "manager_score": None,
                "peer_score": None
            }
        
        if score.source == ReviewerType.SELF:
            competency_map[comp_id]["self_score"] = score.score
        elif score.source == ReviewerType.MANAGER:
            competency_map[comp_id]["manager_score"] = score.score
        elif score.source == ReviewerType.PEER:
            competency_map[comp_id]["peer_score"] = score.score
    
    return list(competency_map.values())


# ============================================================================
# WORKFLOWS TAB
# ============================================================================

class WorkflowItem(BaseModel):
    id: int
    type: str  # 'task' or 'project'
    title: str
    status: str
    due_date: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("/{user_id}/workflows", response_model=List[WorkflowItem])
def get_user_workflows(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks and projects assigned to user"""
    if not can_view_profile(current_user, user_id, db):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from app.models.task import Task
    from app.models.project import Project
    
    # Get tasks
    tasks = db.query(Task).filter(Task.assignee_id == user_id).all()
    task_items = [
        WorkflowItem(
            id=t.id,
            type="task",
            title=t.title,
            status=t.status,
            due_date=t.due_date
        )
        for t in tasks
    ]
    
    # Get projects (as creator - adjust if needed)
    projects = db.query(Project).filter(Project.created_by == user_id).all()
    project_items = [
        WorkflowItem(
            id=p.id,
            type="project",
            title=p.name,
            status=p.status,
            due_date=None  # Add if Project model has due_date
        )
        for p in projects
    ]
    
    return task_items + project_items


# ============================================================================
# PERFORMANCE METRICS (AUTO-CALCULATED FROM TASKS/PROJECTS)
# ============================================================================

from app.services.performance_calculator import PerformanceCalculator

class PerformanceMetricsResponse(BaseModel):
    task_metrics: dict
    project_metrics: dict
    overall_score: float
    insights: List[dict]

    class Config:
        from_attributes = True


@router.get("/{user_id}/performance_metrics", response_model=PerformanceMetricsResponse)
def get_performance_metrics(
    user_id: int,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get auto-calculated performance metrics from tasks and projects"""
    if not can_view_profile(current_user, user_id, db):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    calculator = PerformanceCalculator()
    
    return PerformanceMetricsResponse(
        task_metrics=calculator.calculate_task_metrics(user_id, db, days),
        project_metrics=calculator.calculate_project_metrics(user_id, db),
        overall_score=calculator.calculate_overall_performance_score(user_id, db),
        insights=calculator.get_performance_insights(user_id, db)
    )


class LinkTaskRequest(BaseModel):
    task_id: int
    objective_id: int


@router.post("/{user_id}/link_task_to_objective", status_code=200)
def link_task_to_objective_endpoint(
    user_id: int,
    data: LinkTaskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Link a task to an objective (admin or owner only)"""
    if not (current_user.is_admin or current_user.id == user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from app.services.performance_calculator import link_task_to_objective, auto_update_objective_from_tasks
    
    success = link_task_to_objective(data.task_id, data.objective_id, db)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to link task")
    
    # Auto-update objective progress
    auto_update_objective_from_tasks(data.objective_id, db)
    
    return {"message": "Task linked successfully", "objective_progress_updated": True}

