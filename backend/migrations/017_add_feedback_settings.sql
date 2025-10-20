-- Migration 017: Add Feedback Feature Settings
-- Date: 2025-10-18
-- Adds 5 feature flags for feedback enhancements

-- Add feedback feature flag columns
ALTER TABLE organization_settings ADD COLUMN feedback_allow_anonymous BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE organization_settings ADD COLUMN feedback_enable_threading BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE organization_settings ADD COLUMN feedback_enable_moderation BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE organization_settings ADD COLUMN feedback_notify_managers BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE organization_settings ADD COLUMN feedback_weekly_digest BOOLEAN DEFAULT TRUE NOT NULL;

-- Update existing settings row if it exists
UPDATE organization_settings 
SET 
    feedback_allow_anonymous = TRUE,
    feedback_enable_threading = TRUE,
    feedback_enable_moderation = TRUE,
    feedback_notify_managers = TRUE,
    feedback_weekly_digest = TRUE
WHERE id = 1;

