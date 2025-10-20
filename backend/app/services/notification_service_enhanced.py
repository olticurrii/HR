"""
Enhanced notification service with email, in-app, and daily digest support
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from datetime import datetime, timedelta
from typing import Optional, List

from app.models.notification import InAppNotification, UserNotificationPreferences, NotificationType
from app.models.user import User
from app.api.settings import get_organization_settings


def get_user_preferences(user_id: int, db: Session) -> UserNotificationPreferences:
    """Get or create user notification preferences"""
    prefs = db.query(UserNotificationPreferences).filter(
        UserNotificationPreferences.user_id == user_id
    ).first()
    
    if not prefs:
        # Create default preferences
        prefs = UserNotificationPreferences(user_id=user_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    
    return prefs


def should_send_notification(
    user_id: int,
    notif_type: str,
    channel: str,  # 'email' or 'inapp'
    db: Session
) -> bool:
    """
    Check if notification should be sent based on org settings and user preferences
    """
    # Check org-level settings
    org_settings = get_organization_settings(db)
    
    if channel == 'email' and not org_settings.email_notifications_enabled:
        return False
    
    if channel == 'inapp' and not org_settings.inapp_notifications_enabled:
        return False
    
    # Check user-level preferences
    prefs = get_user_preferences(user_id, db)
    pref_field = f"{channel}_{notif_type}"
    
    return getattr(prefs, pref_field, True)


def create_inapp_notification(
    user_id: int,
    notif_type: str,
    title: str,
    message: str,
    link: Optional[str],
    db: Session
) -> Optional[InAppNotification]:
    """
    Create an in-app notification if enabled
    """
    if not should_send_notification(user_id, notif_type, 'inapp', db):
        return None
    
    notification = InAppNotification(
        user_id=user_id,
        type=notif_type,
        title=title,
        message=message,
        link=link
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification


def send_email_notification(
    user_id: int,
    notif_type: str,
    subject: str,
    body: str,
    db: Session
) -> bool:
    """
    Send email notification if enabled (stub for actual email service)
    """
    if not should_send_notification(user_id, notif_type, 'email', db):
        return False
    
    # TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    print(f"📧 EMAIL QUEUED: To user {user_id}, Subject: {subject}")
    
    return True


def notify_task_assigned(task_id: int, assignee_id: int, task_title: str, db: Session):
    """Notify user when task is assigned to them"""
    create_inapp_notification(
        user_id=assignee_id,
        notif_type="task_assigned",
        title="New Task Assigned",
        message=f"You've been assigned: {task_title}",
        link=f"/tasks/{task_id}",
        db=db
    )
    
    send_email_notification(
        user_id=assignee_id,
        notif_type="task_assigned",
        subject="New Task Assigned",
        body=f"You've been assigned the task: {task_title}. Click to view details.",
        db=db
    )


def notify_goal_approved(goal_id: int, user_id: int, goal_title: str, db: Session):
    """Notify user when their goal is approved"""
    create_inapp_notification(
        user_id=user_id,
        notif_type="goal_approved",
        title="Goal Approved",
        message=f'Your goal "{goal_title}" has been approved!',
        link=f"/performance",
        db=db
    )
    
    send_email_notification(
        user_id=user_id,
        notif_type="goal_approved",
        subject="Goal Approved",
        body=f'Your goal "{goal_title}" has been approved by your manager.',
        db=db
    )


def notify_goal_rejected(goal_id: int, user_id: int, goal_title: str, reason: str, db: Session):
    """Notify user when their goal is rejected"""
    create_inapp_notification(
        user_id=user_id,
        notif_type="goal_rejected",
        title="Goal Needs Revision",
        message=f'Your goal "{goal_title}" needs revision: {reason}',
        link=f"/performance",
        db=db
    )
    
    send_email_notification(
        user_id=user_id,
        notif_type="goal_rejected",
        subject="Goal Needs Revision",
        body=f'Your goal "{goal_title}" was not approved. Reason: {reason}',
        db=db
    )


def generate_daily_admin_digest(db: Session) -> dict:
    """
    Generate daily summary for administrators
    Returns digest data that can be emailed
    """
    org_settings = get_organization_settings(db)
    
    if not org_settings.daily_summary_enabled:
        return {"enabled": False, "message": "Daily summary is disabled"}
    
    # Calculate yesterday's activity
    yesterday = datetime.utcnow() - timedelta(days=1)
    today = datetime.utcnow()
    
    # New users
    from app.models.user import User
    new_users = db.query(func.count(User.id)).filter(
        and_(User.created_at >= yesterday, User.created_at < today)
    ).scalar()
    
    # New feedback
    from app.models.feedback import Feedback
    new_feedback = db.query(func.count(Feedback.id)).filter(
        and_(Feedback.created_at >= yesterday, Feedback.created_at < today)
    ).scalar()
    
    # Flagged feedback
    flagged_feedback = db.query(func.count(Feedback.id)).filter(
        and_(
            Feedback.created_at >= yesterday,
            Feedback.created_at < today,
            Feedback.is_flagged == True
        )
    ).scalar()
    
    # Pending goal approvals
    from app.models.performance import PerformanceObjective, GoalApprovalStatus
    pending_goals = db.query(func.count(PerformanceObjective.id)).filter(
        PerformanceObjective.approval_status == GoalApprovalStatus.PENDING
    ).scalar()
    
    # Unread notifications
    unread_notifs = db.query(func.count(InAppNotification.id)).filter(
        InAppNotification.is_read == False
    ).scalar()
    
    digest = {
        "enabled": True,
        "date": yesterday.strftime("%Y-%m-%d"),
        "summary": {
            "new_users": new_users or 0,
            "new_feedback": new_feedback or 0,
            "flagged_feedback": flagged_feedback or 0,
            "pending_goal_approvals": pending_goals or 0,
            "unread_notifications": unread_notifs or 0
        },
        "generated_at": today.isoformat()
    }
    
    return digest


# Legacy compatibility - keep existing notification service functions
def notify_feedback_recipients(db: Session, feedback, send_email: bool = False):
    """
    Existing function - kept for compatibility
    Enhanced to use new notification system
    """
    if feedback.recipient_type == "USER" and feedback.recipient_id:
        create_inapp_notification(
            user_id=feedback.recipient_id,
            notif_type="feedback_received",
            title="New Feedback Received",
            message=f"You've received new feedback",
            link="/feedback",
            db=db
        )


def send_weekly_digest_email(db: Session):
    """
    Existing function - kept for compatibility
    """
    # Use existing logic or delegate to daily_admin_digest
    pass

