from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Date, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class ObjectiveStatus(str, enum.Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    ARCHIVED = "archived"


class GoalApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class KpiPeriod(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"


class KpiVisibility(str, enum.Enum):
    ME = "me"
    MANAGER = "manager"
    ADMIN = "admin"


class KeyResultStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class ReviewCycleStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"


class ReviewerType(str, enum.Enum):
    MANAGER = "manager"
    SELF = "self"
    PEER = "peer"


class PerformanceObjective(Base):
    __tablename__ = "performance_objectives"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(ObjectiveStatus), default=ObjectiveStatus.ACTIVE, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Float, default=0.0)
    
    # Goal creation and approval tracking
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    approval_status = Column(Enum(GoalApprovalStatus), default=GoalApprovalStatus.PENDING, nullable=False)
    approval_date = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="performance_objectives")
    created_by = relationship("User", foreign_keys=[created_by_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    key_results = relationship("PerformanceKeyResult", back_populates="objective", cascade="all, delete-orphan")


class PerformanceKeyResult(Base):
    __tablename__ = "performance_key_results"

    id = Column(Integer, primary_key=True, index=True)
    objective_id = Column(Integer, ForeignKey("performance_objectives.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    target_value = Column(Float, nullable=True)
    current_value = Column(Float, default=0.0)
    unit = Column(String(50), nullable=True)  # e.g., '%', '#', 'hours'
    weight = Column(Float, default=1.0)
    status = Column(Enum(KeyResultStatus), default=KeyResultStatus.OPEN, nullable=False)
    progress = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    objective = relationship("PerformanceObjective", back_populates="key_results")


class ReviewCycle(Base):
    __tablename__ = "review_cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(ReviewCycleStatus), default=ReviewCycleStatus.DRAFT, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    questions = relationship("ReviewQuestion", back_populates="cycle", cascade="all, delete-orphan")
    responses = relationship("ReviewResponse", back_populates="cycle", cascade="all, delete-orphan")
    competency_scores = relationship("CompetencyScore", back_populates="cycle", cascade="all, delete-orphan")


class ReviewQuestion(Base):
    __tablename__ = "review_questions"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("review_cycles.id"), nullable=False, index=True)
    section = Column(Enum(ReviewerType), nullable=False)
    prompt = Column(Text, nullable=False)
    scale_min = Column(Integer, default=1)
    scale_max = Column(Integer, default=5)

    # Relationships
    cycle = relationship("ReviewCycle", back_populates="questions")
    responses = relationship("ReviewResponse", back_populates="question", cascade="all, delete-orphan")


class ReviewResponse(Base):
    __tablename__ = "review_responses"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("review_cycles.id"), nullable=False, index=True)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reviewer_type = Column(Enum(ReviewerType), nullable=False)
    question_id = Column(Integer, ForeignKey("review_questions.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=True)
    comment = Column(Text, nullable=True)
    is_anonymous_peer = Column(Boolean, default=False, nullable=False)  # For anonymous peer reviews
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    cycle = relationship("ReviewCycle", back_populates="responses")
    reviewee = relationship("User", foreign_keys=[reviewee_id], back_populates="review_responses_received")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="review_responses_given")
    question = relationship("ReviewQuestion", back_populates="responses")


class KpiSnapshot(Base):
    """
    Track KPI values over time for trend analysis
    """
    __tablename__ = "kpi_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kpi_name = Column(String(255), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)  # e.g., '%', '#', 'hours', 'score'
    snapshot_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    
    # Metadata fields
    period = Column(String(20), default='monthly', nullable=True)  # daily, weekly, monthly, quarterly
    visibility = Column(String(20), default='manager', nullable=True)  # me, manager, admin
    measured_by_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    measured_by = relationship("User", foreign_keys=[measured_by_id])


class Competency(Base):
    __tablename__ = "competencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    # Relationships
    scores = relationship("CompetencyScore", back_populates="competency", cascade="all, delete-orphan")


class CompetencyScore(Base):
    __tablename__ = "competency_scores"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("review_cycles.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=False, index=True)
    source = Column(Enum(ReviewerType), nullable=False)
    score = Column(Float, nullable=False)

    # Relationships
    cycle = relationship("ReviewCycle", back_populates="competency_scores")
    user = relationship("User", back_populates="competency_scores")
    competency = relationship("Competency", back_populates="scores")

