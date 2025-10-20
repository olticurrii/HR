-- Migration 020: Create notification system
-- Date: 2025-10-19
-- Description: Add notification tables, preferences, and feature flags

-- Add notification feature flags to organization_settings
ALTER TABLE organization_settings ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE organization_settings ADD COLUMN inapp_notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE organization_settings ADD COLUMN daily_summary_enabled BOOLEAN DEFAULT TRUE;

-- Create in-app notifications table
CREATE TABLE IF NOT EXISTS inapp_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for in-app notifications
CREATE INDEX IF NOT EXISTS idx_inapp_notif_user ON inapp_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_inapp_notif_type ON inapp_notifications(type);
CREATE INDEX IF NOT EXISTS idx_inapp_notif_is_read ON inapp_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_inapp_notif_created_at ON inapp_notifications(created_at);

-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    
    -- Email preferences
    email_task_assigned BOOLEAN DEFAULT TRUE,
    email_task_completed BOOLEAN DEFAULT TRUE,
    email_task_overdue BOOLEAN DEFAULT TRUE,
    email_goal_approved BOOLEAN DEFAULT TRUE,
    email_goal_rejected BOOLEAN DEFAULT TRUE,
    email_feedback_received BOOLEAN DEFAULT TRUE,
    email_review_due BOOLEAN DEFAULT TRUE,
    email_leave_approved BOOLEAN DEFAULT TRUE,
    email_leave_rejected BOOLEAN DEFAULT TRUE,
    email_mention BOOLEAN DEFAULT TRUE,
    
    -- In-app preferences
    inapp_task_assigned BOOLEAN DEFAULT TRUE,
    inapp_task_completed BOOLEAN DEFAULT TRUE,
    inapp_task_overdue BOOLEAN DEFAULT TRUE,
    inapp_goal_approved BOOLEAN DEFAULT TRUE,
    inapp_goal_rejected BOOLEAN DEFAULT TRUE,
    inapp_feedback_received BOOLEAN DEFAULT TRUE,
    inapp_review_due BOOLEAN DEFAULT TRUE,
    inapp_leave_approved BOOLEAN DEFAULT TRUE,
    inapp_leave_rejected BOOLEAN DEFAULT TRUE,
    inapp_mention BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for user_notification_preferences
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_user ON user_notification_preferences(user_id);

