from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Status and priority (unified - using string for compatibility)
    status = Column(String, default="To-Do", nullable=False)  # 'To-Do','pending','In-Progress','in_progress','Done','completed','cancelled'
    priority = Column(String, default="Medium", nullable=False)  # 'Low','low','Medium','medium','High','high','urgent'
    
    # Assignment (dual fields for compatibility)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # FastAPI style
    assignee = Column(String, nullable=True)  # Streamlit style
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Project and positioning
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    position = Column(Integer, default=1, nullable=False)
    
    # Dates (due_date as string for Streamlit compatibility)
    due_date = Column(String, nullable=True)  # Keep as string for Streamlit compatibility
    completed_at = Column(DateTime, nullable=True)
    
    # Flags
    is_private = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Composite index for efficient ordering within projects
    __table_args__ = (
        Index('ix_tasks_project_position', 'project_id', 'position'),
    )
    
    # Relationships
    assignee = relationship("User", back_populates="tasks", foreign_keys=[assignee_id])
    creator = relationship("User", back_populates="created_tasks", foreign_keys=[created_by])
    project = relationship("Project", back_populates="tasks")
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")
