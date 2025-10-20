from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    job_role = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)  # Kept for backward compatibility
    role = Column(String, default="employee")  # New: "admin", "manager", "employee"
    avatar_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    hire_date = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # User preferences
    timezone = Column(String, default="UTC", nullable=True)
    locale = Column(String, default="en", nullable=True)
    theme = Column(String, default="light", nullable=True)  # light, dark, system
    email_notifications = Column(Boolean, default=True)
    
    # Relationships
    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])
    manager = relationship("User", back_populates="direct_reports", remote_side=[id], foreign_keys=[manager_id])
    direct_reports = relationship("User", back_populates="manager", foreign_keys=[manager_id])
    tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")
    created_tasks = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    projects = relationship("Project", back_populates="creator", foreign_keys="Project.created_by")
    messages = relationship("Message", back_populates="sender")
    chat_rooms = relationship("ChatRoom", secondary="chat_participants", back_populates="participants")
    roles = relationship("Role", secondary="user_roles", back_populates="users")
    comments = relationship("Comment", back_populates="user")
    
    # Performance relationships
    performance_objectives = relationship("PerformanceObjective", back_populates="user", foreign_keys="PerformanceObjective.user_id")
    review_responses_received = relationship("ReviewResponse", foreign_keys="ReviewResponse.reviewee_id", back_populates="reviewee")
    review_responses_given = relationship("ReviewResponse", foreign_keys="ReviewResponse.reviewer_id", back_populates="reviewer")
    competency_scores = relationship("CompetencyScore", back_populates="user")
    
    # Time tracking relationships
    time_entries = relationship("TimeEntry", back_populates="user")
    
    # Notification relationships
    notifications = relationship("Notification", back_populates="user")
    push_tokens = relationship("PushNotificationToken", back_populates="user")
    notification_preferences = relationship("UserNotificationPreferences", back_populates="user", uselist=False)
    
    # Leave management relationships
    leave_balances = relationship("LeaveBalance", back_populates="user")
    leave_requests = relationship("LeaveRequest", foreign_keys="LeaveRequest.user_id", back_populates="user")
    
    # Session relationships
    sessions = relationship("UserSession", back_populates="user")