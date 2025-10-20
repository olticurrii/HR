from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ObjectiveStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    ARCHIVED = "archived"


class GoalApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class KeyResultStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class ReviewCycleStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"


class ReviewerType(str, Enum):
    MANAGER = "manager"
    SELF = "self"
    PEER = "peer"


# Key Result Schemas
class KeyResultBase(BaseModel):
    title: str = Field(..., max_length=255)
    target_value: Optional[float] = None
    current_value: float = 0.0
    unit: Optional[str] = Field(None, max_length=50)
    weight: float = 1.0
    status: KeyResultStatus = KeyResultStatus.OPEN


class KeyResultCreate(KeyResultBase):
    objective_id: int


class KeyResultUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=50)
    weight: Optional[float] = None
    status: Optional[KeyResultStatus] = None
    progress: Optional[float] = None


class KeyResultResponse(KeyResultBase):
    id: int
    objective_id: int
    progress: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Objective Schemas
class ObjectiveBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: ObjectiveStatus = ObjectiveStatus.ACTIVE
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None


class ObjectiveCreate(ObjectiveBase):
    user_id: int
    request_approval: bool = False  # For self-created goals that need approval


class ObjectiveUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[ObjectiveStatus] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    progress: Optional[float] = None


class ObjectiveResponse(ObjectiveBase):
    id: int
    user_id: int
    progress: float
    created_at: datetime
    updated_at: datetime
    key_results: List[KeyResultResponse] = []
    
    # Approval tracking
    created_by_id: Optional[int] = None
    approved_by_id: Optional[int] = None
    approval_status: GoalApprovalStatus = GoalApprovalStatus.PENDING
    approval_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class GoalApprovalAction(BaseModel):
    goal_id: int
    action: str = Field(..., pattern="^(approve|reject)$")
    rejection_reason: Optional[str] = None


# Review Cycle Schemas
class ReviewCycleBase(BaseModel):
    name: str = Field(..., max_length=255)
    start_date: datetime
    end_date: datetime
    status: ReviewCycleStatus = ReviewCycleStatus.DRAFT


class ReviewCycleCreate(ReviewCycleBase):
    pass


class ReviewCycleResponse(ReviewCycleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Review Question Schemas
class ReviewQuestionBase(BaseModel):
    section: ReviewerType
    prompt: str
    scale_min: int = 1
    scale_max: int = 5


class ReviewQuestionCreate(ReviewQuestionBase):
    cycle_id: int


class ReviewQuestionResponse(ReviewQuestionBase):
    id: int
    cycle_id: int

    class Config:
        from_attributes = True


# Review Response Schemas
class ReviewResponseBase(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponseCreate(BaseModel):
    cycle_id: int
    reviewee_id: int
    reviewer_type: ReviewerType
    answers: List[dict]  # [{question_id, rating?, comment?}]
    is_anonymous_peer: bool = False  # For anonymous peer reviews


class ReviewResponseItem(ReviewResponseBase):
    id: int
    cycle_id: int
    reviewee_id: int
    reviewer_id: int
    reviewer_type: ReviewerType
    question_id: int
    created_at: datetime
    question: Optional[ReviewQuestionResponse] = None
    is_anonymous_peer: bool = False
    reviewer_name: Optional[str] = None  # Masked if anonymous

    class Config:
        from_attributes = True


# Competency Schemas
class CompetencyBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None


class CompetencyCreate(CompetencyBase):
    pass


class CompetencyResponse(CompetencyBase):
    id: int

    class Config:
        from_attributes = True


# Competency Score Schemas
class CompetencyScoreBase(BaseModel):
    score: float = Field(..., ge=0, le=5)


class CompetencyScoreCreate(CompetencyScoreBase):
    cycle_id: int
    user_id: int
    competency_id: int
    source: ReviewerType


class CompetencyScoreResponse(CompetencyScoreBase):
    id: int
    cycle_id: int
    user_id: int
    competency_id: int
    source: ReviewerType
    competency: Optional[CompetencyResponse] = None

    class Config:
        from_attributes = True


# Aggregated Schemas for Frontend
class CompetencyRadarData(BaseModel):
    competency_id: int
    competency_name: str
    self_score: Optional[float] = None
    manager_score: Optional[float] = None
    peer_score: Optional[float] = None


class ReviewsByType(BaseModel):
    reviewer_type: ReviewerType
    questions_and_answers: List[dict]  # [{question, rating, comment, reviewer_name}]


# KPI Snapshot Schemas
class KpiSnapshotBase(BaseModel):
    kpi_name: str = Field(..., max_length=255)
    value: float
    unit: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class KpiSnapshotCreate(KpiSnapshotBase):
    user_id: int
    snapshot_date: Optional[datetime] = None  # If not provided, uses current date
    period: Optional[str] = Field('monthly', pattern="^(daily|weekly|monthly|quarterly)$")
    visibility: Optional[str] = Field('manager', pattern="^(me|manager|admin)$")
    measured_by_id: Optional[int] = None  # Auto-set to current user if not provided


class KpiSnapshotResponse(KpiSnapshotBase):
    id: int
    user_id: int
    snapshot_date: datetime
    period: Optional[str] = None
    visibility: Optional[str] = None
    measured_by_id: Optional[int] = None

    class Config:
        from_attributes = True


class KpiTrendData(BaseModel):
    kpi_name: str
    data_points: List[dict]  # [{date, value}]
    unit: Optional[str] = None
    current_value: Optional[float] = None
    trend_direction: Optional[str] = None  # "up", "down", "stable"


class PerformanceSummary(BaseModel):
    total_objectives: int
    active_objectives: int
    total_progress: float
    objectives: List[ObjectiveResponse]


class TopPerformerBadge(BaseModel):
    has_badge: bool
    score: Optional[float] = None
    threshold: int
    rank: Optional[int] = None
    percentile: Optional[float] = None

