-- Migration 016: Enhance Feedback Module
-- Date: 2025-10-18
-- Adds threading, moderation, and notification support

-- Add new columns to feedback table
ALTER TABLE feedback ADD COLUMN parent_id INTEGER REFERENCES feedback(id);
ALTER TABLE feedback ADD COLUMN is_flagged BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE feedback ADD COLUMN flagged_reason VARCHAR;

-- Create index for threading queries
CREATE INDEX IF NOT EXISTS idx_feedback_parent_id ON feedback(parent_id);

-- Create feedback_notifications table for tracking sent notifications
CREATE TABLE IF NOT EXISTS feedback_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feedback_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    notification_type VARCHAR NOT NULL, -- 'email', 'in_app'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedback (id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feedback_notifications_feedback_id ON feedback_notifications(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_notifications_recipient_id ON feedback_notifications(recipient_id);

