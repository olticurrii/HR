-- Migration: Create organization settings table
-- Description: Adds organization-level settings including break management

CREATE TABLE IF NOT EXISTS organization_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    allow_breaks BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert default settings
INSERT INTO organization_settings (id, allow_breaks) VALUES (1, 1);

