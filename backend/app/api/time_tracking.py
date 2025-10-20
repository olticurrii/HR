from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import csv
import io
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.core.rbac import admin_only, manager_or_admin
from app.schemas.time_entry import (
    TimeEntryResponse,
    ActiveUserResponse,
    TimeEntryRecordResponse,
    TimeTrackingStatusResponse,
    UserWithStatusResponse
)
from app.services.time_tracking_service import TimeTrackingService
from app.api.settings import check_breaks_allowed, check_documentation_required


router = APIRouter()


@router.post("/clock-in", response_model=TimeEntryResponse)
async def clock_in(
    is_terrain: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clock in the current user"""
    entry = TimeTrackingService.clock_in(db, current_user.id, is_terrain)
    return entry


@router.post("/clock-out", response_model=TimeEntryResponse)
async def clock_out(
    work_summary: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clock out the current user"""
    # Check if documentation is required
    if check_documentation_required(db):
        if not work_summary or not work_summary.strip():
            raise HTTPException(
                status_code=400,
                detail="Work summary is required when clocking out"
            )
    
    entry = TimeTrackingService.clock_out(db, current_user.id, work_summary)
    return entry


@router.post("/start-break", response_model=TimeEntryResponse)
async def start_break(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a break for the current user"""
    # Check if breaks are allowed
    if not check_breaks_allowed(db):
        raise HTTPException(
            status_code=403,
            detail="Breaks are currently disabled by organization settings"
        )
    
    entry = TimeTrackingService.start_break(db, current_user.id)
    return entry


@router.post("/end-break", response_model=TimeEntryResponse)
async def end_break(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """End a break for the current user"""
    # Check if breaks are allowed
    if not check_breaks_allowed(db):
        raise HTTPException(
            status_code=403,
            detail="Breaks are currently disabled by organization settings"
        )
    
    entry = TimeTrackingService.end_break(db, current_user.id)
    return entry


@router.post("/terrain", response_model=TimeEntryResponse)
async def toggle_terrain(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle terrain work status for the current user"""
    entry = TimeTrackingService.toggle_terrain(db, current_user.id)
    return entry


@router.get("/status", response_model=TimeTrackingStatusResponse)
async def get_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current time tracking status for the user"""
    status = TimeTrackingService.get_current_status(db, current_user.id)
    return status


@router.get("/active", response_model=List[ActiveUserResponse])
async def get_active_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Get all currently active (clocked in) users - Manager or Admin"""
    active_users = TimeTrackingService.get_active_users(db)
    return active_users


@router.get("/not-clocked-in")
async def get_not_clocked_in_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Get all users who haven't clocked in today - Manager or Admin"""
    users = TimeTrackingService.get_not_clocked_in_users(db)
    return users


@router.get("/all-users-status", response_model=List[UserWithStatusResponse])
async def get_all_users_with_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Get all users with their current time tracking status - Manager or Admin"""
    users = TimeTrackingService.get_all_users_with_status(db)
    return users


@router.get("/records", response_model=List[TimeEntryRecordResponse])
async def get_time_records(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    is_terrain: Optional[bool] = Query(None, description="Filter by terrain work"),
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Get time tracking records with filters - Manager or Admin"""
    
    # Parse dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    records = TimeTrackingService.get_time_records(
        db=db,
        start_date=start_dt,
        end_date=end_dt,
        user_id=user_id,
        department_id=department_id,
        is_terrain=is_terrain
    )
    
    return records


@router.get("/export")
async def export_time_records(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    is_terrain: Optional[bool] = Query(None, description="Filter by terrain work"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Export time tracking records to CSV - Admin only"""
    
    # Parse dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    records = TimeTrackingService.get_time_records(
        db=db,
        start_date=start_dt,
        end_date=end_dt,
        user_id=user_id,
        department_id=department_id,
        is_terrain=is_terrain
    )
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Employee Name',
        'Department',
        'Clock In',
        'Clock Out',
        'Total Worked Hours',
        'Break Duration (minutes)',
        'Terrain Work'
    ])
    
    # Write data
    for record in records:
        writer.writerow([
            record.user_name,
            record.department_name or 'N/A',
            record.clock_in.strftime('%Y-%m-%d %H:%M:%S'),
            record.clock_out.strftime('%Y-%m-%d %H:%M:%S') if record.clock_out else 'Still working',
            f"{record.total_worked_hours:.2f}" if record.total_worked_hours else 'N/A',
            record.break_duration_minutes or 0,
            'Yes' if record.is_terrain else 'No'
        ])
    
    # Prepare response
    output.seek(0)
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    filename = f"time_tracking_export_{timestamp}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

