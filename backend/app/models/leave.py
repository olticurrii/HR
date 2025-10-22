from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Date, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class LeaveType(Base):
    __tablename__ = "leave_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    default_days_per_year = Column(Integer, default=0)
    requires_approval = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    leave_balances = relationship("LeaveBalance", back_populates="leave_type")


class LeaveBalance(Base):
    __tablename__ = "leave_balances"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    leave_type_id = Column(Integer, ForeignKey("leave_types.id", ondelete="CASCADE"), nullable=False)
    total_days = Column(Numeric(5, 2), default=0)
    used_days = Column(Numeric(5, 2), default=0)
    remaining_days = Column(Numeric(5, 2), default=0)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="leave_balances")
    leave_type = relationship("LeaveType", back_populates="leave_balances")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(String, primary_key=True, index=True)  # Changed to String to match database
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    full_name = Column(String, nullable=False)  # Added for Streamlit compatibility
    start_date = Column(String, nullable=False)  # Changed to String to match database
    end_date = Column(String, nullable=False)    # Changed to String to match database
    type = Column(String, nullable=False)        # Changed from leave_type_id to type
    reason = Column(Text, nullable=True)
    status = Column(String, default="pending")
    approver = Column(String, nullable=True)     # Changed from reviewed_by
    decision_note = Column(Text, nullable=True)  # Changed from review_comments
    created_at = Column(DateTime, default=func.now())
    
    # Relationships (simplified to match actual schema)
    user = relationship("User", foreign_keys=[user_id])

