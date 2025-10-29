"""
Pydantic schemas for Office Booking & Meeting Scheduler
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


# ==================== Office Schemas ====================

class OfficeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    floor: Optional[str] = Field(None, max_length=50)
    capacity: int = Field(..., ge=1)
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    photo_url: Optional[str] = None


class OfficeCreate(OfficeBase):
    """Schema for creating a new office"""
    pass


class OfficeUpdate(BaseModel):
    """Schema for updating an office"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    floor: Optional[str] = Field(None, max_length=50)
    capacity: Optional[int] = Field(None, ge=1)
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    photo_url: Optional[str] = None
    is_active: Optional[bool] = None


class OfficeResponse(OfficeBase):
    """Schema for office response"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    current_booking: Optional[dict] = None  # Current/ongoing booking if any
    
    class Config:
        from_attributes = True


class OfficeAvailability(BaseModel):
    """Schema for office availability"""
    office_id: int
    office_name: str
    is_available: bool
    current_booking: Optional[dict] = None
    next_available: Optional[datetime] = None


# ==================== Meeting Booking Schemas ====================

class MeetingBookingBase(BaseModel):
    office_id: int
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    participant_ids: Optional[List[int]] = []
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class MeetingBookingCreate(MeetingBookingBase):
    """Schema for creating a meeting booking"""
    pass


class MeetingBookingUpdate(BaseModel):
    """Schema for updating a meeting booking"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    participant_ids: Optional[List[int]] = None
    status: Optional[str] = Field(None, pattern="^(upcoming|ongoing|completed|cancelled)$")


class MeetingBookingResponse(MeetingBookingBase):
    """Schema for meeting booking response"""
    id: int
    organizer_id: int
    organizer_name: str
    office_name: str
    participant_names: List[str]
    status: str
    duration_minutes: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MeetingParticipant(BaseModel):
    """Schema for meeting participant"""
    id: int
    full_name: str
    email: str
    avatar_url: Optional[str] = None


class MeetingDetails(BaseModel):
    """Detailed meeting information"""
    id: int
    title: str
    description: Optional[str]
    office: OfficeResponse
    organizer: MeetingParticipant
    participants: List[MeetingParticipant]
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    status: str
    created_at: datetime
    updated_at: datetime


# ==================== Dashboard/Summary Schemas ====================

class BookingSummary(BaseModel):
    """Summary of booking statistics"""
    total_offices: int
    available_offices: int
    booked_offices: int
    total_bookings: int
    upcoming_bookings: int
    ongoing_bookings: int
    completed_bookings: int
    my_upcoming_meetings: int


class CalendarEvent(BaseModel):
    """Calendar event for display"""
    id: int
    title: str
    office_name: str
    organizer_name: str
    start_time: datetime
    end_time: datetime
    status: str
    participant_count: int
    is_organizer: bool
    is_participant: bool

