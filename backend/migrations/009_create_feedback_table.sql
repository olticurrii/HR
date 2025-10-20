-- Migration: Create feedback table
-- Description: Adds feedback system with sentiment analysis and anonymous feedback support

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    recipient_type VARCHAR(10) NOT NULL CHECK (recipient_type IN ('USER', 'ADMIN', 'EVERYONE')),
    recipient_id INTEGER,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT 0,
    sentiment_label VARCHAR(10) CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
    sentiment_score REAL,
    keywords TEXT,  -- JSON stored as TEXT in SQLite
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_feedback_author_id ON feedback(author_id);
CREATE INDEX IF NOT EXISTS idx_feedback_recipient_id ON feedback(recipient_id);
CREATE INDEX IF NOT EXISTS idx_feedback_recipient_type ON feedback(recipient_type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_sentiment_label ON feedback(sentiment_label);

