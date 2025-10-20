-- Migration 019: Create insights aggregates table for faster queries
-- Daily feedback aggregates for analytics and forecasting

CREATE TABLE IF NOT EXISTS daily_feedback_aggregates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL UNIQUE,
    feedback_count INTEGER DEFAULT 0,
    sentiment_avg REAL DEFAULT 0.0,
    sentiment_positive_count INTEGER DEFAULT 0,
    sentiment_neutral_count INTEGER DEFAULT 0,
    sentiment_negative_count INTEGER DEFAULT 0,
    anonymous_count INTEGER DEFAULT 0,
    flagged_count INTEGER DEFAULT 0,
    department_breakdown TEXT,  -- JSON: {"Engineering": 5, "HR": 3, ...}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_agg_date ON daily_feedback_aggregates(date);

-- Keyword tracking table
CREATE TABLE IF NOT EXISTS feedback_keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    frequency INTEGER DEFAULT 1,
    sentiment_context TEXT,  -- 'positive', 'negative', 'neutral'
    department TEXT,
    first_seen DATE NOT NULL,
    last_seen DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON feedback_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_keywords_frequency ON feedback_keywords(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_department ON feedback_keywords(department);
CREATE INDEX IF NOT EXISTS idx_keywords_sentiment ON feedback_keywords(sentiment_context);

