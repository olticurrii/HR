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
    query = db.query(User).options(joinedload(User.department))
    
    # Filter by department if specified
    if department_id:
        query = query.filter(User.department_id == department_id)
    
    users = query.all()
    
    if not users:
        return {"assigned": [], "unassigned": []}
    
    # Separate assigned and unassigned employees
    assigned_users = []
    unassigned_users = []
    
    for user in users:
        if hasattr(user, 'manager_id') and user.manager_id is not None:
            assigned_users.append(user)
        else:
            unassigned_users.append(user)
    
    # If no users have managers, put all users in unassigned so they still show up
    if not assigned_users and users:
        unassigned_users = users
    
    # Build tree for assigned users
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
        def is_descendant(ancestor_id: int, descendant_id: int) -> bool:
            if ancestor_id == descendant_id:
                return True
            descendant = db.query(User).filter(User.id == descendant_id).first()
            if not descendant or not hasattr(descendant, 'manager_id') or descendant.manager_id is None:
                return False
            return is_descendant(ancestor_id, descendant.manager_id)
        
        # Check if the new manager is a descendant of the user being reassigned
        if is_descendant(request.user_id, request.new_manager_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign a descendant as manager (would create cycle)"
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
    
    # Update user
    if request.new_manager_id is not None:
        # Set manager_id attribute (assuming it exists in User model)
        if hasattr(user, 'manager_id'):
            user.manager_id = request.new_manager_id
        else:
            # If manager_id doesn't exist, we might need to add it to the model
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Manager relationship not configured in user model"
            )
    
    if request.new_department_id is not None:
        user.department_id = request.new_department_id
    
    # If new manager has a department and no specific department was provided,
    # inherit the manager's department
    if (request.new_manager_id and 
        not request.new_department_id and 
        new_manager and 
        new_manager.department_id):
        user.department_id = new_manager.department_id
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "User reassigned successfully",
        "user_id": user.id,
        "new_manager_id": user.manager_id if hasattr(user, 'manager_id') else None,
        "new_department_id": user.department_id
    }
