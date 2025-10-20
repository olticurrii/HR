# Permissions Reference Guide

## Overview

This document lists all available resources and their permissions in the system. Admins can manage these permissions through the Permissions Management interface to control what each role (Admin, Manager, Employee) can do.

## Permission Actions

Each resource has four possible actions:
- **View** (`can_view`) - Can read/view the resource
- **Create** (`can_create`) - Can create new instances of the resource
- **Edit** (`can_edit`) - Can modify existing instances of the resource
- **Delete** (`can_delete`) - Can delete instances of the resource

## Available Resources

### 1. Users
**Resource:** `users`

Manages user accounts and profiles.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✗ | Edit ✓ | Delete ✗
- **Employee**: View ✗ | Create ✗ | Edit ✗ | Delete ✗

**Endpoints:**
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/{id}` - Get user details
- `PATCH /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

---

### 2. Profile
**Resource:** `profile`

User profile management (own profile).

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✗ | Edit ✓ | Delete ✗
- **Employee**: View ✓ | Create ✗ | Edit ✓ | Delete ✗

**Endpoints:**
- `GET /api/v1/me` - Get own profile
- `PATCH /api/v1/me` - Update own profile
- `POST /api/v1/me/avatar` - Upload avatar
- `POST /api/v1/me/change-password` - Change password

**Note:** All users can view and edit their own profile. This permission controls access to the profile feature itself.

---

### 3. Tasks
**Resource:** `tasks`

Task management and assignment.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Employee**: View ✓ | Create ✗ | Edit ✓ | Delete ✗

**Endpoints:**
- `GET /api/v1/tasks` - List tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/{id}` - Get task details
- `PATCH /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task

---

### 4. Projects
**Resource:** `projects`

Project management.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Employee**: View ✓ | Create ✗ | Edit ✗ | Delete ✗

**Endpoints:**
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/{id}` - Get project details
- `PATCH /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

---

### 5. Time Tracking
**Resource:** `time`

Employee time tracking and timesheets.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✗ | Edit ✓ | Delete ✗
- **Employee**: View ✓ | Create ✓ | Edit ✓ | Delete ✗

**Endpoints:**
- `GET /api/v1/time/entries` - List time entries
- `POST /api/v1/time/entries` - Create time entry
- `PATCH /api/v1/time/entries/{id}` - Update time entry
- `DELETE /api/v1/time/entries/{id}` - Delete time entry

---

### 6. Performance
**Resource:** `performance`

Performance reviews, goals, and KPIs.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Employee**: View ✓ | Create ✗ | Edit ✗ | Delete ✗

**Endpoints:**
- `GET /api/v1/me/performance/summary` - Get own performance
- `GET /api/v1/performance/objectives` - List objectives
- `POST /api/v1/performance/objectives` - Create objective
- `GET /api/v1/performance/reviews` - List reviews

**Note:** Employees can always view their own performance via `/me/performance/summary`.

---

### 7. Feedback
**Resource:** `feedback`

Anonymous and public feedback system.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✓ | Delete ✗
- **Employee**: View ✓ | Create ✓ | Edit ✗ | Delete ✗

**Endpoints:**
- `GET /api/v1/feedback/my` - Get feedback addressed to me
- `GET /api/v1/feedback/sent` - Get feedback I sent
- `POST /api/v1/feedback` - Create feedback
- `GET /api/v1/admin/feedback` - Admin: view all feedback

---

### 8. Insights
**Resource:** `insights`

Feedback analytics and insights (admin feature).

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✗ | Edit ✗ | Delete ✗
- **Employee**: View ✗ | Create ✗ | Edit ✗ | Delete ✗

**Endpoints:**
- `GET /api/v1/admin/feedback/insights` - Get feedback insights

---

### 9. Departments
**Resource:** `departments`

Organization department management.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✗ | Edit ✗ | Delete ✗
- **Employee**: View ✗ | Create ✗ | Edit ✗ | Delete ✗

**Endpoints:**
- `GET /api/v1/departments` - List departments
- `POST /api/v1/departments` - Create department
- `PATCH /api/v1/departments/{id}` - Update department
- `DELETE /api/v1/departments/{id}` - Delete department

---

### 10. OrgChart
**Resource:** `orgchart`

Organization chart viewing and management.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✗ | Edit ✓ | Delete ✗
- **Employee**: View ✓ | Create ✗ | Edit ✗ | Delete ✗

**Endpoints:**
- `GET /api/v1/orgchart` - Get org chart
- `PATCH /api/v1/orgchart/reassign` - Reassign employee

---

### 11. Chat
**Resource:** `chat`

Real-time messaging system.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✓ | Delete ✗
- **Employee**: View ✓ | Create ✓ | Edit ✓ | Delete ✗

**Endpoints:**
- `GET /api/v1/chat/rooms` - List chat rooms
- `GET /api/v1/chat/{id}/messages` - Get messages
- `POST /api/v1/chat/{id}/messages` - Send message
- WebSocket: `/ws/chat/{id}` - Real-time chat

---

### 12. Comments
**Resource:** `comments`

Comments on tasks and projects.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Employee**: View ✓ | Create ✓ | Edit ✓ | Delete ✗

**Endpoints:**
- `GET /api/v1/comments` - List comments
- `POST /api/v1/comments` - Create comment
- `PATCH /api/v1/comments/{id}` - Update comment
- `DELETE /api/v1/comments/{id}` - Delete comment

---

### 13. Leave Management
**Resource:** `leave`

Leave requests and balance management.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✓ | Delete ✗
- **Employee**: View ✓ | Create ✓ | Edit ✓ | Delete ✗

**Endpoints:**
- `GET /api/v1/leave/requests` - List leave requests
- `POST /api/v1/leave/requests` - Create leave request
- `PATCH /api/v1/leave/requests/{id}` - Update/approve leave
- `GET /api/v1/leave/balance` - Get leave balance

---

### 14. Sessions
**Resource:** `sessions`

User session management.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✗ | Edit ✓ | Delete ✓
- **Employee**: View ✓ | Create ✗ | Edit ✓ | Delete ✓

**Endpoints:**
- `GET /api/v1/me/sessions` - Get own sessions
- `POST /api/v1/me/sessions/revoke` - Revoke sessions

**Note:** Users can only manage their own sessions. Admins can view all sessions.

---

### 15. Roles
**Resource:** `roles`

Role and permission management.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✗ | Create ✗ | Edit ✗ | Delete ✗
- **Employee**: View ✗ | Create ✗ | Edit ✗ | Delete ✗

**Endpoints:**
- `GET /api/v1/admin/roles` - List roles
- `POST /api/v1/admin/roles` - Create role
- `PATCH /api/v1/admin/roles/{id}` - Update role
- `DELETE /api/v1/admin/roles/{id}` - Delete role

---

### 16. Settings
**Resource:** `settings`

Organization-wide settings.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✗ | Create ✗ | Edit ✗ | Delete ✗
- **Employee**: View ✗ | Create ✗ | Edit ✗ | Delete ✗

**Endpoints:**
- `GET /api/v1/settings` - Get organization settings
- `PATCH /api/v1/settings` - Update settings

---

### 17. Documents
**Resource:** `documents`

Document management and sharing.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✓ | Delete ✗
- **Employee**: View ✓ | Create ✗ | Edit ✗ | Delete ✗

**Note:** This is a placeholder for future document management features.

---

### 18. Reports
**Resource:** `reports`

Report generation and viewing.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✗ | Delete ✗
- **Employee**: View ✓ | Create ✗ | Edit ✗ | Delete ✗

**Note:** This is a placeholder for future reporting features.

---

### 19. Analytics
**Resource:** `analytics`

Analytics dashboards and metrics.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✗ | Edit ✗ | Delete ✗
- **Employee**: View ✗ | Create ✗ | Edit ✗ | Delete ✗

**Note:** This is a placeholder for future analytics features.

---

### 20. Notifications
**Resource:** `notifications`

User notification management.

**Default Permissions:**
- **Admin**: View ✓ | Create ✓ | Edit ✓ | Delete ✓
- **Manager**: View ✓ | Create ✓ | Edit ✓ | Delete ✗
- **Employee**: View ✓ | Create ✗ | Edit ✓ | Delete ✗

**Note:** This is a placeholder for future notification features.

---

## Managing Permissions

### Via Admin UI

1. Navigate to **Role Management** or **Permissions** page
2. Select a role (Admin, Manager, Employee)
3. Toggle permissions for each resource
4. Click **Save** to apply changes

### Via API

**Get All Permissions:**
```bash
GET /api/v1/admin/permissions
```

**Get Permissions for a Role:**
```bash
GET /api/v1/admin/permissions?role=manager
```

**Update Permission:**
```bash
PATCH /api/v1/admin/permissions/{role}/{resource}
{
  "can_view": true,
  "can_create": false,
  "can_edit": true,
  "can_delete": false
}
```

**Bulk Update:**
```bash
POST /api/v1/admin/permissions/bulk-update
[
  {
    "role": "manager",
    "resource": "tasks",
    "can_view": true,
    "can_create": true,
    "can_edit": true,
    "can_delete": true
  }
]
```

## Permission Inheritance

- **Admin role**: Has full access to all resources by default
- **Manager role**: Has elevated permissions for team management
- **Employee role**: Has basic access to own data and team resources

## Best Practices

1. **Principle of Least Privilege**: Only grant permissions that are necessary
2. **Regular Audits**: Review permissions periodically
3. **Test Changes**: Test permission changes in a development environment first
4. **Document Custom Changes**: Keep track of any custom permission configurations
5. **Backup**: Keep a backup of your permission settings before making bulk changes

## Security Notes

- Admins cannot remove their own admin permissions (prevents lockout)
- Changing permissions takes effect immediately
- Users must log out and back in to see permission changes in some cases
- Session-based permissions are cached for performance

## Troubleshooting

### User Can't Access a Feature

1. Check the user's role
2. Verify the resource permissions for that role
3. Ensure the user is logged in with a fresh session
4. Check if the feature requires specific permissions

### Permission Changes Not Taking Effect

1. Ask user to log out and log back in
2. Clear browser cache
3. Check server logs for permission errors
4. Verify the permission was actually saved in database

## Support

For questions or issues with permissions:
- Check this documentation
- Review the RBAC_IMPLEMENTATION_GUIDE.md
- Check backend logs for permission denials
- Consult with system administrators

---

**Last Updated:** 2025-10-18
**Total Resources:** 20
**Total Permission Entries:** 71 (20 resources × 3 roles + system entries)

