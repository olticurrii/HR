"""
Leave Management API
Endpoints for managing leave requests, balances, and approvals
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, and_, or_, func
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from app.core.database import get_db
from app.api.auth import get_current_user
from app.core.rbac import admin_only, manager_or_admin
from app.models.user import User
from app.models.leave import LeaveType, LeaveBalance, LeaveRequest
from app.schemas.leave import (
    LeaveTypeResponse,
    LeaveBalanceResponse,
    LeaveBalanceUpdate,
    LeaveRequestCreate,
    LeaveRequestUpdate,
    LeaveRequestReview,
    LeaveRequestResponse,
    LeaveSummary,
    LeaveBalanceSummary
)

router = APIRouter()

# Helper function to calculate business days
def calculate_business_days(start_date: date, end_date: date) -> float:
    """Calculate number of business days between two dates"""
    total_days = (end_date - start_date).days + 1
    # Simple calculation - could be enhanced to exclude weekends and holidays
    return float(total_days)

# ==================== Leave Types ====================

@router.get("/types", response_model=List[LeaveTypeResponse])
async def get_leave_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active leave types"""
    leave_types = db.query(LeaveType).filter(LeaveType.is_active == True).all()
    return leave_types

# ==================== Leave Balances ====================

@router.get("/balances", response_model=LeaveBalanceSummary)
async def get_my_leave_balances(
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's leave balances"""
    if not year:
        year = datetime.now().year
    
    balances_query = db.query(LeaveBalance).filter(
        LeaveBalance.user_id == current_user.id,
        LeaveBalance.year == year
    ).all()
    
    balances_with_names = []
    total_allocated = 0.0
    total_used = 0.0
    total_remaining = 0.0
    
    for balance in balances_query:
        leave_type = db.query(LeaveType).filter(LeaveType.id == balance.leave_type_id).first()
        balance_dict = {
            "id": balance.id,
            "user_id": balance.user_id,
            "leave_type_id": balance.leave_type_id,
            "total_days": float(balance.total_days),
            "used_days": float(balance.used_days),
            "remaining_days": float(balance.remaining_days),
            "year": balance.year,
            "leave_type_name": leave_type.name if leave_type else "Unknown",
            "created_at": balance.created_at,
            "updated_at": balance.updated_at
        }
        balances_with_names.append(balance_dict)
        total_allocated += float(balance.total_days)
        total_used += float(balance.used_days)
        total_remaining += float(balance.remaining_days)
    
    return LeaveBalanceSummary(
        leave_balances=balances_with_names,
        total_allocated=total_allocated,
        total_used=total_used,
        total_remaining=total_remaining
    )

@router.get("/balances/{user_id}", response_model=LeaveBalanceSummary)
async def get_user_leave_balances(
    user_id: int,
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Get leave balances for a specific user - Manager or Admin only"""
    if not year:
        year = datetime.now().year
    
    balances_query = db.query(LeaveBalance).filter(
        LeaveBalance.user_id == user_id,
        LeaveBalance.year == year
    ).all()
    
    balances_with_names = []
    total_allocated = 0.0
    total_used = 0.0
    total_remaining = 0.0
    
    for balance in balances_query:
        leave_type = db.query(LeaveType).filter(LeaveType.id == balance.leave_type_id).first()
        balance_dict = {
            "id": balance.id,
            "user_id": balance.user_id,
            "leave_type_id": balance.leave_type_id,
            "total_days": float(balance.total_days),
            "used_days": float(balance.used_days),
            "remaining_days": float(balance.remaining_days),
            "year": balance.year,
            "leave_type_name": leave_type.name if leave_type else "Unknown",
            "created_at": balance.created_at,
            "updated_at": balance.updated_at
        }
        balances_with_names.append(balance_dict)
        total_allocated += float(balance.total_days)
        total_used += float(balance.used_days)
        total_remaining += float(balance.remaining_days)
    
    return LeaveBalanceSummary(
        leave_balances=balances_with_names,
        total_allocated=total_allocated,
        total_used=total_used,
        total_remaining=total_remaining
    )

@router.put("/balances/{balance_id}", response_model=LeaveBalanceResponse)
async def update_leave_balance(
    balance_id: int,
    balance_update: LeaveBalanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Update a leave balance - Admin only"""
    balance = db.query(LeaveBalance).filter(LeaveBalance.id == balance_id).first()
    
    if not balance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave balance not found")
    
    # Update total_days
    balance.total_days = balance_update.total_days
    # Recalculate remaining_days
    balance.remaining_days = float(balance.total_days) - float(balance.used_days)
    
    db.commit()
    db.refresh(balance)
    
    # Get leave type name
    leave_type = db.query(LeaveType).filter(LeaveType.id == balance.leave_type_id).first()
    
    return LeaveBalanceResponse(
        id=balance.id,
        user_id=balance.user_id,
        leave_type_id=balance.leave_type_id,
        total_days=float(balance.total_days),
        used_days=float(balance.used_days),
        remaining_days=float(balance.remaining_days),
        year=balance.year,
        leave_type_name=leave_type.name if leave_type else "Unknown",
        created_at=balance.created_at,
        updated_at=balance.updated_at
    )

# ==================== Leave Requests ====================

@router.post("/requests", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_request(
    leave_request: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new leave request"""
    # Validate dates
    if leave_request.end_date < leave_request.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )
    
    # Calculate total days
    total_days = calculate_business_days(leave_request.start_date, leave_request.end_date)
    
    # Check if user has sufficient balance
    year = leave_request.start_date.year
    balance = db.query(LeaveBalance).filter(
        LeaveBalance.user_id == current_user.id,
        LeaveBalance.leave_type_id == leave_request.leave_type_id,
        LeaveBalance.year == year
    ).first()
    
    if balance and float(balance.remaining_days) < total_days:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient leave balance. Available: {balance.remaining_days} days, Requested: {total_days} days"
        )
    
    # Create leave request
    new_request = LeaveRequest(
        user_id=current_user.id,
        leave_type_id=leave_request.leave_type_id,
        start_date=leave_request.start_date,
        end_date=leave_request.end_date,
        total_days=total_days,
        reason=leave_request.reason,
        status="pending"
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    # Get leave type name
    leave_type = db.query(LeaveType).filter(LeaveType.id == new_request.leave_type_id).first()
    
    return LeaveRequestResponse(
        id=new_request.id,
        user_id=new_request.user_id,
        user_name=current_user.full_name,
        leave_type_id=new_request.leave_type_id,
        leave_type_name=leave_type.name if leave_type else "Unknown",
        start_date=new_request.start_date,
        end_date=new_request.end_date,
        total_days=float(new_request.total_days),
        reason=new_request.reason,
        status=new_request.status,
        reviewed_by=new_request.reviewed_by,
        reviewer_name=None,
        reviewed_at=new_request.reviewed_at,
        review_comments=new_request.review_comments,
        created_at=new_request.created_at,
        updated_at=new_request.updated_at
    )

@router.get("/requests", response_model=List[LeaveRequestResponse])
async def get_my_leave_requests(
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's leave requests"""
    query = db.query(LeaveRequest).filter(LeaveRequest.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(LeaveRequest.status == status_filter)
    
    requests = query.order_by(LeaveRequest.created_at.desc()).all()
    
    result = []
    for req in requests:
        leave_type = db.query(LeaveType).filter(LeaveType.id == req.leave_type_id).first()
        reviewer = db.query(User).filter(User.id == req.reviewed_by).first() if req.reviewed_by else None
        
        result.append(LeaveRequestResponse(
            id=req.id,
            user_id=req.user_id,
            user_name=current_user.full_name,
            leave_type_id=req.leave_type_id,
            leave_type_name=leave_type.name if leave_type else "Unknown",
            start_date=req.start_date,
            end_date=req.end_date,
            total_days=float(req.total_days),
            reason=req.reason,
            status=req.status,
            reviewed_by=req.reviewed_by,
            reviewer_name=reviewer.full_name if reviewer else None,
            reviewed_at=req.reviewed_at,
            review_comments=req.review_comments,
            created_at=req.created_at,
            updated_at=req.updated_at
        ))
    
    return result

@router.get("/requests/all", response_model=List[LeaveRequestResponse])
async def get_all_leave_requests(
    status_filter: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Get all leave requests - Manager or Admin only"""
    query = db.query(LeaveRequest)
    
    if status_filter:
        query = query.filter(LeaveRequest.status == status_filter)
    
    if user_id:
        query = query.filter(LeaveRequest.user_id == user_id)
    
    requests = query.order_by(LeaveRequest.created_at.desc()).all()
    
    result = []
    for req in requests:
        user = db.query(User).filter(User.id == req.user_id).first()
        leave_type = db.query(LeaveType).filter(LeaveType.id == req.leave_type_id).first()
        reviewer = db.query(User).filter(User.id == req.reviewed_by).first() if req.reviewed_by else None
        
        result.append(LeaveRequestResponse(
            id=req.id,
            user_id=req.user_id,
            user_name=user.full_name if user else "Unknown",
            leave_type_id=req.leave_type_id,
            leave_type_name=leave_type.name if leave_type else "Unknown",
            start_date=req.start_date,
            end_date=req.end_date,
            total_days=float(req.total_days),
            reason=req.reason,
            status=req.status,
            reviewed_by=req.reviewed_by,
            reviewer_name=reviewer.full_name if reviewer else None,
            reviewed_at=req.reviewed_at,
            review_comments=req.review_comments,
            created_at=req.created_at,
            updated_at=req.updated_at
        ))
    
    return result

@router.patch("/requests/{request_id}/review", response_model=LeaveRequestResponse)
async def review_leave_request(
    request_id: int,
    review: LeaveRequestReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Approve or reject a leave request - Manager or Admin only"""
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    
    if not leave_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    
    if leave_request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot review request with status: {leave_request.status}"
        )
    
    if review.status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be either 'approved' or 'rejected'"
        )
    
    # Update request status
    leave_request.status = review.status
    leave_request.reviewed_by = current_user.id
    leave_request.reviewed_at = datetime.now()
    leave_request.review_comments = review.review_comments
    
    # If approved, update leave balance
    if review.status == "approved":
        year = leave_request.start_date.year
        balance = db.query(LeaveBalance).filter(
            LeaveBalance.user_id == leave_request.user_id,
            LeaveBalance.leave_type_id == leave_request.leave_type_id,
            LeaveBalance.year == year
        ).first()
        
        if balance:
            balance.used_days = float(balance.used_days) + float(leave_request.total_days)
            balance.remaining_days = float(balance.total_days) - float(balance.used_days)
    
    db.commit()
    db.refresh(leave_request)
    
    # Build response
    user = db.query(User).filter(User.id == leave_request.user_id).first()
    leave_type = db.query(LeaveType).filter(LeaveType.id == leave_request.leave_type_id).first()
    
    return LeaveRequestResponse(
        id=leave_request.id,
        user_id=leave_request.user_id,
        user_name=user.full_name if user else "Unknown",
        leave_type_id=leave_request.leave_type_id,
        leave_type_name=leave_type.name if leave_type else "Unknown",
        start_date=leave_request.start_date,
        end_date=leave_request.end_date,
        total_days=float(leave_request.total_days),
        reason=leave_request.reason,
        status=leave_request.status,
        reviewed_by=leave_request.reviewed_by,
        reviewer_name=current_user.full_name,
        reviewed_at=leave_request.reviewed_at,
        review_comments=leave_request.review_comments,
        created_at=leave_request.created_at,
        updated_at=leave_request.updated_at
    )

@router.delete("/requests/{request_id}")
async def cancel_leave_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a leave request (only if pending and owned by user)"""
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    
    if not leave_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    
    # Only owner can cancel
    if leave_request.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot cancel other user's request")
    
    # Can only cancel pending requests
    if leave_request.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel request with status: {leave_request.status}"
        )
    
    leave_request.status = "cancelled"
    db.commit()
    
    return {"message": "Leave request cancelled successfully"}

# ==================== Dashboard/Summary ====================

@router.get("/summary", response_model=LeaveSummary)
async def get_leave_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leave summary for current user"""
    requests = db.query(LeaveRequest).filter(LeaveRequest.user_id == current_user.id).all()
    
    total_requests = len(requests)
    pending = len([r for r in requests if r.status == "pending"])
    approved = len([r for r in requests if r.status == "approved"])
    rejected = len([r for r in requests if r.status == "rejected"])
    total_days = sum([float(r.total_days) for r in requests if r.status == "approved"])
    
    return LeaveSummary(
        total_leave_requests=total_requests,
        pending_requests=pending,
        approved_requests=approved,
        rejected_requests=rejected,
        total_days_taken=total_days
    )

