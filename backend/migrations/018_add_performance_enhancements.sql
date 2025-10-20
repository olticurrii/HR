-- Migration 018: Add performance module enhancements
-- Date: 2025-10-18
-- Description: Add performance feature flags, goal approval tracking, anonymous peer reviews, and KPI snapshots

-- Add performance feature flag (only add the missing one)
-- Note: Other performance columns already exist from previous migration
ALTER TABLE organization_settings ADD COLUMN performance_module_enabled BOOLEAN DEFAULT TRUE;

-- Add goal approval tracking to performance_objectives (only add created_by_id if missing)
-- Note: Other approval columns may already exist from previous migration
ALTER TABLE performance_objectives ADD COLUMN created_by_id INTEGER REFERENCES users(id);

-- Create index for approval queries
CREATE INDEX IF NOT EXISTS idx_objectives_approval_status ON performance_objectives(approval_status);
CREATE INDEX IF NOT EXISTS idx_objectives_approved_by ON performance_objectives(approved_by_id);

-- Add anonymous peer review support to review_responses
ALTER TABLE review_responses ADD COLUMN is_anonymous_peer BOOLEAN DEFAULT FALSE;

-- Create KPI snapshots table for trend tracking
CREATE TABLE IF NOT EXISTS kpi_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    kpi_name VARCHAR(255) NOT NULL,
    value REAL NOT NULL,
    unit VARCHAR(50),
    snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for KPI snapshots
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_user ON kpi_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_name ON kpi_snapshots(kpi_name);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_date ON kpi_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_user_name ON kpi_snapshots(user_id, kpi_name);

