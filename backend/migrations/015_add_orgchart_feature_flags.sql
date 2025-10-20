-- Migration 015: Add Org Chart Feature Flags
-- Date: 2025-10-18
-- Adds 5 feature flags for org chart enhancements

-- Add org chart feature flag columns
ALTER TABLE organization_settings ADD COLUMN orgchart_show_unassigned_panel BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE organization_settings ADD COLUMN orgchart_manager_subtree_edit BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE organization_settings ADD COLUMN orgchart_department_colors BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE organization_settings ADD COLUMN orgchart_compact_view BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE organization_settings ADD COLUMN orgchart_show_connectors BOOLEAN DEFAULT TRUE NOT NULL;

-- Update existing settings row if it exists
UPDATE organization_settings 
SET 
    orgchart_show_unassigned_panel = TRUE,
    orgchart_manager_subtree_edit = TRUE,
    orgchart_department_colors = TRUE,
    orgchart_compact_view = FALSE,
    orgchart_show_connectors = TRUE
WHERE id = 1;

