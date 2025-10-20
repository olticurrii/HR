-- Migration: Add require_documentation to organization settings
-- Description: Adds setting to require work documentation when clocking out

ALTER TABLE organization_settings ADD COLUMN require_documentation BOOLEAN NOT NULL DEFAULT 0;

