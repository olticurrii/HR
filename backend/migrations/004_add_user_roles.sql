-- Migration: Add role column to users table for RBAC
-- Date: 2025-10-18

-- Add role column
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'employee';

-- Update existing admin users
UPDATE users SET role = 'admin' WHERE is_admin = 1;

-- Update users with manager_id set (they might be managers)
-- You can customize this logic based on your needs
UPDATE users SET role = 'manager' 
WHERE manager_id IS NULL 
AND id IN (SELECT DISTINCT manager_id FROM users WHERE manager_id IS NOT NULL)
AND role != 'admin';

-- Create index on role for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

