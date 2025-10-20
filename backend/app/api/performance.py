"""
Performance API endpoints.
Handles goals, KPIs, reviews, and performance tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.auth import get_current_user
from app.api.settings import get_organization_settings
from app.models.user import User
from app.models.performance import (
    PerformanceObjective,
    PerformanceKeyResult,
    ReviewCycle,
    ReviewQuestion,
    ReviewResponse,
    Competency,
    CompetencyScore,
    KpiSnapshot,
    GoalApprovalStatus,
    ObjectiveStatus,
    ReviewerType
)
from app.models.task import Task
from app.models.time_entry import TimeEntry
from app.schemas.performance import (
    ObjectiveCreate,
    ObjectiveUpdate,
    ObjectiveResponse,
    GoalApprovalAction,
    KeyResultCreate,
    KeyResultUpdate,
    KeyResultResponse,
    ReviewCycleCreate,
    ReviewCycleResponse,
    ReviewQuestionCreate,
    ReviewQuestionResponse,
    ReviewResponseCreate,
    ReviewResponseItem,
    KpiSnapshotCreate,
    KpiSnapshotResponse,
    KpiTrendData,
    TopPerformerBadge,
    PerformanceSummary
)

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to require admin role."""
    if not current_user.is_admin and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def check_performance_module_enabled(db: Session):
    """Check if performance module is enabled."""
    settings = get_organization_settings(db)
    if not settings.performance_module_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Performance module is disabled"
        )


# ==================== GOALS / OBJECTIVES ====================

@router.post("/performance/objectives", response_model=ObjectiveResponse)
def create_objective(
    objective_data: ObjectiveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new performance objective/goal.
    If user creates own goal and approval is required, it starts in PENDING status.
    """
    check_performance_module_enabled(db)
    settings = get_organization_settings(db)
    
    # Check if user is creating goal for themselves
    is_self_goal = objective_data.user_id == current_user.id
    
    # Check permissions
    if is_self_goal:
        if not settings.performance_allow_self_goals:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Self-created goals are not allowed"
            )
    else:
        # Only admin or manager can create goals for others
        target_user = db.query(User).filter(User.id == objective_data.user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        is_manager = target_user.manager_id == current_user.id
        is_admin = current_user.is_admin or current_user.role == "admin"
        
        if not (is_manager or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only managers and admins can create goals for other users"
            )
    
    # Determine approval status
    approval_status = GoalApprovalStatus.PENDING
    if is_self_goal and settings.performance_require_goal_approval:
        approval_status = GoalApprovalStatus.PENDING
    elif not is_self_goal:
        # Manager/admin created goals are auto-approved
        approval_status = GoalApprovalStatus.APPROVED
    elif is_self_goal and not settings.performance_require_goal_approval:
        # Self goals don't need approval if setting is off
        approval_status = GoalApprovalStatus.APPROVED
    
    # Create objective
    objective = PerformanceObjective(
        user_id=objective_data.user_id,
        title=objective_data.title,
        description=objective_data.description,
        status=objective_data.status,
        start_date=objective_data.start_date,
        due_date=objective_data.due_date,
        created_by_id=current_user.id,
        approval_status=approval_status,
        approval_date=datetime.utcnow() if approval_status == GoalApprovalStatus.APPROVED else None,
        approved_by_id=current_user.id if approval_status == GoalApprovalStatus.APPROVED else None
    )
    
    db.add(objective)
    db.commit()
    db.refresh(objective)
    
    return objective


@router.get("/performance/objectives", response_model=List[ObjectiveResponse])
def get_objectives(
    user_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    approval_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get performance objectives.
    If user_id provided, get objectives for that user (requires permission).
    If not, get current user's objectives.
    """
    check_performance_module_enabled(db)
    
    # Determine target user
    target_user_id = user_id if user_id else current_user.id
    
    # Check permissions
    if target_user_id != current_user.id:
        target_user = db.query(User).filter(User.id == target_user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        is_manager = target_user.manager_id == current_user.id
        is_admin = current_user.is_admin or current_user.role == "admin"
        
        if not (is_manager or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot view other users' objectives"
            )
    
    # Build query
    query = db.query(PerformanceObjective).filter(
        PerformanceObjective.user_id == target_user_id
    )
    
    if status_filter:
        query = query.filter(PerformanceObjective.status == status_filter)
    
    if approval_status:
        query = query.filter(PerformanceObjective.approval_status == approval_status)
    
    objectives = query.order_by(desc(PerformanceObjective.created_at)).all()
    
    return objectives


@router.get("/performance/objectives/pending-approval", response_model=List[ObjectiveResponse])
def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get objectives pending approval.
    Managers see their reports' pending goals.
    Admins see all pending goals.
    """
    check_performance_module_enabled(db)
    
    is_admin = current_user.is_admin or current_user.role == "admin"
    
    if is_admin:
        # Admin sees all pending
        objectives = db.query(PerformanceObjective).filter(
            PerformanceObjective.approval_status == GoalApprovalStatus.PENDING
        ).order_by(desc(PerformanceObjective.created_at)).all()
    else:
        # Manager sees their reports' pending goals
        report_ids = db.query(User.id).filter(User.manager_id == current_user.id).all()
        report_ids = [r[0] for r in report_ids]
        
        objectives = db.query(PerformanceObjective).filter(
            and_(
                PerformanceObjective.user_id.in_(report_ids),
                PerformanceObjective.approval_status == GoalApprovalStatus.PENDING
            )
        ).order_by(desc(PerformanceObjective.created_at)).all()
    
    return objectives


@router.post("/performance/objectives/approve")
def approve_or_reject_objective(
    approval: GoalApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Approve or reject a goal.
    Only managers (for their reports) or admins can approve/reject.
    """
    check_performance_module_enabled(db)
    
    objective = db.query(PerformanceObjective).filter(
        PerformanceObjective.id == approval.goal_id
    ).first()
    
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    # Check permissions
    target_user = db.query(User).filter(User.id == objective.user_id).first()
    is_manager = target_user.manager_id == current_user.id
    is_admin = current_user.is_admin or current_user.role == "admin"
    
    if not (is_manager or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can approve goals"
        )
    
    # Update approval status
    if approval.action == "approve":
        objective.approval_status = GoalApprovalStatus.APPROVED
        objective.approved_by_id = current_user.id
        objective.approval_date = datetime.utcnow()
        objective.rejection_reason = None
    else:  # reject
        objective.approval_status = GoalApprovalStatus.REJECTED
        objective.approved_by_id = current_user.id
        objective.approval_date = datetime.utcnow()
        objective.rejection_reason = approval.rejection_reason
    
    db.commit()
    
    return {"message": f"Goal {approval.action}d successfully"}


@router.put("/performance/objectives/{objective_id}", response_model=ObjectiveResponse)
def update_objective(
    objective_id: int,
    objective_update: ObjectiveUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an objective."""
    check_performance_module_enabled(db)
    
    objective = db.query(PerformanceObjective).filter(
        PerformanceObjective.id == objective_id
    ).first()
    
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    # Check permissions
    target_user = db.query(User).filter(User.id == objective.user_id).first()
    is_owner = objective.user_id == current_user.id
    is_manager = target_user.manager_id == current_user.id
    is_admin = current_user.is_admin or current_user.role == "admin"
    
    if not (is_owner or is_manager or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update this objective"
        )
    
    # Update fields
    update_data = objective_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(objective, key, value)
    
    db.commit()
    db.refresh(objective)
    
    return objective


@router.delete("/performance/objectives/{objective_id}")
def delete_objective(
    objective_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an objective."""
    check_performance_module_enabled(db)
    
    objective = db.query(PerformanceObjective).filter(
        PerformanceObjective.id == objective_id
    ).first()
    
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    # Check permissions (only owner, manager, or admin can delete)
    target_user = db.query(User).filter(User.id == objective.user_id).first()
    is_owner = objective.user_id == current_user.id
    is_manager = target_user.manager_id == current_user.id
    is_admin = current_user.is_admin or current_user.role == "admin"
    
    if not (is_owner or is_manager or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete this objective"
        )
    
    db.delete(objective)
    db.commit()
    
    return {"message": "Objective deleted successfully"}


# ==================== KPI SNAPSHOTS ====================

@router.post("/performance/kpi-snapshots", response_model=KpiSnapshotResponse)
def create_kpi_snapshot(
    snapshot_data: KpiSnapshotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Record a KPI snapshot.
    Admin/managers can record for their reports, users can record for themselves.
    """
    check_performance_module_enabled(db)
    settings = get_organization_settings(db)
    
    if not settings.performance_show_kpi_trends:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="KPI tracking is disabled"
        )
    
    # Check permissions
    if snapshot_data.user_id != current_user.id:
        target_user = db.query(User).filter(User.id == snapshot_data.user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        is_manager = target_user.manager_id == current_user.id
        is_admin = current_user.is_admin or current_user.role == "admin"
        
        if not (is_manager or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot record KPI for other users"
            )
    
    # Create snapshot
    snapshot = KpiSnapshot(
        user_id=snapshot_data.user_id,
        kpi_name=snapshot_data.kpi_name,
        value=snapshot_data.value,
        unit=snapshot_data.unit,
        notes=snapshot_data.notes,
        snapshot_date=snapshot_data.snapshot_date or datetime.utcnow(),
        period=snapshot_data.period or 'monthly',
        visibility=snapshot_data.visibility or 'manager',
        measured_by_id=snapshot_data.measured_by_id or current_user.id
    )
    
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    
    return snapshot


@router.get("/performance/kpi-snapshots/trends", response_model=List[KpiTrendData])
def get_kpi_trends(
    user_id: int,
    days: int = Query(90, ge=7, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get KPI trends for a user over the specified period.
    Returns data grouped by KPI name.
    """
    check_performance_module_enabled(db)
    settings = get_organization_settings(db)
    
    if not settings.performance_show_kpi_trends:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="KPI tracking is disabled"
        )
    
    # Check permissions
    if user_id != current_user.id:
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        is_manager = target_user.manager_id == current_user.id
        is_admin = current_user.is_admin or current_user.role == "admin"
        
        if not (is_manager or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot view other users' KPIs"
            )
    
    # Get snapshots
    since_date = datetime.utcnow() - timedelta(days=days)
    snapshots = db.query(KpiSnapshot).filter(
        and_(
            KpiSnapshot.user_id == user_id,
            KpiSnapshot.snapshot_date >= since_date
        )
    ).order_by(KpiSnapshot.kpi_name, KpiSnapshot.snapshot_date).all()
    
    # Group by KPI name
    kpi_map = {}
    for snapshot in snapshots:
        if snapshot.kpi_name not in kpi_map:
            kpi_map[snapshot.kpi_name] = {
                'kpi_name': snapshot.kpi_name,
                'unit': snapshot.unit,
                'data_points': [],
                'current_value': None,
                'trend_direction': None
            }
        
        kpi_map[snapshot.kpi_name]['data_points'].append({
            'date': snapshot.snapshot_date.isoformat(),
            'value': snapshot.value
        })
        kpi_map[snapshot.kpi_name]['current_value'] = snapshot.value
    
    # Calculate trend direction
    for kpi_name, kpi_data in kpi_map.items():
        points = kpi_data['data_points']
        if len(points) >= 2:
            first_val = points[0]['value']
            last_val = points[-1]['value']
            if last_val > first_val * 1.05:
                kpi_data['trend_direction'] = 'up'
            elif last_val < first_val * 0.95:
                kpi_data['trend_direction'] = 'down'
            else:
                kpi_data['trend_direction'] = 'stable'
    
    return list(kpi_map.values())


@router.get("/performance/kpi-snapshots/auto-calculate/{user_id}")
def auto_calculate_kpis(
    user_id: int,
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Auto-calculate KPIs from real data (tasks, time tracking, goals).
    Returns suggested KPI values that can be recorded.
    """
    check_performance_module_enabled(db)
    settings = get_organization_settings(db)
    
    if not settings.performance_show_kpi_trends:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="KPI tracking is disabled"
        )
    
    # Check permissions
    if user_id != current_user.id:
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        is_manager = target_user.manager_id == current_user.id
        is_admin = current_user.is_admin or current_user.role == "admin"
        
        if not (is_manager or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot view other users' KPIs"
            )
    
    since_date = datetime.utcnow() - timedelta(days=days)
    calculated_kpis = []
    
    # 1. Task Completion Rate
    total_tasks = db.query(func.count(Task.id)).filter(
        and_(
            Task.assignee_id == user_id,
            Task.created_at >= since_date
        )
    ).scalar()
    
    completed_tasks = db.query(func.count(Task.id)).filter(
        and_(
            Task.assignee_id == user_id,
            Task.created_at >= since_date,
            Task.status.in_(['done', 'completed'])
        )
    ).scalar()
    
    if total_tasks and total_tasks > 0:
        completion_rate = (completed_tasks / total_tasks) * 100
        calculated_kpis.append({
            "kpi_name": "Task Completion Rate",
            "value": round(completion_rate, 1),
            "unit": "%",
            "description": f"{completed_tasks} of {total_tasks} tasks completed in last {days} days",
            "category": "Productivity"
        })
    
    # 2. On-Time Task Completion
    on_time_tasks = db.query(func.count(Task.id)).filter(
        and_(
            Task.assignee_id == user_id,
            Task.created_at >= since_date,
            Task.status.in_(['done', 'completed']),
            or_(Task.due_date == None, Task.completed_at <= Task.due_date)
        )
    ).scalar()
    
    if completed_tasks and completed_tasks > 0:
        on_time_rate = (on_time_tasks / completed_tasks) * 100
        calculated_kpis.append({
            "kpi_name": "On-Time Delivery Rate",
            "value": round(on_time_rate, 1),
            "unit": "%",
            "description": f"{on_time_tasks} of {completed_tasks} tasks completed on time",
            "category": "Quality"
        })
    
    # 3. Average Goal Progress
    active_goals = db.query(PerformanceObjective).filter(
        and_(
            PerformanceObjective.user_id == user_id,
            PerformanceObjective.status == ObjectiveStatus.ACTIVE,
            PerformanceObjective.approval_status == GoalApprovalStatus.APPROVED
        )
    ).all()
    
    if active_goals:
        avg_progress = sum([g.progress for g in active_goals]) / len(active_goals)
        calculated_kpis.append({
            "kpi_name": "Average Goal Progress",
            "value": round(avg_progress, 1),
            "unit": "%",
            "description": f"Average progress across {len(active_goals)} active goals",
            "category": "Goals"
        })
    
    # 4. Hours Worked (from time tracking)
    total_hours = db.query(func.sum(
        func.julianday(TimeEntry.clock_out) - func.julianday(TimeEntry.clock_in)
    )).filter(
        and_(
            TimeEntry.user_id == user_id,
            TimeEntry.clock_in >= since_date,
            TimeEntry.clock_out != None
        )
    ).scalar()
    
    if total_hours:
        hours_worked = total_hours * 24  # Convert days to hours
        calculated_kpis.append({
            "kpi_name": "Hours Worked",
            "value": round(hours_worked, 1),
            "unit": "hours",
            "description": f"Total hours worked in last {days} days",
            "category": "Activity"
        })
        
        # 5. Productivity Score (tasks per hour)
        if hours_worked > 0 and completed_tasks > 0:
            tasks_per_hour = completed_tasks / hours_worked
            productivity = min(tasks_per_hour * 20, 100)  # Scale to 0-100
            calculated_kpis.append({
                "kpi_name": "Productivity Score",
                "value": round(productivity, 1),
                "unit": "%",
                "description": f"{completed_tasks} tasks completed in {round(hours_worked, 1)} hours",
                "category": "Efficiency"
            })
    
    # 6. Review Performance Score
    recent_reviews = db.query(func.avg(ReviewResponse.rating)).filter(
        and_(
            ReviewResponse.reviewee_id == user_id,
            ReviewResponse.created_at >= since_date
        )
    ).scalar()
    
    if recent_reviews:
        review_score = (recent_reviews / 5.0) * 100  # Convert to percentage
        calculated_kpis.append({
            "kpi_name": "Review Performance Score",
            "value": round(review_score, 1),
            "unit": "%",
            "description": f"Average rating from recent reviews",
            "category": "Quality"
        })
    
    return {
        "user_id": user_id,
        "period_days": days,
        "calculated_at": datetime.utcnow().isoformat(),
        "kpis": calculated_kpis,
        "recommendation": "You can record any of these KPIs to track trends over time"
    }


# ==================== PEER REVIEWS ====================

@router.post("/performance/peer-review", response_model=List[ReviewResponseItem])
def submit_peer_review(
    review_data: ReviewResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a peer review.
    Supports anonymous peer reviews if enabled.
    """
    check_performance_module_enabled(db)
    settings = get_organization_settings(db)
    
    if not settings.performance_enable_peer_reviews:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Peer reviews are disabled"
        )
    
    if review_data.is_anonymous_peer and not settings.performance_allow_anonymous_peer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anonymous peer reviews are not allowed"
        )
    
    # Validate cycle exists
    cycle = db.query(ReviewCycle).filter(ReviewCycle.id == review_data.cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Review cycle not found")
    
    # Create responses
    responses = []
    for answer in review_data.answers:
        response = ReviewResponse(
            cycle_id=review_data.cycle_id,
            reviewee_id=review_data.reviewee_id,
            reviewer_id=current_user.id,
            reviewer_type=review_data.reviewer_type,
            question_id=answer['question_id'],
            rating=answer.get('rating'),
            comment=answer.get('comment'),
            is_anonymous_peer=review_data.is_anonymous_peer
        )
        db.add(response)
        responses.append(response)
    
    db.commit()
    
    for response in responses:
        db.refresh(response)
    
    return responses


# ==================== TOP PERFORMER BADGE ====================

@router.get("/performance/top-performer-badge/{user_id}", response_model=TopPerformerBadge)
def get_top_performer_badge(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check if user qualifies for top performer badge.
    Based on recent review scores vs threshold.
    """
    check_performance_module_enabled(db)
    settings = get_organization_settings(db)
    
    threshold = settings.performance_top_performer_threshold
    
    # Get recent competency scores (last 6 months)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    scores = db.query(func.avg(CompetencyScore.score)).filter(
        and_(
            CompetencyScore.user_id == user_id,
            CompetencyScore.cycle_id.in_(
                db.query(ReviewCycle.id).filter(
                    ReviewCycle.start_date >= six_months_ago
                )
            )
        )
    ).scalar()
    
    avg_score = float(scores) if scores else None
    has_badge = avg_score is not None and (avg_score * 20) >= threshold  # Convert to percentage
    
    # Calculate rank (optional)
    rank = None
    percentile = None
    
    return TopPerformerBadge(
        has_badge=has_badge,
        score=avg_score * 20 if avg_score else None,
        threshold=threshold,
        rank=rank,
        percentile=percentile
    )


# ==================== MONTHLY REPORT ====================

@router.get("/performance/monthly-report")
def generate_monthly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Generate monthly performance report.
    Admin only. Returns aggregate performance data.
    """
    check_performance_module_enabled(db)
    settings = get_organization_settings(db)
    
    if not settings.performance_monthly_reports:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Monthly reports are disabled"
        )
    
    # Last month date range
    now = datetime.utcnow()
    first_of_month = now.replace(day=1)
    last_month_end = first_of_month - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)
    
    # Aggregate data
    total_objectives = db.query(func.count(PerformanceObjective.id)).scalar()
    active_objectives = db.query(func.count(PerformanceObjective.id)).filter(
        PerformanceObjective.status == ObjectiveStatus.ACTIVE
    ).scalar()
    
    avg_progress = db.query(func.avg(PerformanceObjective.progress)).filter(
        PerformanceObjective.status == ObjectiveStatus.ACTIVE
    ).scalar()
    
    goals_created_last_month = db.query(func.count(PerformanceObjective.id)).filter(
        and_(
            PerformanceObjective.created_at >= last_month_start,
            PerformanceObjective.created_at <= last_month_end
        )
    ).scalar()
    
    pending_approvals = db.query(func.count(PerformanceObjective.id)).filter(
        PerformanceObjective.approval_status == GoalApprovalStatus.PENDING
    ).scalar()
    
    # Top performers (users with avg score >= threshold)
    threshold = settings.performance_top_performer_threshold
    top_performers_count = 0  # Would need to calculate based on review scores
    
    return {
        "report_period": {
            "start": last_month_start.isoformat(),
            "end": last_month_end.isoformat()
        },
        "summary": {
            "total_objectives": total_objectives,
            "active_objectives": active_objectives,
            "average_progress": float(avg_progress) if avg_progress else 0.0,
            "goals_created_last_month": goals_created_last_month,
            "pending_approvals": pending_approvals,
            "top_performers_count": top_performers_count,
            "top_performer_threshold": threshold
        },
        "generated_at": now.isoformat()
    }

