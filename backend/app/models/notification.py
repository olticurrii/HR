from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    TASK_ASSIGNED = "task_assigned"
    TASK_COMPLETED = "task_completed"
    TASK_OVERDUE = "task_overdue"
    PROJECT_ASSIGNED = "project_assigned"
    LATE_TO_WORK = "late_to_work"
    COMMENT_REPLY = "comment_reply"
    TASK_REVIEWED = "task_reviewed"
    FEEDBACK_RECEIVED = "feedback_received"
    PUBLIC_FEEDBACK = "public_feedback"
    FEEDBACK_REPLIED = "feedback_replied"
    PEER_REVIEW = "peer_review"
    MANAGER_REVIEW = "manager_review"
    GOAL_APPROVED = "goal_approved"
    GOAL_REJECTED = "goal_rejected"
    LEAVE_APPROVED = "leave_approved"
    LEAVE_REJECTED = "leave_rejected"
    PRIVATE_MESSAGE = "private_message"
    DEPARTMENT_MESSAGE = "department_message"
    COMPANY_MESSAGE = "company_message"
    MENTION = "mention"

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # task_assigned, project_assigned, etc.
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)  # Additional data like task_id, project_id, etc.
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    read_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="notifications")

# Alias for backward compatibility
InAppNotification = Notification

class UserNotificationPreferences(Base):
    __tablename__ = "user_notification_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Task notifications
    email_task_assigned = Column(Boolean, default=True)
    email_task_completed = Column(Boolean, default=True)
    email_task_overdue = Column(Boolean, default=True)
    inapp_task_assigned = Column(Boolean, default=True)
    inapp_task_completed = Column(Boolean, default=True)
    inapp_task_overdue = Column(Boolean, default=True)
    push_task_assigned = Column(Boolean, default=True)
    push_task_completed = Column(Boolean, default=True)
    push_task_overdue = Column(Boolean, default=True)
    
    # Project notifications
    email_project_assigned = Column(Boolean, default=True)
    inapp_project_assigned = Column(Boolean, default=True)
    push_project_assigned = Column(Boolean, default=True)
    
    # Work notifications
    email_late_to_work = Column(Boolean, default=True)
    inapp_late_to_work = Column(Boolean, default=True)
    push_late_to_work = Column(Boolean, default=True)
    
    # Comment notifications
    email_comment_reply = Column(Boolean, default=True)
    inapp_comment_reply = Column(Boolean, default=True)
    push_comment_reply = Column(Boolean, default=True)
    
    # Review notifications
    email_task_reviewed = Column(Boolean, default=True)
    inapp_task_reviewed = Column(Boolean, default=True)
    push_task_reviewed = Column(Boolean, default=True)
    
    # Feedback notifications
    email_feedback_received = Column(Boolean, default=True)
    email_public_feedback = Column(Boolean, default=True)
    email_feedback_replied = Column(Boolean, default=True)
    inapp_feedback_received = Column(Boolean, default=True)
    inapp_public_feedback = Column(Boolean, default=True)
    inapp_feedback_replied = Column(Boolean, default=True)
    push_feedback_received = Column(Boolean, default=True)
    push_public_feedback = Column(Boolean, default=True)
    push_feedback_replied = Column(Boolean, default=True)
    
    # Review notifications
    email_peer_review = Column(Boolean, default=True)
    email_manager_review = Column(Boolean, default=True)
    email_review_due = Column(Boolean, default=True)
    inapp_peer_review = Column(Boolean, default=True)
    inapp_manager_review = Column(Boolean, default=True)
    inapp_review_due = Column(Boolean, default=True)
    push_peer_review = Column(Boolean, default=True)
    push_manager_review = Column(Boolean, default=True)
    push_review_due = Column(Boolean, default=True)
    
    # Goal notifications
    email_goal_approved = Column(Boolean, default=True)
    email_goal_rejected = Column(Boolean, default=True)
    inapp_goal_approved = Column(Boolean, default=True)
    inapp_goal_rejected = Column(Boolean, default=True)
    push_goal_approved = Column(Boolean, default=True)
    push_goal_rejected = Column(Boolean, default=True)
    
    # Leave notifications
    email_leave_approved = Column(Boolean, default=True)
    email_leave_rejected = Column(Boolean, default=True)
    inapp_leave_approved = Column(Boolean, default=True)
    inapp_leave_rejected = Column(Boolean, default=True)
    push_leave_approved = Column(Boolean, default=True)
    push_leave_rejected = Column(Boolean, default=True)
    
    # Message notifications
    email_private_message = Column(Boolean, default=True)
    email_department_message = Column(Boolean, default=True)
    email_company_message = Column(Boolean, default=True)
    inapp_private_message = Column(Boolean, default=True)
    inapp_department_message = Column(Boolean, default=True)
    inapp_company_message = Column(Boolean, default=True)
    push_private_message = Column(Boolean, default=True)
    push_department_message = Column(Boolean, default=True)
    push_company_message = Column(Boolean, default=True)
    
    # Mention notifications
    email_mention = Column(Boolean, default=True)
    inapp_mention = Column(Boolean, default=True)
    push_mention = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="notification_preferences")

class PushNotificationToken(Base):
    __tablename__ = "push_notification_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(500), nullable=False)
    platform = Column(String(20), nullable=False, index=True)  # 'web', 'ios', 'android', 'desktop'
    device_info = Column(JSON, nullable=True)  # device name, browser, etc.
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="push_tokens")