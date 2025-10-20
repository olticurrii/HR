# RBAC System - Quick Start Guide

## ✅ Implementation Complete!

A comprehensive Role-Based Access Control (RBAC) system has been successfully implemented in your HR Management application.

---

## 🚀 Quick Start

### 1. Database Migration (Already Done ✓)
The migration has been run successfully. Your database now has the `role` column.

### 2. Seed Test Users (Optional)
To create test users with different roles:

```bash
cd backend
python3 seed_rbac_users.py
```

This creates:
- 1 Admin user
- 2 Manager users  
- 3 Employee users

**Default Password for all: `password123`**

Test logins:
- Admin: `admin@pristinadata.com`
- Manager (IT): `manager.it@pristinadata.com`
- Manager (HR): `manager.hr@pristinadata.com`
- Employee: `employee1@pristinadata.com`

### 3. Start Your Application

**Backend:**
```bash
cd backend
source venv/bin/activate  # or venv_mac/bin/activate on Mac
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm start
```

---

## 🎭 Roles & Permissions

### Admin
- ✅ Full system access
- ✅ User management (create, edit, delete, change roles)
- ✅ All time tracking features
- ✅ CSV export
- ✅ Settings & configuration

### Manager
- ✅ View team members
- ✅ View & filter time tracking for department
- ✅ Create & assign tasks/projects
- ✅ View reports
- ❌ Cannot change user roles
- ❌ Cannot export CSV

### Employee
- ✅ Own profile & time tracking
- ✅ View assigned tasks/projects
- ✅ Update own tasks
- ❌ Cannot view other users' data
- ❌ Cannot access admin features

---

## 🔐 Protected Routes

### Backend Endpoints

**Admin Only:**
- `/api/v1/admin/*` - All admin endpoints
- `/api/v1/time/export` - CSV export

**Manager or Admin:**
- `/api/v1/time/active` - View active users
- `/api/v1/time/records` - View time records
- `/api/v1/time/all-users-status` - View all users status

**All Authenticated:**
- `/api/v1/time/status` - Own status
- `/api/v1/time/clock-in` - Clock in
- `/api/v1/time/clock-out` - Clock out

### Frontend Routes

**Admin Only:**
- `/role-management`
- `/settings`

**Manager or Admin:**
- `/time-tracking/admin`

**All Authenticated:**
- `/dashboard`
- `/time-tracking`
- `/profile`
- etc.

---

## 📝 Admin User Management Endpoints

All require admin access and use `/api/v1/admin` prefix:

```bash
# List all users
GET /users

# Get specific user
GET /users/{user_id}

# Create user
POST /users
{
  "email": "newuser@example.com",
  "full_name": "New User",
  "password": "securepass",
  "role": "employee",  // admin, manager, or employee
  "job_role": "Developer",
  "department_id": 1
}

# Update user
PUT /users/{user_id}
{
  "full_name": "Updated Name",
  "role": "manager"
}

# Update user role only
PATCH /users/{user_id}/role
{
  "role": "manager"
}

# Delete user
DELETE /users/{user_id}

# Get available roles
GET /roles
```

---

## 🎨 Frontend Usage Examples

### Check User Role
```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAdmin, isManager, hasRole } = useAuth();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isManager && <ManagerDashboard />}
      {hasRole(['admin', 'manager']) && <ReportsButton />}
    </div>
  );
}
```

### Protected Routes
```tsx
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminPage />
  </ProtectedRoute>
} />
```

### Conditional Rendering
```tsx
{user?.role === 'admin' && <DeleteButton />}
{user?.role !== 'employee' && <ManageTeamButton />}
```

---

## 🧪 Testing the System

### Test as Admin:
1. Login as `admin@pristinadata.com`
2. You should see ALL menu items
3. Access `/admin/users` endpoint
4. Access `/time-tracking/admin`
5. Access `/settings`

### Test as Manager:
1. Login as `manager.it@pristinadata.com`
2. You should see limited menu items
3. Access `/time-tracking/admin` ✓
4. Try to access `/settings` → Should redirect to /unauthorized ✓
5. Can view time records but cannot export

### Test as Employee:
1. Login as `employee1@pristinadata.com`
2. You should see basic menu items only
3. Can access own time tracking
4. Try to access `/time-tracking/admin` → Should redirect to /unauthorized ✓
5. Try to access `/settings` → Should redirect to /unauthorized ✓

---

## 🛠️ Key Files

### Backend:
- **`app/core/roles.py`** - Role & permission definitions
- **`app/core/rbac.py`** - RBAC dependencies
- **`app/api/admin.py`** - Admin user management
- **`app/models/user.py`** - User model with role
- **`migrations/004_add_user_roles.sql`** - Database migration

### Frontend:
- **`contexts/AuthContext.tsx`** - Auth with role support
- **`components/Auth/ProtectedRoute.tsx`** - Route protection
- **`pages/Unauthorized/UnauthorizedPage.tsx`** - 403 page
- **`components/Layout/Sidebar.tsx`** - Role-based menu

---

## 📊 Database Schema

```sql
-- User table now includes:
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'employee',  -- NEW!
    is_admin BOOLEAN DEFAULT 0,    -- Kept for compatibility
    job_role TEXT,
    department_id INTEGER,
    ...
);
```

---

## 🔒 Security Features

1. **JWT Enhancement** - Includes role in token
2. **Backend Enforcement** - All checks on server
3. **Frontend UX** - Hide/show UI elements
4. **Self-Protection** - Admin can't remove own admin role
5. **403 Handling** - Proper unauthorized responses

---

## ✨ What's New

- ✅ Three-tier role system (Admin/Manager/Employee)
- ✅ Role-based route protection
- ✅ Role-based menu filtering
- ✅ Admin user management API
- ✅ Permission checking utilities
- ✅ Professional unauthorized page
- ✅ Enhanced JWT with role info
- ✅ Database migration completed
- ✅ Seed data script ready

---

## 🎯 Status: Production Ready!

**All 12 tasks completed:**
1. ✅ Reviewed existing structure
2. ✅ Created Role enum & updated model
3. ✅ Created RBAC dependencies
4. ✅ Updated JWT with role
5. ✅ Protected endpoints with RBAC
6. ✅ Created admin management API
7. ✅ Updated frontend auth context
8. ✅ Created role-based routes
9. ✅ Admin UI endpoints ready
10. ✅ Seed data script created
11. ✅ Unauthorized page implemented
12. ✅ Component role filtering added

---

## 📞 Support

See `RBAC_IMPLEMENTATION_GUIDE.md` for detailed documentation.

**System is ready to use!** 🚀

