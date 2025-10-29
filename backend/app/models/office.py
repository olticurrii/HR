from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Office(Base):
    """Office/Meeting Room Model"""
    __tablename__ = "offices"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    location = Column(String(200), nullable=True)
    floor = Column(String(50), nullable=True)
    capacity = Column(Integer, nullable=False, default=1)
    description = Column(Text, nullable=True)
    amenities = Column(JSON, nullable=True)  # ['Projector', 'Whiteboard', 'Video Conference']
    photo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    bookings = relationship("MeetingBooking", back_populates="office", cascade="all, delete-orphan")


class MeetingBooking(Base):
    """Meeting Booking Model"""
    __tablename__ = "meeting_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    office_id = Column(Integer, ForeignKey("offices.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    organizer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)
    participant_ids = Column(JSON, nullable=True)  # List of user IDs
    status = Column(String(20), default="upcoming", nullable=False)  # upcoming, ongoing, completed, cancelled
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    office = relationship("Office", back_populates="bookings")
    organizer = relationship("User", foreign_keys=[organizer_id])

