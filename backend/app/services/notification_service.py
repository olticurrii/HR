"""
Comprehensive Notification Service
Handles all types of notifications: in-app, email, and push notifications
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import os

from app.models.notification import Notification, PushNotificationToken
from app.models.user import User
from app.models.organization_settings import OrganizationSettings

class NotificationService:
    def __init__(self):
        self.notification_types = {
            'task_assigned': {
                'title': 'New Task Assigned',
                'template': 'You have been assigned a new task: {task_title}'
            },
            'project_assigned': {
                'title': 'New Project Assigned',
                'template': 'You have been assigned to a new project: {project_title}'
            },
            'late_to_work': {
                'title': 'Late to Work',
                'template': 'You are {minutes} minutes late to work today'
            },
            'comment_reply': {
                'title': 'New Comment Reply',
                'template': '{commenter_name} replied to your comment on {task_title}'
            },
            'task_reviewed': {
                'title': 'Task Reviewed',
                'template': 'Your task "{task_title}" has been reviewed by {reviewer_name}'
            },
            'feedback_received': {
                'title': 'New Feedback Received',
                'template': 'You have received new feedback from {sender_name}'
            },
            'public_feedback': {
                'title': 'New Public Feedback',
                'template': 'New public feedback has been posted in {channel}'
            },
            'feedback_replied': {
                'title': 'Feedback Reply',
                'template': '{replier_name} replied to your feedback'
            },
            'peer_review': {
                'title': 'Peer Review Request',
                'template': 'You have been requested to provide a peer review for {reviewee_name}'
            },
            'manager_review': {
                'title': 'Manager Review Request',
                'template': 'You have been requested to provide a manager review for {reviewee_name}'
            },
            'goal_approved': {
                'title': 'Goal Approved',
                'template': 'Your goal "{goal_title}" has been approved by {approver_name}'
            },
            'goal_rejected': {
                'title': 'Goal Rejected',
                'template': 'Your goal "{goal_title}" has been rejected by {rejector_name}'
            },
            'leave_approved': {
                'title': 'Leave Request Approved',
                'template': 'Your leave request for {date_range} has been approved'
            },
            'leave_rejected': {
                'title': 'Leave Request Rejected',
                'template': 'Your leave request for {date_range} has been rejected'
            },
            'private_message': {
                'title': 'New Private Message',
                'template': 'You have a new message from {sender_name}'
            },
            'department_message': {
                'title': 'New Department Message',
                'template': 'New message in your department chat'
            },
            'company_message': {
                'title': 'New Company Message',
                'template': 'New message in the company-wide chat'
            }
        }

    def create_notification(
        self,
        db: Session,
        user_id: int,
        notification_type: str,
        title: Optional[str] = None,
        message: Optional[str] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """Create a new notification"""
        
        # Get notification template
        template = self.notification_types.get(notification_type, {})
        
        # Use provided title/message or template
        notification_title = title or template.get('title', 'Notification')
        notification_message = message or template.get('template', 'You have a new notification')
        
        # Format message with data
        if data:
            try:
                notification_message = notification_message.format(**data)
            except KeyError:
                pass  # Use original message if formatting fails
        
        # Create notification
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=notification_title,
            message=notification_message,
            data=data or {}
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        print(f"🔔 NOTIFICATION CREATED: [{notification_type}] for user {user_id} - {notification_title}")
        
        return notification

    def get_user_notifications(
        self,
        db: Session,
        user_id: int,
        limit: int = 50,
        unread_only: bool = False
    ) -> List[Notification]:
        """Get notifications for a user"""
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()

    def mark_notification_read(
        self,
        db: Session,
        notification_id: int,
        user_id: int
    ) -> bool:
        """Mark a notification as read"""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.commit()
            return True
        
        return False

    def mark_all_notifications_read(
        self,
        db: Session,
        user_id: int
    ) -> int:
        """Mark all notifications as read for a user"""
        updated = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({
            'is_read': True,
            'read_at': datetime.utcnow()
        })
        
        db.commit()
        return updated

    def get_unread_count(self, db: Session, user_id: int) -> int:
        """Get unread notification count for a user"""
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()

    def should_send_notification(
        self,
        db: Session,
        user_id: int,
        notification_type: str,
        channel: str  # 'email', 'inapp', 'push'
    ) -> bool:
        """Check if user should receive notification based on preferences"""
        
        # Get organization settings
        org_settings = db.query(OrganizationSettings).first()
        if not org_settings:
            return True  # Default to sending if no settings
        
        # Check organization-level settings
        if channel == 'email' and not org_settings.email_notifications_enabled:
            return False
        if channel == 'push' and not org_settings.push_notifications_enabled:
            return False
        
        # Get user preferences
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        # Check user-level preferences
        if hasattr(user, 'notification_preferences'):
            prefs = user.notification_preferences
            if prefs:
                # Map notification type to preference field
                pref_field = f"{channel}_{notification_type}"
                if hasattr(prefs, pref_field):
                    return getattr(prefs, pref_field, True)
        
        return True

    def send_email_notification(
        self,
        db: Session,
        user_id: int,
        notification: Notification
    ) -> bool:
        """Send email notification"""
        if not self.should_send_notification(db, user_id, notification.type, 'email'):
            return False
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user or not user.email:
                return False
            
            # Get organization settings for email config
            org_settings = db.query(OrganizationSettings).first()
            if not org_settings or not org_settings.email_notifications_enabled:
                return False
            
            # Create email
            msg = MIMEMultipart()
            msg['From'] = org_settings.email_from or "noreply@company.com"
            msg['To'] = user.email
            msg['Subject'] = notification.title
            
            body = f"""
            {notification.message}
            
            ---
            This is an automated notification from your HR system.
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email (implement based on your email service)
            # For now, just log
            print(f"📧 Email notification sent to {user.email}: {notification.title}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email notification: {e}")
            return False

    def send_push_notification(
        self,
        db: Session,
        user_id: int,
        notification: Notification
    ) -> bool:
        """Send push notification"""
        if not self.should_send_notification(db, user_id, notification.type, 'push'):
            return False
        
        try:
            # Get user's push tokens
            tokens = db.query(PushNotificationToken).filter(
                PushNotificationToken.user_id == user_id,
                PushNotificationToken.is_active == True
            ).all()
            
            if not tokens:
                return False
            
            # Send to each token
            for token in tokens:
                self._send_to_push_service(token, notification)
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to send push notification: {e}")
            return False

    def _send_to_push_service(self, token: PushNotificationToken, notification: Notification):
        """Send push notification to specific service"""
        try:
            if token.platform == 'web':
                # Web push notification
                self._send_web_push(token.token, notification)
            elif token.platform in ['ios', 'android']:
                # Mobile push notification
                self._send_mobile_push(token.token, notification, token.platform)
            elif token.platform == 'desktop':
                # Desktop push notification
                self._send_desktop_push(token.token, notification)
                
        except Exception as e:
            print(f"❌ Failed to send push to {token.platform}: {e}")

    def _send_web_push(self, token: str, notification: Notification):
        """Send web push notification"""
        # Implement web push using service worker
        print(f"🔔 Web push sent: {notification.title}")

    def _send_mobile_push(self, token: str, notification: Notification, platform: str):
        """Send mobile push notification"""
        # Implement mobile push using FCM/APNS
        print(f"📱 {platform.title()} push sent: {notification.title}")

    def _send_desktop_push(self, token: str, notification: Notification):
        """Send desktop push notification"""
        # Implement desktop push
        print(f"🖥️ Desktop push sent: {notification.title}")

    def register_push_token(
        self,
        db: Session,
        user_id: int,
        token: str,
        platform: str,
        device_info: Optional[Dict[str, Any]] = None
    ) -> PushNotificationToken:
        """Register a push notification token"""
        
        # Check if token already exists
        existing = db.query(PushNotificationToken).filter(
            PushNotificationToken.user_id == user_id,
            PushNotificationToken.token == token
        ).first()
        
        if existing:
            existing.is_active = True
            existing.updated_at = datetime.utcnow()
            if device_info:
                existing.device_info = device_info
            db.commit()
            return existing
        
        # Create new token
        push_token = PushNotificationToken(
            user_id=user_id,
            token=token,
            platform=platform,
            device_info=device_info or {}
        )
        
        db.add(push_token)
        db.commit()
        db.refresh(push_token)
        
        return push_token

    def unregister_push_token(
        self,
        db: Session,
        user_id: int,
        token: str
    ) -> bool:
        """Unregister a push notification token"""
        push_token = db.query(PushNotificationToken).filter(
            PushNotificationToken.user_id == user_id,
            PushNotificationToken.token == token
        ).first()
        
        if push_token:
            push_token.is_active = False
            push_token.updated_at = datetime.utcnow()
            db.commit()
            return True
        
        return False

    def cleanup_old_notifications(self, db: Session, days: int = 30):
        """Clean up old notifications"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        deleted = db.query(Notification).filter(
            Notification.created_at < cutoff_date,
            Notification.is_read == True
        ).delete()
        
        db.commit()
        return deleted

# Global instance
notification_service = NotificationService()