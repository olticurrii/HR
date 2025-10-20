# User Role Management Guide

## Overview

The system now supports **dual role assignment**:
- **One System Role** (required): Admin, Manager, or Employee
- **Multiple Custom Roles** (optional): Any custom roles created by admins

This allows for flexible role management where users have one primary system role for permissions, plus any number of custom roles for organizational/functional purposes.

---

## System Architecture

### Database Schema

#### `user_custom_roles` Junction Table
```sql
CREATE TABLE user_custom_roles (
    user_id INTEGER NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_name) REFERENCES custom_roles(name) ON DELETE CASCADE
);
```

### User Model
- `role` (string): System role - "admin", "manager", or "employee"
- `custom_roles` (array): List of custom role names assigned to the user

---

## Backend API

### Endpoints

#### Get All Users (with custom roles)
```http
GET /api/v1/admin/users
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "employee",
  "custom_roles": ["team_lead", "mentor"],
  ...
}
```

#### Create User (with custom roles)
```http
POST /api/v1/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "full_name": "Jane Smith",
  "password": "securepassword",
  "role": "employee",
  "custom_roles": ["team_lead", "hr_specialist"],
  "job_role": "Software Engineer",
  "department_id": 1
}
```

#### Update User (with custom roles)
```http
PUT /api/v1/admin/users/{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "role": "manager",
  "custom_roles": ["team_lead"],
  "job_role": "Senior Engineer"
}
```

#### Get Custom Roles (non-system roles)
```http
GET /api/v1/admin/custom-roles
Authorization: Bearer <token>

Response:
{
  "custom_roles": [
    {
      "value": "team_lead",
      "label": "Team Lead",
      "description": "Leads a team"
    },
    {
      "value": "hr_specialist",
      "label": "HR Specialist",
      "description": "HR duties"
    }
  ]
}
```

---

## Frontend UI

### User Management Page Features

#### 1. **User List Table**
- Shows system role badge (colored)
- Shows all custom role badges (purple)
- System role: Red (admin), Blue (manager), Green (employee)
- Custom roles: Purple badges

Example display:
```
User: John Doe
Roles: [Admin] [Team Lead] [Mentor]
        ↑         ↑          ↑
      System    Custom    Custom
```

#### 2. **Create User Form**
- **System Role Dropdown** (required):
  - Employee
  - Manager
  - Admin
  - Help text: "One system role required"

- **Custom Roles Multi-Select** (optional):
  - Checkbox list of all custom roles
  - Scrollable if many roles
  - Help text: "Select any additional custom roles"

#### 3. **Edit User Form**
- Same as create form
- Can change system role
- Can add/remove custom roles
- Changes are applied together

---

## How It Works

### Creating a User with Roles

1. **Admin fills form**:
   - Email, name, password
   - Selects ONE system role (e.g., "Employee")
   - Checks ANY custom roles (e.g., "Team Lead", "Mentor")

2. **Backend processes**:
   ```python
   # Create user with system role
   new_user = User(role="employee", ...)
   
   # Add custom roles to junction table
   for custom_role in ["team_lead", "mentor"]:
       db.execute("INSERT INTO user_custom_roles ...")
   ```

3. **User is created** with:
   - System role: "employee"
   - Custom roles: ["team_lead", "mentor"]

### Permission System

- **System role** determines permissions
- **Custom roles** are for organizational purposes
- Example:
  ```
  User: John
  System Role: employee → Employee permissions
  Custom Roles: [team_lead, mentor] → For display/organization only
  ```

---

## Migration

### Run Migration 007
```bash
cd backend
python3 run_migration_007.py
```

This creates:
- `user_custom_roles` junction table
- Indexes for performance

---

## API Integration

### Frontend Service

```typescript
// adminService.ts

interface User {
  role: string;           // System role
  custom_roles?: string[]; // Custom roles
}

// Get custom roles
const customRoles = await adminService.getCustomRoles();

// Create user with custom roles
await adminService.createUser({
  email: "user@example.com",
  role: "employee",
  custom_roles: ["team_lead", "mentor"],
  ...
});

// Update user's custom roles
await adminService.updateUser(userId, {
  custom_roles: ["team_lead"], // Replaces existing
});
```

---

## Key Features

### ✅ Flexibility
- One required system role for permissions
- Multiple optional custom roles for organization

### ✅ Validation
- System role must be: admin, manager, or employee
- Custom roles must exist in `custom_roles` table
- Custom roles must NOT be system roles

### ✅ UI/UX
- Clear distinction: "System Role" vs "Custom Roles"
- Visual badges with different colors
- Multi-select with checkboxes
- Scrollable for many roles

### ✅ Data Integrity
- Foreign key constraints
- Cascade deletes
- Unique constraints

---

## Example Use Cases

### Use Case 1: Team Lead Employee
```yaml
User: Alice Johnson
System Role: employee
Custom Roles: [team_lead, scrum_master]

Permissions: Employee-level (from system role)
Display: Shows all 3 badges
Purpose: She's an employee with leadership responsibilities
```

### Use Case 2: HR Manager
```yaml
User: Bob Smith
System Role: manager
Custom Roles: [hr_specialist, recruiter]

Permissions: Manager-level (from system role)
Display: Shows all 3 badges
Purpose: He's a manager specializing in HR
```

### Use Case 3: Simple Admin
```yaml
User: Carol Admin
System Role: admin
Custom Roles: []

Permissions: Admin-level (from system role)
Display: Shows only Admin badge
Purpose: Standard admin without special roles
```

---

## Best Practices

### 1. **System Role First**
- Always assign the appropriate system role for permissions
- System role determines what they can do

### 2. **Custom Roles for Context**
- Use custom roles to describe specialized functions
- Examples: "team_lead", "mentor", "hr_specialist", "recruiter"

### 3. **Don't Mix Permissions**
- System roles = Permissions
- Custom roles = Labels/Organization

### 4. **Keep It Simple**
- Don't create too many custom roles
- Use clear, descriptive names

---

## Troubleshooting

### Issue: Custom roles not showing
**Solution**: Run migration 007 and ensure custom roles exist in database

### Issue: Can't assign system role as custom role
**Solution**: System roles (admin, manager, employee) cannot be assigned as custom roles. This is by design.

### Issue: Custom role badges not displaying
**Solution**: Check that user has `custom_roles` array in response. Backend includes them in user endpoints.

---

## Testing

### Manual Testing Steps

1. **Navigate to User Management**
2. **Click "Add User"**
3. **Select system role**: Employee
4. **Check custom roles**: Team Lead, Mentor
5. **Save** and verify user is created
6. **View user** in table - should show 3 badges
7. **Edit user** - change system role to Manager
8. **Uncheck** one custom role
9. **Save** and verify changes

---

## Summary

✅ **System Role**: ONE required (admin/manager/employee) for permissions
✅ **Custom Roles**: MULTIPLE optional for organization
✅ **Backend**: Junction table, validation, API endpoints
✅ **Frontend**: Multi-select UI, badge display, forms
✅ **Migration**: 007 creates necessary tables

**Result**: Flexible, powerful role management system! 🎉

