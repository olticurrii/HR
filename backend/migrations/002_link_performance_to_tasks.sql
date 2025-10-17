-- Link Performance to Tasks and Projects
-- This migration adds relationships between objectives and tasks/projects

-- Add columns to tasks table to link with objectives
ALTER TABLE tasks ADD COLUMN objective_id INTEGER;
ALTER TABLE tasks ADD COLUMN contributes_to_performance BOOLEAN DEFAULT TRUE;

-- Add columns to projects table to link with objectives  
ALTER TABLE projects ADD COLUMN objective_id INTEGER;

-- Add foreign keys (SQLite doesn't support ALTER TABLE ADD CONSTRAINT, so we note them for ORM)
-- performance_objectives ← tasks.objective_id
-- performance_objectives ← projects.objective_id

-- Create performance_metrics table for auto-calculated stats
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_tasks_assigned INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_completed_on_time INTEGER DEFAULT 0,
    tasks_overdue INTEGER DEFAULT 0,
    completion_rate REAL DEFAULT 0.0,
    on_time_rate REAL DEFAULT 0.0,
    total_projects INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    average_task_quality_score REAL DEFAULT 0.0,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON performance_metrics(period_start, period_end);

-- Add task completion tracking
CREATE TABLE IF NOT EXISTS task_completion_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    was_on_time BOOLEAN DEFAULT TRUE,
    quality_score INTEGER DEFAULT 3 CHECK(quality_score >= 1 AND quality_score <= 5),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_completion_history_user_id ON task_completion_history(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completion_history_task_id ON task_completion_history(task_id);

