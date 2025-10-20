-- Migration 007: Add custom roles support for users
-- Users can have one system role (admin/manager/employee) and multiple custom roles

-- Create junction table for user custom roles
CREATE TABLE IF NOT EXISTS user_custom_roles (
    user_id INTEGER NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_name) REFERENCES custom_roles(name) ON DELETE CASCADE
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_custom_roles_user_id ON user_custom_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_roles_role_name ON user_custom_roles(role_name);

-- Add comment to clarify the role field is the system role
-- Note: SQLite doesn't support column comments, but we document it here
-- users.role = system role (admin, manager, employee)
-- user_custom_roles = additional custom roles

