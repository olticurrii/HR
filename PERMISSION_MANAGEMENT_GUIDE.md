# Permission Management System Guide

## 🎯 Overview

The Permission Management System allows admins to control **viewing and editing access** for each role (Admin, Manager, Employee) across all resources in the application.

## 📋 Features Implemented

### 1. **Database Schema**
- Created `role_permissions_v2` table with columns:
  - `role`: admin, manager, employee
  - `resource`: users, tasks, projects, time, departments, etc.
  - `can_view`: Boolean - can view the resource
  - `can_create`: Boolean - can create new items
  - `can_edit`: Boolean - can modify existing items
  - `can_delete`: Boolean - can remove items

### 2. **Backend API Endpoints**
All endpoints are **admin-only** and prefixed with `/api/v1/admin/permissions`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/permissions` | Get all permissions (optional `?role=` filter) |
| GET | `/permissions/roles` | Get list of all roles |
| GET | `/permissions/resources` | Get list of all resources |
| GET | `/permissions/{role}/{resource}` | Get specific permission |
| PATCH | `/permissions/{role}/{resource}` | Update specific permission |
| POST | `/permissions/check` | Check if user has permission |
| POST | `/permissions/bulk-update` | Bulk update multiple permissions |

### 3. **Frontend UI**
- **Permissions Page** at `/permissions`
- Features:
  - ✅ Role tabs (Admin, Manager, Employee)
  - ✅ Interactive permission matrix
  - ✅ Real-time change tracking
  - ✅ Batch save functionality
  - ✅ Visual indicators for modified permissions
  - ✅ Prevents admins from locking themselves out

### 4. **Default Permissions**

**Admin Role:**
- Full access (view, create, edit, delete) to ALL resources

**Manager Role:**
- Users: view, edit
- Tasks: view, create, edit, delete
- Projects: view, create, edit, delete
- Time: view, edit
- Departments: view only
- Chat, Documents, Feedback, Leave: view, create, edit

**Employee Role:**
- Tasks: view, edit
- Projects: view only
- Time: view, create, edit
- Chat: view, create, edit
- Documents: view only
- Feedback: view, create
- Leave: view, create, edit

## 🚀 How to Use

### For Admins:

1. **Navigate to Permissions Page**
   - Sidebar → "Permissions" (lock icon 🔒)

2. **Select a Role**
   - Click on the role tab (Admin/Manager/Employee)

3. **Modify Permissions**
   - Check/uncheck boxes for each resource
   - Modified rows are highlighted in yellow
   - Changes are tracked in real-time

4. **Save Changes**
   - Click "Save Changes (X)" button in the top-right
   - All changes are saved in one batch

### For Developers:

#### Check Permission in Backend:
```python
from app.core.rbac import admin_only, manager_or_admin

@router.get("/endpoint")
async def my_endpoint(current_user: User = Depends(admin_only)):
    # Only admins can access this
    pass
```

#### Check Permission in Frontend:
```typescript
import { permissionService } from '../services/permissionService';

const checkAccess = async () => {
  const result = await permissionService.checkPermission({
    resource: 'users',
    action: 'edit'
  });
  
  if (result.has_permission) {
    // User can edit users
  }
};
```

## 🔐 Security Features

1. **Admin Protection**: Admins cannot remove their own admin permissions
2. **Backend Enforcement**: All permission checks happen server-side
3. **Role-Based**: Tied to user's role column in database
4. **Granular Control**: 4 levels of access per resource

## 📦 Database Migration

Migration `005_create_role_permissions.sql` was run successfully:
- Created `role_permissions_v2` table
- Seeded 33 default permission entries
- ✅ All roles have appropriate default permissions

## 🎨 UI Location

**Main Navigation:**
- Sidebar → "Permissions" (🔒 Lock icon)
- Only visible to Admin users
- Protected route at `/permissions`

## 🔄 Integration

The permission system integrates with:
- ✅ User authentication (JWT tokens with roles)
- ✅ Role-Based Access Control (RBAC)
- ✅ Admin dashboard
- ✅ Protected routes
- ✅ API authorization

## 📝 Resources Available

Default resources in the system:
- `users` - User management
- `tasks` - Task management
- `projects` - Project management
- `time` - Time tracking
- `departments` - Department management
- `roles` - Role & permission management
- `settings` - System settings
- `chat` - Chat system
- `documents` - Document management
- `feedback` - Feedback system
- `leave` - Leave management

## 🎯 Next Steps

To extend the system:

1. **Add New Resource**: Insert row in `role_permissions_v2` table
2. **Update Frontend**: Resource will auto-appear in permissions UI
3. **Protect Routes**: Use RBAC dependencies on backend routes
4. **Check Permissions**: Use permission check endpoint/service

---

**Created:** October 18, 2025  
**Status:** ✅ Fully Implemented & Working

