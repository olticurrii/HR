-- Performance Management Tables Migration
-- Run this to add performance tracking to the HR system

-- Performance Objectives Table
CREATE TABLE IF NOT EXISTS performance_objectives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'closed', 'archived')),
    start_date DATETIME,
    due_date DATETIME,
    progress REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_performance_objectives_user_id ON performance_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_objectives_status ON performance_objectives(status);

-- Performance Key Results Table
CREATE TABLE IF NOT EXISTS performance_key_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    objective_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_value REAL,
    current_value REAL DEFAULT 0.0,
    unit VARCHAR(50),
    weight REAL DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'done')),
    progress REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (objective_id) REFERENCES performance_objectives(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_performance_key_results_objective_id ON performance_key_results(objective_id);

-- Review Cycles Table
CREATE TABLE IF NOT EXISTS review_cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Review Questions Table
CREATE TABLE IF NOT EXISTS review_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cycle_id INTEGER NOT NULL,
    section VARCHAR(20) NOT NULL CHECK(section IN ('manager', 'self', 'peer', 'competency')),
    prompt TEXT NOT NULL,
    scale_min INTEGER DEFAULT 1,
    scale_max INTEGER DEFAULT 5,
    FOREIGN KEY (cycle_id) REFERENCES review_cycles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_questions_cycle_id ON review_questions(cycle_id);

-- Review Responses Table
CREATE TABLE IF NOT EXISTS review_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cycle_id INTEGER NOT NULL,
    reviewee_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    reviewer_type VARCHAR(20) NOT NULL CHECK(reviewer_type IN ('manager', 'self', 'peer')),
    question_id INTEGER NOT NULL,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cycle_id) REFERENCES review_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES review_questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_responses_cycle_id ON review_responses(cycle_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_reviewee_id ON review_responses(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_reviewer_id ON review_responses(reviewer_id);

-- Competencies Table
CREATE TABLE IF NOT EXISTS competencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Competency Scores Table
CREATE TABLE IF NOT EXISTS competency_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cycle_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    competency_id INTEGER NOT NULL,
    source VARCHAR(20) NOT NULL CHECK(source IN ('manager', 'self', 'peer')),
    score REAL NOT NULL,
    FOREIGN KEY (cycle_id) REFERENCES review_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_competency_scores_cycle_id ON competency_scores(cycle_id);
CREATE INDEX IF NOT EXISTS idx_competency_scores_user_id ON competency_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_competency_scores_competency_id ON competency_scores(competency_id);

