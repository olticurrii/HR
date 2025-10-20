from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class NotificationBase(BaseModel):
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = {}

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationOut(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class PushTokenCreate(BaseModel):
    token: str
    platform: str  # 'web', 'ios', 'android', 'desktop'
    device_info: Optional[Dict[str, Any]] = {}

class PushTokenOut(BaseModel):
    id: int
    user_id: int
    token: str
    platform: str
    device_info: Optional[Dict[str, Any]] = {}
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class NotificationPreferencesUpdate(BaseModel):
    # Task notifications
    email_task_assigned: Optional[bool] = None
    email_task_completed: Optional[bool] = None
    email_task_overdue: Optional[bool] = None
    inapp_task_assigned: Optional[bool] = None
    inapp_task_completed: Optional[bool] = None
    inapp_task_overdue: Optional[bool] = None
    push_task_assigned: Optional[bool] = None
    push_task_completed: Optional[bool] = None
    push_task_overdue: Optional[bool] = None
    
    # Project notifications
    email_project_assigned: Optional[bool] = None
    inapp_project_assigned: Optional[bool] = None
    push_project_assigned: Optional[bool] = None
    
    # Work notifications
    email_late_to_work: Optional[bool] = None
    inapp_late_to_work: Optional[bool] = None
    push_late_to_work: Optional[bool] = None
    
    # Comment notifications
    email_comment_reply: Optional[bool] = None
    inapp_comment_reply: Optional[bool] = None
    push_comment_reply: Optional[bool] = None
    
    # Review notifications
    email_task_reviewed: Optional[bool] = None
    inapp_task_reviewed: Optional[bool] = None
    push_task_reviewed: Optional[bool] = None
    
    # Feedback notifications
    email_feedback_received: Optional[bool] = None
    email_public_feedback: Optional[bool] = None
    email_feedback_replied: Optional[bool] = None
    inapp_feedback_received: Optional[bool] = None
    inapp_public_feedback: Optional[bool] = None
    inapp_feedback_replied: Optional[bool] = None
    push_feedback_received: Optional[bool] = None
    push_public_feedback: Optional[bool] = None
    push_feedback_replied: Optional[bool] = None
    
    # Review notifications
    email_peer_review: Optional[bool] = None
    email_manager_review: Optional[bool] = None
    email_review_due: Optional[bool] = None
    inapp_peer_review: Optional[bool] = None
    inapp_manager_review: Optional[bool] = None
    inapp_review_due: Optional[bool] = None
    push_peer_review: Optional[bool] = None
    push_manager_review: Optional[bool] = None
    push_review_due: Optional[bool] = None
    
    # Goal notifications
    email_goal_approved: Optional[bool] = None
    email_goal_rejected: Optional[bool] = None
    inapp_goal_approved: Optional[bool] = None
    inapp_goal_rejected: Optional[bool] = None
    push_goal_approved: Optional[bool] = None
    push_goal_rejected: Optional[bool] = None
    
    # Leave notifications
    email_leave_approved: Optional[bool] = None
    email_leave_rejected: Optional[bool] = None
    inapp_leave_approved: Optional[bool] = None
    inapp_leave_rejected: Optional[bool] = None
    push_leave_approved: Optional[bool] = None
    push_leave_rejected: Optional[bool] = None
    
    # Message notifications
    email_private_message: Optional[bool] = None
    email_department_message: Optional[bool] = None
    email_company_message: Optional[bool] = None
    inapp_private_message: Optional[bool] = None
    inapp_department_message: Optional[bool] = None
    inapp_company_message: Optional[bool] = None
    push_private_message: Optional[bool] = None
    push_department_message: Optional[bool] = None
    push_company_message: Optional[bool] = None
    
    # Mention notifications
    email_mention: Optional[bool] = None
    inapp_mention: Optional[bool] = None
    push_mention: Optional[bool] = None

class NotificationPreferencesOut(BaseModel):
    user_id: int
    
    # Task notifications
    email_task_assigned: bool
    email_task_completed: bool
    email_task_overdue: bool
    inapp_task_assigned: bool
    inapp_task_completed: bool
    inapp_task_overdue: bool
    push_task_assigned: bool
    push_task_completed: bool
    push_task_overdue: bool
    
    # Project notifications
    email_project_assigned: bool
    inapp_project_assigned: bool
    push_project_assigned: bool
    
    # Work notifications
    email_late_to_work: bool
    inapp_late_to_work: bool
    push_late_to_work: bool
    
    # Comment notifications
    email_comment_reply: bool
    inapp_comment_reply: bool
    push_comment_reply: bool
    
    # Review notifications
    email_task_reviewed: bool
    inapp_task_reviewed: bool
    push_task_reviewed: bool
    
    # Feedback notifications
    email_feedback_received: bool
    email_public_feedback: bool
    email_feedback_replied: bool
    inapp_feedback_received: bool
    inapp_public_feedback: bool
    inapp_feedback_replied: bool
    push_feedback_received: bool
    push_public_feedback: bool
    push_feedback_replied: bool
    
    # Review notifications
    email_peer_review: bool
    email_manager_review: bool
    email_review_due: bool
    inapp_peer_review: bool
    inapp_manager_review: bool
    inapp_review_due: bool
    push_peer_review: bool
    push_manager_review: bool
    push_review_due: bool
    
    # Goal notifications
    email_goal_approved: bool
    email_goal_rejected: bool
    inapp_goal_approved: bool
    inapp_goal_rejected: bool
    push_goal_approved: bool
    push_goal_rejected: bool
    
    # Leave notifications
    email_leave_approved: bool
    email_leave_rejected: bool
    inapp_leave_approved: bool
    inapp_leave_rejected: bool
    push_leave_approved: bool
    push_leave_rejected: bool
    
    # Message notifications
    email_private_message: bool
    email_department_message: bool
    email_company_message: bool
    inapp_private_message: bool
    inapp_department_message: bool
    inapp_company_message: bool
    push_private_message: bool
    push_department_message: bool
    push_company_message: bool
    
    # Mention notifications
    email_mention: bool
    inapp_mention: bool
    push_mention: bool
    
    class Config:
        from_attributes = True
