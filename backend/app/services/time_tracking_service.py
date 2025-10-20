from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
from app.models.time_entry import TimeEntry
from app.models.user import User
from app.models.department import Department
from app.schemas.time_entry import (
    TimeEntryResponse,
    ActiveUserResponse,
    TimeEntryRecordResponse,
    TimeTrackingStatusResponse,
    UserWithStatusResponse
)


class TimeTrackingService:
    """Service for handling time tracking business logic"""
    
    @staticmethod
    def get_active_entry(db: Session, user_id: int) -> Optional[TimeEntry]:
        """Get the current active time entry for a user (not clocked out)"""
        return db.query(TimeEntry).filter(
            and_(
                TimeEntry.user_id == user_id,
                TimeEntry.clock_out.is_(None)
            )
        ).first()
    
    @staticmethod
    def clock_in(db: Session, user_id: int, is_terrain: bool = False) -> TimeEntry:
        """Clock in a user"""
        # Check if user is already clocked in
        active_entry = TimeTrackingService.get_active_entry(db, user_id)
        if active_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already clocked in. Please clock out first."
            )
        
        # Create new time entry
        time_entry = TimeEntry(
            user_id=user_id,
            clock_in=datetime.utcnow(),
            is_terrain=is_terrain
        )
        db.add(time_entry)
        db.commit()
        db.refresh(time_entry)
        return time_entry
    
    @staticmethod
    def clock_out(db: Session, user_id: int, work_summary: Optional[str] = None) -> TimeEntry:
        """Clock out a user"""
        active_entry = TimeTrackingService.get_active_entry(db, user_id)
        if not active_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not currently clocked in."
            )
        
        # End any active break
        if active_entry.break_start and not active_entry.break_end:
            active_entry.break_end = datetime.utcnow()
        
        # Clock out and save work summary
        active_entry.clock_out = datetime.utcnow()
        if work_summary:
            active_entry.work_summary = work_summary.strip()
        
        db.commit()
        db.refresh(active_entry)
        return active_entry
    
    @staticmethod
    def start_break(db: Session, user_id: int) -> TimeEntry:
        """Start a break"""
        active_entry = TimeTrackingService.get_active_entry(db, user_id)
        if not active_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not currently clocked in."
            )
        
        if active_entry.break_start and not active_entry.break_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already on break."
            )
        
        # Start new break
        active_entry.break_start = datetime.utcnow()
        active_entry.break_end = None
        db.commit()
        db.refresh(active_entry)
        return active_entry
    
    @staticmethod
    def end_break(db: Session, user_id: int) -> TimeEntry:
        """End a break"""
        active_entry = TimeTrackingService.get_active_entry(db, user_id)
        if not active_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not currently clocked in."
            )
        
        if not active_entry.break_start or active_entry.break_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not currently on break."
            )
        
        # End break
        active_entry.break_end = datetime.utcnow()
        db.commit()
        db.refresh(active_entry)
        return active_entry
    
    @staticmethod
    def toggle_terrain(db: Session, user_id: int) -> TimeEntry:
        """Toggle terrain work status"""
        active_entry = TimeTrackingService.get_active_entry(db, user_id)
        if not active_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not currently clocked in."
            )
        
        active_entry.is_terrain = not active_entry.is_terrain
        db.commit()
        db.refresh(active_entry)
        return active_entry
    
    @staticmethod
    def get_current_status(db: Session, user_id: int) -> TimeTrackingStatusResponse:
        """Get current time tracking status for a user"""
        active_entry = TimeTrackingService.get_active_entry(db, user_id)
        
        if not active_entry:
            return TimeTrackingStatusResponse(
                is_clocked_in=False,
                is_on_break=False,
                is_terrain=False,
                current_entry=None,
                current_duration_minutes=None
            )
        
        is_on_break = bool(active_entry.break_start and not active_entry.break_end)
        
        # Calculate current duration
        duration_minutes = int((datetime.utcnow() - active_entry.clock_in).total_seconds() / 60)
        
        return TimeTrackingStatusResponse(
            is_clocked_in=True,
            is_on_break=is_on_break,
            is_terrain=active_entry.is_terrain,
            current_entry=TimeEntryResponse.from_orm(active_entry),
            current_duration_minutes=duration_minutes
        )
    
    @staticmethod
    def get_active_users(db: Session) -> List[ActiveUserResponse]:
        """Get all currently active (clocked in) users"""
        active_entries = db.query(TimeEntry).options(
            joinedload(TimeEntry.user).joinedload(User.department)
        ).filter(
            TimeEntry.clock_out.is_(None)
        ).all()
        
        result = []
        for entry in active_entries:
            is_on_break = bool(entry.break_start and not entry.break_end)
            duration_minutes = int((datetime.utcnow() - entry.clock_in).total_seconds() / 60)
            
            result.append(ActiveUserResponse(
                id=entry.user.id,
                full_name=entry.user.full_name,
                email=entry.user.email,
                department_name=entry.user.department.name if entry.user.department else None,
                clock_in=entry.clock_in,
                is_on_break=is_on_break,
                is_terrain=entry.is_terrain,
                current_duration_minutes=duration_minutes
            ))
        
        return result
    
    @staticmethod
    def get_not_clocked_in_users(db: Session) -> List[dict]:
        """Get all users who haven't clocked in today"""
        # Get all active entries for today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        clocked_in_user_ids = db.query(TimeEntry.user_id).filter(
            TimeEntry.clock_in >= today_start
        ).distinct().all()
        clocked_in_user_ids = [uid[0] for uid in clocked_in_user_ids]
        
        # Get all users who haven't clocked in
        not_clocked_in = db.query(User).options(
            joinedload(User.department)
        ).filter(
            and_(
                User.is_active == True,
                ~User.id.in_(clocked_in_user_ids)
            )
        ).all()
        
        result = []
        for user in not_clocked_in:
            result.append({
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "department_name": user.department.name if user.department else None
            })
        
        return result
    
    @staticmethod
    def calculate_worked_hours(entry: TimeEntry) -> Optional[float]:
        """Calculate total worked hours for a time entry"""
        if not entry.clock_out:
            return None
        
        total_duration = entry.clock_out - entry.clock_in
        
        # Subtract break duration if exists
        if entry.break_start and entry.break_end:
            break_duration = entry.break_end - entry.break_start
            total_duration -= break_duration
        
        return total_duration.total_seconds() / 3600  # Convert to hours
    
    @staticmethod
    def calculate_break_duration(entry: TimeEntry) -> Optional[int]:
        """Calculate break duration in minutes"""
        if not entry.break_start:
            return None
        
        break_end = entry.break_end or datetime.utcnow()
        break_duration = break_end - entry.break_start
        return int(break_duration.total_seconds() / 60)
    
    @staticmethod
    def get_time_records(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        user_id: Optional[int] = None,
        department_id: Optional[int] = None,
        is_terrain: Optional[bool] = None
    ) -> List[TimeEntryRecordResponse]:
        """Get time tracking records with filters"""
        query = db.query(TimeEntry).options(
            joinedload(TimeEntry.user).joinedload(User.department)
        )
        
        # Apply filters
        filters = []
        
        if start_date:
            filters.append(TimeEntry.clock_in >= start_date)
        
        if end_date:
            filters.append(TimeEntry.clock_in <= end_date)
        
        if user_id:
            filters.append(TimeEntry.user_id == user_id)
        
        if department_id:
            filters.append(User.department_id == department_id)
        
        if is_terrain is not None:
            filters.append(TimeEntry.is_terrain == is_terrain)
        
        if filters:
            query = query.join(User).filter(and_(*filters))
        else:
            query = query.join(User)
        
        entries = query.order_by(TimeEntry.clock_in.desc()).all()
        
        result = []
        for entry in entries:
            result.append(TimeEntryRecordResponse(
                id=entry.id,
                user_id=entry.user_id,
                user_name=entry.user.full_name,
                department_name=entry.user.department.name if entry.user.department else None,
                clock_in=entry.clock_in,
                clock_out=entry.clock_out,
                break_start=entry.break_start,
                break_end=entry.break_end,
                is_terrain=entry.is_terrain,
                total_worked_hours=TimeTrackingService.calculate_worked_hours(entry),
                break_duration_minutes=TimeTrackingService.calculate_break_duration(entry)
            ))
        
        return result
    
    @staticmethod
    def get_all_users_with_status(db: Session) -> List[UserWithStatusResponse]:
        """Get all users with their current time tracking status"""
        # Get all active users
        all_users = db.query(User).options(
            joinedload(User.department)
        ).filter(User.is_active == True).all()
        
        result = []
        for user in all_users:
            # Get active time entry if exists
            active_entry = db.query(TimeEntry).filter(
                and_(
                    TimeEntry.user_id == user.id,
                    TimeEntry.clock_out.is_(None)
                )
            ).first()
            
            if active_entry:
                is_on_break = bool(active_entry.break_start and not active_entry.break_end)
                duration_minutes = int((datetime.utcnow() - active_entry.clock_in).total_seconds() / 60)
                
                result.append(UserWithStatusResponse(
                    id=user.id,
                    full_name=user.full_name,
                    email=user.email,
                    department_name=user.department.name if user.department else None,
                    job_role=user.job_role,
                    is_clocked_in=True,
                    is_on_break=is_on_break,
                    is_terrain=active_entry.is_terrain,
                    clock_in=active_entry.clock_in,
                    current_duration_minutes=duration_minutes
                ))
            else:
                result.append(UserWithStatusResponse(
                    id=user.id,
                    full_name=user.full_name,
                    email=user.email,
                    department_name=user.department.name if user.department else None,
                    job_role=user.job_role,
                    is_clocked_in=False,
                    is_on_break=False,
                    is_terrain=False,
                    clock_in=None,
                    current_duration_minutes=None
                ))
        
        return result

