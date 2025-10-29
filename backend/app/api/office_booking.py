"""
Office Booking & Meeting Scheduler API
Endpoints for managing offices and meeting bookings
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.auth import get_current_user
from app.core.rbac import admin_only
from app.models.user import User
from app.models.office import Office, MeetingBooking
from app.schemas.office import (
    OfficeCreate,
    OfficeUpdate,
    OfficeResponse,
    OfficeAvailability,
    MeetingBookingCreate,
    MeetingBookingUpdate,
    MeetingBookingResponse,
    MeetingDetails,
    MeetingParticipant,
    BookingSummary,
    CalendarEvent
)
from app.services.notification_service import notification_service

router = APIRouter()


# ==================== Office Management (Admin) ====================

@router.get("/offices", response_model=List[OfficeResponse])
async def get_offices(
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all offices"""
    query = db.query(Office)
    
    if not include_inactive:
        query = query.filter(Office.is_active == True)
    
    offices = query.order_by(Office.name).all()
    
    # Add current booking info
    result = []
    now = datetime.utcnow()
    for office in offices:
        current_booking = db.query(MeetingBooking).filter(
            and_(
                MeetingBooking.office_id == office.id,
                MeetingBooking.start_time <= now,
                MeetingBooking.end_time >= now,
                MeetingBooking.status == "ongoing"
            )
        ).first()
        
        office_dict = OfficeResponse.from_orm(office).dict()
        if current_booking:
            office_dict['current_booking'] = {
                'id': current_booking.id,
                'title': current_booking.title,
                'end_time': current_booking.end_time.isoformat()
            }
        result.append(OfficeResponse(**office_dict))
    
    return result


@router.post("/offices", response_model=OfficeResponse, status_code=status.HTTP_201_CREATED)
async def create_office(
    office_data: OfficeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Create a new office (Admin only)"""
    # Check for duplicate name
    existing = db.query(Office).filter(Office.name == office_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Office with name '{office_data.name}' already exists"
        )
    
    office = Office(**office_data.dict())
    db.add(office)
    db.commit()
    db.refresh(office)
    
    return office


@router.get("/offices/{office_id}", response_model=OfficeResponse)
async def get_office(
    office_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific office"""
    office = db.query(Office).filter(Office.id == office_id).first()
    if not office:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Office not found"
        )
    
    return office


@router.put("/offices/{office_id}", response_model=OfficeResponse)
async def update_office(
    office_id: int,
    office_data: OfficeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Update an office (Admin only)"""
    office = db.query(Office).filter(Office.id == office_id).first()
    if not office:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Office not found"
        )
    
    # Update fields
    update_data = office_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(office, field, value)
    
    office.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(office)
    
    return office


@router.delete("/offices/{office_id}")
async def delete_office(
    office_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Delete an office (Admin only)"""
    office = db.query(Office).filter(Office.id == office_id).first()
    if not office:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Office not found"
        )
    
    # Check for future bookings
    future_bookings = db.query(MeetingBooking).filter(
        and_(
            MeetingBooking.office_id == office_id,
            MeetingBooking.end_time > datetime.utcnow(),
            MeetingBooking.status.in_(["upcoming", "ongoing"])
        )
    ).count()
    
    if future_bookings > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete office with {future_bookings} active/upcoming bookings"
        )
    
    db.delete(office)
    db.commit()
    
    return {"message": "Office deleted successfully"}


@router.get("/offices/{office_id}/availability", response_model=OfficeAvailability)
async def check_office_availability(
    office_id: int,
    start_time: datetime,
    end_time: datetime,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if an office is available for a specific time range"""
    office = db.query(Office).filter(Office.id == office_id).first()
    if not office:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Office not found"
        )
    
    # Check for conflicting bookings
    conflict = db.query(MeetingBooking).filter(
        and_(
            MeetingBooking.office_id == office_id,
            MeetingBooking.status.in_(["upcoming", "ongoing"]),
            or_(
                and_(MeetingBooking.start_time <= start_time, MeetingBooking.end_time > start_time),
                and_(MeetingBooking.start_time < end_time, MeetingBooking.end_time >= end_time),
                and_(MeetingBooking.start_time >= start_time, MeetingBooking.end_time <= end_time)
            )
        )
    ).first()
    
    is_available = conflict is None
    
    return OfficeAvailability(
        office_id=office.id,
        office_name=office.name,
        is_available=is_available,
        current_booking={
            'id': conflict.id,
            'title': conflict.title,
            'start_time': conflict.start_time,
            'end_time': conflict.end_time
        } if conflict else None,
        next_available=conflict.end_time if conflict else None
    )


# ==================== Meeting Bookings ====================

@router.post("/bookings", response_model=MeetingBookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: MeetingBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new meeting booking"""
    # Validate office exists
    office = db.query(Office).filter(
        and_(Office.id == booking_data.office_id, Office.is_active == True)
    ).first()
    
    if not office:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Office not found or inactive"
        )
    
    # Check if office is available
    conflict = db.query(MeetingBooking).filter(
        and_(
            MeetingBooking.office_id == booking_data.office_id,
            MeetingBooking.status.in_(["upcoming", "ongoing"]),
            or_(
                and_(MeetingBooking.start_time <= booking_data.start_time, MeetingBooking.end_time > booking_data.start_time),
                and_(MeetingBooking.start_time < booking_data.end_time, MeetingBooking.end_time >= booking_data.end_time),
                and_(MeetingBooking.start_time >= booking_data.start_time, MeetingBooking.end_time <= booking_data.end_time)
            )
        )
    ).first()
    
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Office is already booked from {conflict.start_time} to {conflict.end_time}"
        )
    
    # Validate participants exist
    if booking_data.participant_ids:
        for participant_id in booking_data.participant_ids:
            participant = db.query(User).filter(User.id == participant_id).first()
            if not participant:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Participant with ID {participant_id} not found"
                )
    
    # Create booking
    booking = MeetingBooking(
        office_id=booking_data.office_id,
        title=booking_data.title,
        description=booking_data.description,
        organizer_id=current_user.id,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        participant_ids=booking_data.participant_ids or [],
        status="upcoming"
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Send notifications to participants
    for participant_id in (booking_data.participant_ids or []):
        if participant_id != current_user.id:
            try:
                notification_service.create_notification(
                    db=db,
                    user_id=participant_id,
                    notification_type='meeting_invited',
                    data={
                        'meeting_id': booking.id,
                        'meeting_title': booking.title,
                        'organizer_name': current_user.full_name,
                        'office_name': office.name,
                        'start_time': booking.start_time.isoformat(),
                        'end_time': booking.end_time.isoformat()
                    }
                )
            except Exception as e:
                print(f"⚠️ Failed to send notification to user {participant_id}: {e}")
    
    # Build response
    participant_names = []
    for pid in (booking.participant_ids or []):
        user = db.query(User).filter(User.id == pid).first()
        if user:
            participant_names.append(user.full_name)
    
    duration_minutes = int((booking.end_time - booking.start_time).total_seconds() / 60)
    
    return MeetingBookingResponse(
        id=booking.id,
        office_id=booking.office_id,
        title=booking.title,
        description=booking.description,
        organizer_id=booking.organizer_id,
        organizer_name=current_user.full_name,
        office_name=office.name,
        start_time=booking.start_time,
        end_time=booking.end_time,
        participant_ids=booking.participant_ids or [],
        participant_names=participant_names,
        status=booking.status,
        duration_minutes=duration_minutes,
        created_at=booking.created_at,
        updated_at=booking.updated_at
    )


@router.get("/bookings", response_model=List[MeetingBookingResponse])
async def get_bookings(
    office_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    my_meetings_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get meeting bookings with filters"""
    query = db.query(MeetingBooking)
    
    # Apply filters
    if office_id:
        query = query.filter(MeetingBooking.office_id == office_id)
    
    if status_filter:
        query = query.filter(MeetingBooking.status == status_filter)
    
    if start_date:
        query = query.filter(MeetingBooking.start_time >= start_date)
    
    if end_date:
        query = query.filter(MeetingBooking.end_time <= end_date)
    
    if my_meetings_only:
        # Get meetings where user is organizer or participant
        query = query.filter(
            or_(
                MeetingBooking.organizer_id == current_user.id,
                MeetingBooking.participant_ids.contains(f'[{current_user.id}]')
            )
        )
    
    bookings = query.order_by(MeetingBooking.start_time.desc()).all()
    
    # Build responses
    result = []
    for booking in bookings:
        office = db.query(Office).filter(Office.id == booking.office_id).first()
        organizer = db.query(User).filter(User.id == booking.organizer_id).first()
        
        participant_names = []
        for pid in (booking.participant_ids or []):
            user = db.query(User).filter(User.id == pid).first()
            if user:
                participant_names.append(user.full_name)
        
        duration_minutes = int((booking.end_time - booking.start_time).total_seconds() / 60)
        
        result.append(MeetingBookingResponse(
            id=booking.id,
            office_id=booking.office_id,
            title=booking.title,
            description=booking.description,
            organizer_id=booking.organizer_id,
            organizer_name=organizer.full_name if organizer else "Unknown",
            office_name=office.name if office else "Unknown",
            start_time=booking.start_time,
            end_time=booking.end_time,
            participant_ids=booking.participant_ids or [],
            participant_names=participant_names,
            status=booking.status,
            duration_minutes=duration_minutes,
            created_at=booking.created_at,
            updated_at=booking.updated_at
        ))
    
    return result


@router.get("/bookings/{booking_id}", response_model=MeetingDetails)
async def get_booking_details(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific booking"""
    booking = db.query(MeetingBooking).filter(MeetingBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Get related data
    office = db.query(Office).filter(Office.id == booking.office_id).first()
    organizer = db.query(User).filter(User.id == booking.organizer_id).first()
    
    participants = []
    for pid in (booking.participant_ids or []):
        user = db.query(User).filter(User.id == pid).first()
        if user:
            participants.append(MeetingParticipant(
                id=user.id,
                full_name=user.full_name,
                email=user.email,
                avatar_url=user.avatar_url
            ))
    
    duration_minutes = int((booking.end_time - booking.start_time).total_seconds() / 60)
    
    return MeetingDetails(
        id=booking.id,
        title=booking.title,
        description=booking.description,
        office=OfficeResponse.from_orm(office),
        organizer=MeetingParticipant(
            id=organizer.id,
            full_name=organizer.full_name,
            email=organizer.email,
            avatar_url=organizer.avatar_url
        ) if organizer else None,
        participants=participants,
        start_time=booking.start_time,
        end_time=booking.end_time,
        duration_minutes=duration_minutes,
        status=booking.status,
        created_at=booking.created_at,
        updated_at=booking.updated_at
    )


@router.put("/bookings/{booking_id}", response_model=MeetingBookingResponse)
async def update_booking(
    booking_id: int,
    booking_data: MeetingBookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a meeting booking"""
    booking = db.query(MeetingBooking).filter(MeetingBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Only organizer can update
    if booking.organizer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the organizer can update this booking"
        )
    
    # Update fields
    update_data = booking_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    
    booking.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(booking)
    
    # Build response
    office = db.query(Office).filter(Office.id == booking.office_id).first()
    organizer = db.query(User).filter(User.id == booking.organizer_id).first()
    
    participant_names = []
    for pid in (booking.participant_ids or []):
        user = db.query(User).filter(User.id == pid).first()
        if user:
            participant_names.append(user.full_name)
    
    duration_minutes = int((booking.end_time - booking.start_time).total_seconds() / 60)
    
    return MeetingBookingResponse(
        id=booking.id,
        office_id=booking.office_id,
        title=booking.title,
        description=booking.description,
        organizer_id=booking.organizer_id,
        organizer_name=organizer.full_name if organizer else "Unknown",
        office_name=office.name if office else "Unknown",
        start_time=booking.start_time,
        end_time=booking.end_time,
        participant_ids=booking.participant_ids or [],
        participant_names=participant_names,
        status=booking.status,
        duration_minutes=duration_minutes,
        created_at=booking.created_at,
        updated_at=booking.updated_at
    )


@router.delete("/bookings/{booking_id}")
async def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a meeting booking"""
    booking = db.query(MeetingBooking).filter(MeetingBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Only organizer or admin can cancel
    if booking.organizer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the organizer or admin can cancel this booking"
        )
    
    booking.status = "cancelled"
    booking.updated_at = datetime.utcnow()
    db.commit()
    
    # Notify participants
    for participant_id in (booking.participant_ids or []):
        if participant_id != current_user.id:
            try:
                notification_service.create_notification(
                    db=db,
                    user_id=participant_id,
                    notification_type='meeting_cancelled',
                    data={
                        'meeting_id': booking.id,
                        'meeting_title': booking.title,
                        'cancelled_by': current_user.full_name
                    }
                )
            except Exception as e:
                print(f"⚠️ Failed to send cancellation notification: {e}")
    
    return {"message": "Booking cancelled successfully"}


@router.get("/calendar", response_model=List[CalendarEvent])
async def get_calendar_events(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    office_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get calendar events for a date range"""
    query = db.query(MeetingBooking).filter(
        and_(
            MeetingBooking.start_time >= start_date,
            MeetingBooking.end_time <= end_date,
            MeetingBooking.status != "cancelled"
        )
    )
    
    if office_id:
        query = query.filter(MeetingBooking.office_id == office_id)
    
    bookings = query.order_by(MeetingBooking.start_time).all()
    
    result = []
    for booking in bookings:
        office = db.query(Office).filter(Office.id == booking.office_id).first()
        organizer = db.query(User).filter(User.id == booking.organizer_id).first()
        
        participant_count = len(booking.participant_ids or [])
        is_organizer = booking.organizer_id == current_user.id
        is_participant = current_user.id in (booking.participant_ids or [])
        
        result.append(CalendarEvent(
            id=booking.id,
            title=booking.title,
            office_name=office.name if office else "Unknown",
            organizer_name=organizer.full_name if organizer else "Unknown",
            start_time=booking.start_time,
            end_time=booking.end_time,
            status=booking.status,
            participant_count=participant_count,
            is_organizer=is_organizer,
            is_participant=is_participant
        ))
    
    return result


@router.get("/summary", response_model=BookingSummary)
async def get_booking_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get booking statistics summary"""
    total_offices = db.query(Office).filter(Office.is_active == True).count()
    
    now = datetime.utcnow()
    
    # Count currently booked offices
    booked_offices = db.query(MeetingBooking.office_id).filter(
        and_(
            MeetingBooking.start_time <= now,
            MeetingBooking.end_time >= now,
            MeetingBooking.status == "ongoing"
        )
    ).distinct().count()
    
    available_offices = total_offices - booked_offices
    
    # Count bookings by status
    total_bookings = db.query(MeetingBooking).count()
    upcoming_bookings = db.query(MeetingBooking).filter(
        and_(MeetingBooking.status == "upcoming", MeetingBooking.start_time > now)
    ).count()
    ongoing_bookings = db.query(MeetingBooking).filter(MeetingBooking.status == "ongoing").count()
    completed_bookings = db.query(MeetingBooking).filter(MeetingBooking.status == "completed").count()
    
    # Count user's upcoming meetings
    my_upcoming = db.query(MeetingBooking).filter(
        and_(
            or_(
                MeetingBooking.organizer_id == current_user.id,
                MeetingBooking.participant_ids.contains(f'[{current_user.id}]')
            ),
            MeetingBooking.start_time > now,
            MeetingBooking.status == "upcoming"
        )
    ).count()
    
    return BookingSummary(
        total_offices=total_offices,
        available_offices=available_offices,
        booked_offices=booked_offices,
        total_bookings=total_bookings,
        upcoming_bookings=upcoming_bookings,
        ongoing_bookings=ongoing_bookings,
        completed_bookings=completed_bookings,
        my_upcoming_meetings=my_upcoming
    )


# Background task to update booking statuses
@router.post("/update-statuses")
async def update_booking_statuses(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    """Update booking statuses based on current time (Admin only)"""
    now = datetime.utcnow()
    
    # Mark ongoing bookings
    upcoming_to_ongoing = db.query(MeetingBooking).filter(
        and_(
            MeetingBooking.status == "upcoming",
            MeetingBooking.start_time <= now,
            MeetingBooking.end_time > now
        )
    ).all()
    
    for booking in upcoming_to_ongoing:
        booking.status = "ongoing"
    
    # Mark completed bookings
    ongoing_to_completed = db.query(MeetingBooking).filter(
        and_(
            MeetingBooking.status == "ongoing",
            MeetingBooking.end_time <= now
        )
    ).all()
    
    for booking in ongoing_to_completed:
        booking.status = "completed"
    
    db.commit()
    
    return {
        "message": "Statuses updated successfully",
        "ongoing": len(upcoming_to_ongoing),
        "completed": len(ongoing_to_completed)
    }

