-- Migration 020: Create comprehensive notification system
-- Add notification tables and user preferences

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- task_assigned, project_assigned, late_to_work, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON, -- Additional data like task_id, project_id, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Add missing columns to existing user_notification_preferences table
ALTER TABLE user_notification_preferences ADD COLUMN email_project_assigned BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_late_to_work BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_comment_reply BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_task_reviewed BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_public_feedback BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_feedback_replied BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_peer_review BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_manager_review BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_private_message BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_department_message BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN email_company_message BOOLEAN DEFAULT TRUE;

ALTER TABLE user_notification_preferences ADD COLUMN inapp_project_assigned BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_late_to_work BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_comment_reply BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_task_reviewed BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_public_feedback BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_feedback_replied BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_peer_review BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_manager_review BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_private_message BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_department_message BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN inapp_company_message BOOLEAN DEFAULT TRUE;

-- Add push notification columns
ALTER TABLE user_notification_preferences ADD COLUMN push_task_assigned BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_task_completed BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_task_overdue BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_goal_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_goal_rejected BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_feedback_received BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_review_due BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_leave_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_leave_rejected BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_mention BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_project_assigned BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_late_to_work BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_comment_reply BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_task_reviewed BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_public_feedback BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_feedback_replied BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_peer_review BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_manager_review BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_private_message BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_department_message BOOLEAN DEFAULT TRUE;
ALTER TABLE user_notification_preferences ADD COLUMN push_company_message BOOLEAN DEFAULT TRUE;

-- Create push notification tokens table for mobile/desktop
CREATE TABLE IF NOT EXISTS push_notification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'web', 'ios', 'android', 'desktop'
    device_info JSON, -- device name, browser, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token)
);

-- Create index for push tokens
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_platform ON push_notification_tokens(platform);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_notification_tokens(is_active);

-- Add notification settings to organization_settings if not exists
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- We'll add these columns manually if they don't exist

-- Update existing user notification preferences with default values for new columns
UPDATE user_notification_preferences SET 
    email_project_assigned = TRUE,
    email_late_to_work = TRUE,
    email_comment_reply = TRUE,
    email_task_reviewed = TRUE,
    email_public_feedback = TRUE,
    email_feedback_replied = TRUE,
    email_peer_review = TRUE,
    email_manager_review = TRUE,
    email_private_message = TRUE,
    email_department_message = TRUE,
    email_company_message = TRUE,
    inapp_project_assigned = TRUE,
    inapp_late_to_work = TRUE,
    inapp_comment_reply = TRUE,
    inapp_task_reviewed = TRUE,
    inapp_public_feedback = TRUE,
    inapp_feedback_replied = TRUE,
    inapp_peer_review = TRUE,
    inapp_manager_review = TRUE,
    inapp_private_message = TRUE,
    inapp_department_message = TRUE,
    inapp_company_message = TRUE,
    push_task_assigned = TRUE,
    push_task_completed = TRUE,
    push_task_overdue = TRUE,
    push_goal_approved = TRUE,
    push_goal_rejected = TRUE,
    push_feedback_received = TRUE,
    push_review_due = TRUE,
    push_leave_approved = TRUE,
    push_leave_rejected = TRUE,
    push_mention = TRUE,
    push_project_assigned = TRUE,
    push_late_to_work = TRUE,
    push_comment_reply = TRUE,
    push_task_reviewed = TRUE,
    push_public_feedback = TRUE,
    push_feedback_replied = TRUE,
    push_peer_review = TRUE,
    push_manager_review = TRUE,
    push_private_message = TRUE,
    push_department_message = TRUE,
    push_company_message = TRUE
WHERE user_id IS NOT NULL;
