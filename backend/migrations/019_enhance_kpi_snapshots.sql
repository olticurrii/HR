-- Migration 019: Enhance KPI snapshots with metadata fields
-- Date: 2025-10-19
-- Description: Add snapshot metadata (date, period, visibility, measured_by)

-- Add new columns to kpi_snapshots
ALTER TABLE kpi_snapshots ADD COLUMN period VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE kpi_snapshots ADD COLUMN visibility VARCHAR(20) DEFAULT 'manager';
ALTER TABLE kpi_snapshots ADD COLUMN measured_by_id INTEGER REFERENCES users(id);

-- Note: snapshot_date already exists, but we'll make sure it has proper default
-- The existing snapshot_date column will be used as-is

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_period ON kpi_snapshots(period);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_visibility ON kpi_snapshots(visibility);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_measured_by ON kpi_snapshots(measured_by_id);

