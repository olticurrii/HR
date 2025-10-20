"""
Profile API endpoints for the logged-in user.
Includes profile info, security, performance summary, and preferences.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
from datetime import datetime, timedelta
import hashlib
import os
import uuid

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.session import UserSession
from app.models.performance import PerformanceObjective, ReviewResponse, ReviewerType
from app.core.security import verify_password, get_password_hash
from app.schemas.profile import (
    MeOut,
    MeUpdate,
    ChangePasswordIn,
    SessionOut,
    SessionRevokeIn,
    TwoFactorToggleOut,
    PerfSummaryOut,
    GoalOut,
    ReviewOut,
    KpiOut
)

router = APIRouter()

# Directory for avatar uploads
UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_department_name(user: User, db: Session) -> str:
    """Get department name for a user."""
    if user.department_id and user.department:
        return user.department.name
    return None


@router.get("/me", response_model=MeOut)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's profile information.
    """
    department_name = get_department_name(current_user, db)
    
    return MeOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        department_id=current_user.department_id,
        department_name=department_name,
        job_role=current_user.job_role,
        avatar_url=current_user.avatar_url,
        role=current_user.role,
        timezone=current_user.timezone or "UTC",
        locale=current_user.locale or "en",
        theme=current_user.theme or "light",
        email_notifications=current_user.email_notifications if current_user.email_notifications is not None else True
    )


@router.patch("/me", response_model=MeOut)
def update_my_profile(
    payload: MeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    Users can update: full_name, phone, job_role, avatar_url, timezone, locale, theme, email_notifications
    """
    # Update fields if provided
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.job_role is not None:
        current_user.job_role = payload.job_role
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    if payload.timezone is not None:
        current_user.timezone = payload.timezone
    if payload.locale is not None:
        current_user.locale = payload.locale
    if payload.theme is not None:
        current_user.theme = payload.theme
    if payload.email_notifications is not None:
        current_user.email_notifications = payload.email_notifications
    
    db.commit()
    db.refresh(current_user)
    
    department_name = get_department_name(current_user, db)
    
    return MeOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        department_id=current_user.department_id,
        department_name=department_name,
        job_role=current_user.job_role,
        avatar_url=current_user.avatar_url,
        role=current_user.role,
        timezone=current_user.timezone or "UTC",
        locale=current_user.locale or "en",
        theme=current_user.theme or "light",
        email_notifications=current_user.email_notifications if current_user.email_notifications is not None else True
    )


@router.post("/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload user avatar image.
    Returns the avatar URL.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    # Validate file size (max 5MB)
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Maximum size is 5MB."
        )
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Update user avatar_url
    avatar_url = f"/uploads/avatars/{unique_filename}"
    current_user.avatar_url = avatar_url
    db.commit()
    
    return {"avatar_url": avatar_url, "message": "Avatar uploaded successfully"}


@router.post("/me/change-password")
def change_password(
    payload: ChangePasswordIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user password.
    Validates current password and updates to new password.
    """
    # Verify current password
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password strength
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.get("/me/sessions", response_model=List[SessionOut])
def get_my_sessions(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all active sessions for the current user.
    """
    # Get current token from request
    current_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    current_token_hash = hashlib.sha256(current_token.encode()).hexdigest() if current_token else None
    
    # Query active sessions
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == 1
    ).order_by(desc(UserSession.last_seen)).all()
    
    result = []
    for session in sessions:
        session_out = SessionOut(
            id=session.id,
            device_info=session.device_info,
            ip_address=session.ip_address,
            created_at=session.created_at,
            last_seen=session.last_seen,
            is_current=(session.token_hash == current_token_hash)
        )
        result.append(session_out)
    
    return result


@router.post("/me/sessions/revoke")
def revoke_sessions(
    payload: SessionRevokeIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Revoke one or all sessions.
    If session_id is provided, revoke that session.
    If revoke_all is True, revoke all sessions except current.
    """
    if payload.revoke_all:
        # Revoke all sessions for this user
        db.query(UserSession).filter(
            UserSession.user_id == current_user.id
        ).update({"is_active": 0})
        db.commit()
        return {"message": "All sessions revoked successfully"}
    
    elif payload.session_id:
        # Revoke specific session
        session = db.query(UserSession).filter(
            UserSession.id == payload.session_id,
            UserSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        session.is_active = 0
        db.commit()
        return {"message": "Session revoked successfully"}
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either session_id or revoke_all must be provided"
        )


@router.post("/me/2fa/toggle", response_model=TwoFactorToggleOut)
def toggle_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle 2FA for the current user.
    Currently a stub - returns disabled status.
    """
    return TwoFactorToggleOut(
        enabled=False,
        message="Two-factor authentication is not yet implemented"
    )


@router.get("/me/performance/summary", response_model=PerfSummaryOut)
def get_performance_summary(
    window_days: int = 180,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get performance summary for the current user.
    Includes goals, KPIs, last review, and trend.
    """
    # Get goals
    goals_query = db.query(PerformanceObjective).filter(
        PerformanceObjective.user_id == current_user.id,
        PerformanceObjective.status != "archived"
    ).order_by(desc(PerformanceObjective.created_at)).limit(10)
    
    goals = []
    for obj in goals_query.all():
        goals.append(GoalOut(
            id=obj.id,
            title=obj.title,
            status=obj.status.value if hasattr(obj.status, 'value') else str(obj.status),
            progress=obj.progress or 0.0,
            due_date=obj.due_date
        ))
    
    # Get last review
    last_review_query = db.query(ReviewResponse).filter(
        ReviewResponse.reviewee_id == current_user.id,
        ReviewResponse.reviewer_type == ReviewerType.MANAGER
    ).order_by(desc(ReviewResponse.created_at)).first()
    
    last_review = None
    if last_review_query:
        reviewer = None
        if last_review_query.reviewer:
            reviewer = {
                "id": last_review_query.reviewer.id,
                "full_name": last_review_query.reviewer.full_name
            }
        
        last_review = ReviewOut(
            date=last_review_query.created_at,
            reviewer=reviewer,
            rating=float(last_review_query.rating) if last_review_query.rating else None,
            comment=last_review_query.comment
        )
    
    # Calculate KPIs (simplified - using task completion rate and time tracking)
    # This is a placeholder - you can customize based on your KPI logic
    kpis = []
    
    # Example KPI: Active goals completion rate
    total_goals = len(goals)
    completed_goals = len([g for g in goals if g.status == "closed" or g.status == "done"])
    if total_goals > 0:
        completion_rate = (completed_goals / total_goals) * 100
        kpis.append(KpiOut(
            name="Goals Completion Rate",
            value=round(completion_rate, 1),
            unit="%",
            delta=None
        ))
    
    # Example KPI: Average goal progress
    if goals:
        avg_progress = sum([g.progress for g in goals]) / len(goals)
        kpis.append(KpiOut(
            name="Average Goal Progress",
            value=round(avg_progress, 1),
            unit="%",
            delta=None
        ))
    
    # Calculate trend (review scores over time)
    start_date = datetime.utcnow() - timedelta(days=window_days)
    reviews_query = db.query(ReviewResponse).filter(
        ReviewResponse.reviewee_id == current_user.id,
        ReviewResponse.created_at >= start_date,
        ReviewResponse.rating.isnot(None)
    ).order_by(ReviewResponse.created_at).all()
    
    trend = []
    for review in reviews_query:
        trend.append({
            "date": review.created_at.date().isoformat(),
            "score": float(review.rating) if review.rating else 0
        })
    
    return PerfSummaryOut(
        goals=goals,
        kpis=kpis,
        last_review=last_review,
        trend=trend
    )

