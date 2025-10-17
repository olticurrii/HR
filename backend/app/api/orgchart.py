from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User
from app.models.department import Department
from app.api.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class OrgChartNode(BaseModel):
    id: str
    name: str
    title: str
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    children: List["OrgChartNode"] = []

class ReassignRequest(BaseModel):
    user_id: int
    new_manager_id: Optional[int] = None
    new_department_id: Optional[int] = None

def build_org_tree(users: List[User], root_id: Optional[int] = None) -> List[OrgChartNode]:
    """Build hierarchical org chart tree from flat user list"""
    user_map = {user.id: user for user in users}
    
    # Find root users (no manager or specified root)
    if root_id:
        root_users = [user for user in users if user.id == root_id]
    else:
        # Find users with no manager or users whose manager is not in the list
        root_users = []
        for user in users:
            if not hasattr(user, 'manager_id') or user.manager_id is None:
                root_users.append(user)
            elif user.manager_id not in user_map:
                root_users.append(user)
    
    def build_subtree(user: User) -> OrgChartNode:
        # Find direct reports
        direct_reports = [u for u in users if hasattr(u, 'manager_id') and u.manager_id == user.id]
        
        return OrgChartNode(
            id=str(user.id),
            name=user.full_name,
            title=user.job_role or "Employee",
            department=user.department.name if user.department else None,
            avatar_url=user.avatar_url,
            children=[build_subtree(report) for report in direct_reports]
        )
    
    return [build_subtree(user) for user in root_users]

@router.get("/orgchart", response_model=dict)
async def get_org_chart(
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get organization chart with hierarchical structure and unassigned employees"""
    # Load all users with their departments
    all_users = db.query(User).options(joinedload(User.department)).all()
    
    if not all_users:
        return {"assigned": [], "unassigned": []}
    
    # If department filter is specified, find users in that department
    # but also include their entire manager chain
    if department_id:
        dept_users = [u for u in all_users if u.department_id == department_id]
        
        # For each user in the department, walk up the manager chain
        users_to_include = set()
        for user in dept_users:
            users_to_include.add(user.id)
            # Walk up manager chain
            current = user
            while hasattr(current, 'manager_id') and current.manager_id:
                manager = next((u for u in all_users if u.id == current.manager_id), None)
                if manager:
                    users_to_include.add(manager.id)
                    current = manager
                else:
                    break
        
        # Filter to only users we need
        users = [u for u in all_users if u.id in users_to_include]
    else:
        users = all_users
    
    if not users:
        return {"assigned": [], "unassigned": []}
    
    # Separate assigned and unassigned employees
    # Users with manager_id = None are root users (CEO/top level) and should be in the tree
    # Only users with no department AND no manager are truly unassigned
    assigned_users = []
    unassigned_users = []
    
    # First, find users who are part of the hierarchy (have manager or have direct reports)
    user_ids_with_reports = set()
    for user in users:
        if hasattr(user, 'manager_id') and user.manager_id is not None:
            user_ids_with_reports.add(user.manager_id)
    
    for user in users:
        has_manager = hasattr(user, 'manager_id') and user.manager_id is not None
        has_reports = user.id in user_ids_with_reports
        is_root = (not has_manager) and has_reports
        
        # User is assigned if they have a manager OR they are a root with reports (CEO)
        if has_manager or is_root:
            assigned_users.append(user)
        else:
            # Truly unassigned: no manager and no one reports to them
            unassigned_users.append(user)
    
    # Build tree for assigned users (includes root users like CEO)
    assigned_tree = build_org_tree(assigned_users)
    
    # Convert unassigned users to OrgChartNode format
    unassigned_tree = []
    for user in unassigned_users:
        unassigned_tree.append(OrgChartNode(
            id=str(user.id),
            name=user.full_name,
            title=user.job_role or "Employee",
            department=user.department.name if user.department else None,
            avatar_url=user.avatar_url,
            children=[]
        ))
    
    return {
        "assigned": assigned_tree,
        "unassigned": unassigned_tree
    }

@router.patch("/orgchart/reassign")
async def reassign_user(
    request: ReassignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reassign user to new manager and/or department"""
    
    # Only admins can reassign users
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can reassign users"
        )
    
    # Get the user to be reassigned
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate new manager if provided
    new_manager = None
    if request.new_manager_id:
        new_manager = db.query(User).filter(User.id == request.new_manager_id).first()
        if not new_manager:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="New manager not found"
            )
        
        # Check for cycle prevention
        if request.new_manager_id == request.user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User cannot be their own manager"
            )
        
        # Check if new manager is a descendant (would create cycle)
        def is_descendant(ancestor_id: int, descendant_id: int, visited=None) -> bool:
            if visited is None:
                visited = set()
            if descendant_id in visited:
                return False  # Already checked, avoid infinite loop
            if ancestor_id == descendant_id:
                return True
            visited.add(descendant_id)
            descendant = db.query(User).filter(User.id == descendant_id).first()
            if not descendant or not hasattr(descendant, 'manager_id') or descendant.manager_id is None:
                return False
            return is_descendant(ancestor_id, descendant.manager_id, visited)
        
        # Only check for cycles if the user currently has reports
        # (if they're unassigned or have no reports, no cycle is possible)
        has_reports = db.query(User).filter(
            hasattr(User, 'manager_id'),
            User.manager_id == request.user_id
        ).first() is not None
        
        if has_reports and is_descendant(request.user_id, request.new_manager_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot assign to this manager as it would create a reporting cycle"
            )
    
    # Validate new department if provided
    new_department = None
    if request.new_department_id:
        new_department = db.query(Department).filter(Department.id == request.new_department_id).first()
        if not new_department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
    
    # Update user's manager (including setting to null for unassignment)
    # Check if new_manager_id was provided in the request (could be null or an ID)
    # We use 'in' to check if the key exists, not if it has a value
    if 'new_manager_id' in request.__fields_set__:
        # Set manager_id attribute (assuming it exists in User model)
        if hasattr(user, 'manager_id'):
            old_manager_id = user.manager_id
            user.manager_id = request.new_manager_id  # Can be None (null) for unassignment
            print(f"✅ [BACKEND] Updated user {user.id} ({user.full_name}) manager: {old_manager_id} → {request.new_manager_id}")
        else:
            # If manager_id doesn't exist, we might need to add it to the model
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Manager relationship not configured in user model"
            )
    
    if request.new_department_id is not None:
        user.department_id = request.new_department_id
        
        # Update all descendants (direct and indirect reports) to the same department
        def update_descendants_department(parent_id: int, dept_id: int):
            """Recursively update department for all descendants"""
            direct_reports = db.query(User).filter(
                hasattr(User, 'manager_id'),
                User.manager_id == parent_id
            ).all()
            
            for report in direct_reports:
                report.department_id = dept_id
                # Recursively update their reports
                update_descendants_department(report.id, dept_id)
        
        # Update all descendants to the new department
        update_descendants_department(user.id, request.new_department_id)
    
    # Handle department assignment based on manager
    if 'new_manager_id' in request.__fields_set__:
        if request.new_manager_id is None:
            # Being unassigned - optionally clear department too
            # (keeping department allows reassignment to same dept later)
            # For now, we'll keep the department
            pass
        elif not request.new_department_id and new_manager and new_manager.department_id:
            # New manager has a department and no specific department was provided,
            # so inherit the manager's department
            user.department_id = new_manager.department_id
    
    db.commit()
    db.refresh(user)
    
    print(f"✅ [BACKEND] Database committed. Final state: user {user.id} manager_id={user.manager_id if hasattr(user, 'manager_id') else 'N/A'}")
    
    return {
        "message": "User reassigned successfully",
        "user_id": user.id,
        "new_manager_id": user.manager_id if hasattr(user, 'manager_id') else None,
        "new_department_id": user.department_id
    }
