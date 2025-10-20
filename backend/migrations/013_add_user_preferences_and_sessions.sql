-- Migration 013: Add user preferences and session tracking
-- Date: 2025-10-18

-- Add preference columns to users table
ALTER TABLE users ADD COLUMN timezone VARCHAR DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN locale VARCHAR DEFAULT 'en';
ALTER TABLE users ADD COLUMN theme VARCHAR DEFAULT 'light';
ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR NOT NULL,
    device_info VARCHAR,
    ip_address VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

