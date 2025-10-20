-- Migration 014: Add missing resource permissions
-- Date: 2025-10-18
-- Adds Profile, Performance, OrgChart, and other missing resources to permissions

-- Add Profile resource permissions
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Full access to profile management
('admin', 'profile', 1, 1, 1, 1),
-- Manager: Can view and edit profiles
('manager', 'profile', 1, 0, 1, 0),
-- Employee: Can view and edit own profile
('employee', 'profile', 1, 0, 1, 0);

-- Add Performance resource permissions
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Full access to performance management
('admin', 'performance', 1, 1, 1, 1),
-- Manager: Can view and manage performance
('manager', 'performance', 1, 1, 1, 1),
-- Employee: Can view own performance
('employee', 'performance', 1, 0, 0, 0);

-- Add OrgChart resource permissions
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Full access to org chart
('admin', 'orgchart', 1, 1, 1, 1),
-- Manager: Can view and modify org chart
('manager', 'orgchart', 1, 0, 1, 0),
-- Employee: Can only view org chart
('employee', 'orgchart', 1, 0, 0, 0);

-- Add Sessions resource permissions (for session management)
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Can view and manage all sessions
('admin', 'sessions', 1, 1, 1, 1),
-- Manager: Can only manage own sessions
('manager', 'sessions', 1, 0, 1, 1),
-- Employee: Can only manage own sessions
('employee', 'sessions', 1, 0, 1, 1);

-- Add Reports resource permissions
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Full access to reports
('admin', 'reports', 1, 1, 1, 1),
-- Manager: Can view and create reports
('manager', 'reports', 1, 1, 0, 0),
-- Employee: Can only view reports
('employee', 'reports', 1, 0, 0, 0);

-- Add Analytics resource permissions
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Full access to analytics
('admin', 'analytics', 1, 1, 1, 1),
-- Manager: Can view analytics
('manager', 'analytics', 1, 0, 0, 0),
-- Employee: Limited analytics access
('employee', 'analytics', 0, 0, 0, 0);

-- Add Insights resource permissions (for feedback insights)
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Full access to insights
('admin', 'insights', 1, 1, 1, 1),
-- Manager: Can view insights
('manager', 'insights', 1, 0, 0, 0),
-- Employee: No access to insights
('employee', 'insights', 0, 0, 0, 0);

-- Add Comments resource permissions
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Full access to comments
('admin', 'comments', 1, 1, 1, 1),
-- Manager: Can manage comments
('manager', 'comments', 1, 1, 1, 1),
-- Employee: Can view, create, and edit own comments
('employee', 'comments', 1, 1, 1, 0);

-- Add Notifications resource permissions
INSERT OR IGNORE INTO role_permissions_v2 (role, resource, can_view, can_create, can_edit, can_delete) VALUES
-- Admin: Full access to notifications
('admin', 'notifications', 1, 1, 1, 1),
-- Manager: Can manage notifications
('manager', 'notifications', 1, 1, 1, 0),
-- Employee: Can view and manage own notifications
('employee', 'notifications', 1, 0, 1, 0);

