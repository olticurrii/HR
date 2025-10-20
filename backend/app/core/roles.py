"""
Role-Based Access Control (RBAC) system
Defines roles, permissions, and access control utilities
"""
from enum import Enum
from typing import List, Set


class UserRole(str, Enum):
    """User roles in the system"""
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    
    @classmethod
    def all_roles(cls) -> List[str]:
        return [role.value for role in cls]


class Permission(str, Enum):
    """System permissions"""
    # User management
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"
    USER_LIST_ALL = "user:list_all"
    
    # Department management
    DEPARTMENT_CREATE = "department:create"
    DEPARTMENT_READ = "department:read"
    DEPARTMENT_UPDATE = "department:update"
    DEPARTMENT_DELETE = "department:delete"
    
    # Time tracking
    TIME_READ_ALL = "time:read_all"
    TIME_EXPORT = "time:export"
    TIME_MANAGE = "time:manage"
    
    # Project management
    PROJECT_CREATE = "project:create"
    PROJECT_READ = "project:read"
    PROJECT_UPDATE = "project:update"
    PROJECT_DELETE = "project:delete"
    
    # Task management
    TASK_CREATE = "task:create"
    TASK_READ = "task:read"
    TASK_UPDATE = "task:update"
    TASK_DELETE = "task:delete"
    TASK_ASSIGN = "task:assign"
    
    # Settings
    SETTINGS_MANAGE = "settings:manage"


# Define role permissions
ROLE_PERMISSIONS: dict[UserRole, Set[Permission]] = {
    UserRole.ADMIN: {
        # Full access to everything
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.USER_LIST_ALL,
        Permission.DEPARTMENT_CREATE,
        Permission.DEPARTMENT_READ,
        Permission.DEPARTMENT_UPDATE,
        Permission.DEPARTMENT_DELETE,
        Permission.TIME_READ_ALL,
        Permission.TIME_EXPORT,
        Permission.TIME_MANAGE,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_READ,
        Permission.PROJECT_UPDATE,
        Permission.PROJECT_DELETE,
        Permission.TASK_CREATE,
        Permission.TASK_READ,
        Permission.TASK_UPDATE,
        Permission.TASK_DELETE,
        Permission.TASK_ASSIGN,
        Permission.SETTINGS_MANAGE,
    },
    UserRole.MANAGER: {
        # Can manage team and view department data
        Permission.USER_READ,
        Permission.DEPARTMENT_READ,
        Permission.TIME_READ_ALL,  # Can view time records for their department
        Permission.PROJECT_CREATE,
        Permission.PROJECT_READ,
        Permission.PROJECT_UPDATE,
        Permission.TASK_CREATE,
        Permission.TASK_READ,
        Permission.TASK_UPDATE,
        Permission.TASK_ASSIGN,
    },
    UserRole.EMPLOYEE: {
        # Limited access to own data
        Permission.USER_READ,  # Can read own profile
        Permission.DEPARTMENT_READ,  # Can view own department
        Permission.PROJECT_READ,
        Permission.TASK_READ,
        Permission.TASK_UPDATE,  # Can update own tasks
    },
}


def get_role_permissions(role: UserRole) -> Set[Permission]:
    """Get all permissions for a given role"""
    return ROLE_PERMISSIONS.get(role, set())


def has_permission(role: UserRole, permission: Permission) -> bool:
    """Check if a role has a specific permission"""
    return permission in get_role_permissions(role)


def can_manage_user(current_user_role: UserRole, target_user_role: UserRole) -> bool:
    """Check if current user can manage target user based on roles"""
    if current_user_role == UserRole.ADMIN:
        return True
    if current_user_role == UserRole.MANAGER and target_user_role == UserRole.EMPLOYEE:
        return True
    return False

