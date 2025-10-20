-- Migration 005: Create Role Permissions Table
-- This table stores granular permissions for each role

CREATE TABLE IF NOT EXISTS role_permissions_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    can_view BOOLEAN DEFAULT 0,
    can_create BOOLEAN DEFAULT 0,
    can_edit BOOLEAN DEFAULT 0,
    can_delete BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, resource)
);

-- Seed default permissions for Admin role (full access)
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
('admin', 'users', 1, 1, 1, 1),
('admin', 'tasks', 1, 1, 1, 1),
('admin', 'projects', 1, 1, 1, 1),
('admin', 'time', 1, 1, 1, 1),
('admin', 'departments', 1, 1, 1, 1),
('admin', 'roles', 1, 1, 1, 1),
('admin', 'settings', 1, 1, 1, 1),
('admin', 'chat', 1, 1, 1, 1),
('admin', 'documents', 1, 1, 1, 1),
('admin', 'feedback', 1, 1, 1, 1),
('admin', 'leave', 1, 1, 1, 1);

-- Seed default permissions for Manager role
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
('manager', 'users', 1, 0, 1, 0),
('manager', 'tasks', 1, 1, 1, 1),
('manager', 'projects', 1, 1, 1, 1),
('manager', 'time', 1, 0, 1, 0),
('manager', 'departments', 1, 0, 0, 0),
('manager', 'roles', 0, 0, 0, 0),
('manager', 'settings', 0, 0, 0, 0),
('manager', 'chat', 1, 1, 1, 0),
('manager', 'documents', 1, 1, 1, 0),
('manager', 'feedback', 1, 1, 1, 0),
('manager', 'leave', 1, 1, 1, 0);

-- Seed default permissions for Employee role
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
('employee', 'users', 0, 0, 0, 0),
('employee', 'tasks', 1, 0, 1, 0),
('employee', 'projects', 1, 0, 0, 0),
('employee', 'time', 1, 1, 1, 0),
('employee', 'departments', 0, 0, 0, 0),
('employee', 'roles', 0, 0, 0, 0),
('employee', 'settings', 0, 0, 0, 0),
('employee', 'chat', 1, 1, 1, 0),
('employee', 'documents', 1, 0, 0, 0),
('employee', 'feedback', 1, 1, 0, 0),
('employee', 'leave', 1, 1, 1, 0);

