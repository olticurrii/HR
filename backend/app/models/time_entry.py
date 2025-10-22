from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class TimeEntry(Base):
    __tablename__ = "time_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    full_name = Column(String, nullable=True)  # Streamlit compatibility
    day = Column(String, nullable=True)  # Streamlit compatibility (YYYY-MM-DD format)
    
    # Clock times
    clock_in = Column(DateTime, nullable=True, default=func.now())
    clock_out = Column(DateTime, nullable=True)
    break_start = Column(DateTime, nullable=True)
    break_end = Column(DateTime, nullable=True)
    
    # Additional fields
    is_terrain = Column(Boolean, default=False)
    work_summary = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)  # Streamlit compatibility
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="time_entries")

