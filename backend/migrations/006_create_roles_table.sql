-- Migration 006: Create Roles Management Table
-- This table stores custom role definitions

CREATE TABLE IF NOT EXISTS custom_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT 0,  -- Cannot be deleted if true
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system roles
INSERT OR IGNORE INTO custom_roles (name, display_name, description, is_system_role) VALUES
('admin', 'Administrator', 'Full system access with all permissions', 1),
('manager', 'Manager', 'Can manage team members and department resources', 1),
('employee', 'Employee', 'Standard user with basic access', 1);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_custom_roles_timestamp 
AFTER UPDATE ON custom_roles
BEGIN
    UPDATE custom_roles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

