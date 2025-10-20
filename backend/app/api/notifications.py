"""
Notification API Endpoints
Handles in-app notifications, push tokens, and user preferences
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification, PushNotificationToken, UserNotificationPreferences
from app.schemas.notification import (
    NotificationOut, NotificationUpdate, PushTokenCreate, PushTokenOut,
    NotificationPreferencesUpdate, NotificationPreferencesOut
)
from app.services.notification_service import notification_service

router = APIRouter()

@router.get("/", response_model=List[NotificationOut])
async def get_notifications(
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for the current user"""
    notifications = notification_service.get_user_notifications(
        db, current_user.id, limit, unread_only
    )
    return notifications

@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get unread notification count"""
    count = notification_service.get_unread_count(db, current_user.id)
    return {"unread_count": count}

@router.patch("/{notification_id}/read", response_model=dict)
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    success = notification_service.mark_notification_read(
        db, notification_id, current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}

@router.patch("/mark-all-read", response_model=dict)
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for the current user"""
    updated_count = notification_service.mark_all_notifications_read(
        db, current_user.id
    )
    
    return {
        "message": f"Marked {updated_count} notifications as read",
        "updated_count": updated_count
    }

@router.post("/push-tokens", response_model=PushTokenOut)
async def register_push_token(
    token_data: PushTokenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register a push notification token"""
    push_token = notification_service.register_push_token(
        db, current_user.id, token_data.token, token_data.platform, token_data.device_info
    )
    return push_token

@router.delete("/push-tokens/{token}")
async def unregister_push_token(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unregister a push notification token"""
    success = notification_service.unregister_push_token(
        db, current_user.id, token
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Push token not found"
        )
    
    return {"message": "Push token unregistered"}

@router.get("/preferences", response_model=NotificationPreferencesOut)
async def get_notification_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notification preferences for the current user"""
    prefs = db.query(UserNotificationPreferences).filter(
        UserNotificationPreferences.user_id == current_user.id
    ).first()
    
    if not prefs:
        # Create default preferences if they don't exist
        prefs = UserNotificationPreferences(
            user_id=current_user.id,
            email_task_assigned=True,
            email_task_completed=True,
            email_task_overdue=True,
            email_goal_approved=True,
            email_goal_rejected=True,
            email_feedback_received=True,
            email_review_due=True,
            email_leave_approved=True,
            email_leave_rejected=True,
            email_mention=True,
            inapp_task_assigned=True,
            inapp_task_completed=True,
            inapp_task_overdue=True,
            inapp_goal_approved=True,
            inapp_goal_rejected=True,
            inapp_feedback_received=True,
            inapp_review_due=True,
            inapp_leave_approved=True,
            inapp_leave_rejected=True,
            inapp_mention=True,
            # Add all new notification types with defaults
            email_project_assigned=True,
            email_late_to_work=True,
            email_comment_reply=True,
            email_task_reviewed=True,
            email_public_feedback=True,
            email_feedback_replied=True,
            email_peer_review=True,
            email_manager_review=True,
            email_private_message=True,
            email_department_message=True,
            email_company_message=True,
            inapp_project_assigned=True,
            inapp_late_to_work=True,
            inapp_comment_reply=True,
            inapp_task_reviewed=True,
            inapp_public_feedback=True,
            inapp_feedback_replied=True,
            inapp_peer_review=True,
            inapp_manager_review=True,
            inapp_private_message=True,
            inapp_department_message=True,
            inapp_company_message=True,
            push_task_assigned=True,
            push_task_completed=True,
            push_task_overdue=True,
            push_goal_approved=True,
            push_goal_rejected=True,
            push_feedback_received=True,
            push_review_due=True,
            push_leave_approved=True,
            push_leave_rejected=True,
            push_mention=True,
            push_project_assigned=True,
            push_late_to_work=True,
            push_comment_reply=True,
            push_task_reviewed=True,
            push_public_feedback=True,
            push_feedback_replied=True,
            push_peer_review=True,
            push_manager_review=True,
            push_private_message=True,
            push_department_message=True,
            push_company_message=True
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    
    return prefs

@router.patch("/preferences", response_model=NotificationPreferencesOut)
async def update_notification_preferences(
    preferences: NotificationPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update notification preferences for the current user"""
    prefs = db.query(UserNotificationPreferences).filter(
        UserNotificationPreferences.user_id == current_user.id
    ).first()
    
    if not prefs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification preferences not found"
        )
    
    # Update only provided fields
    update_data = preferences.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(prefs, field):
            setattr(prefs, field, value)
    
    db.commit()
    db.refresh(prefs)
    
    return prefs

@router.delete("/cleanup")
async def cleanup_old_notifications(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clean up old notifications (admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    deleted_count = notification_service.cleanup_old_notifications(db, days)
    
    return {
        "message": f"Cleaned up {deleted_count} old notifications",
        "deleted_count": deleted_count
    }