from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from datetime import datetime

class FeedbackCreate(BaseModel):
    content: str
    is_anonymous: bool = False
    recipient_type: Literal["USER", "ADMIN", "EVERYONE"]
    recipient_id: Optional[int] = None  # required if recipient_type == "USER"
    parent_id: Optional[int] = None  # for threaded replies
    
    @field_validator('content')
    @classmethod
    def content_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Content cannot be empty')
        return v

class FeedbackAuthor(BaseModel):
    id: int
    full_name: str
    
    class Config:
        from_attributes = True

class FeedbackOut(BaseModel):
    id: int
    content: str
    is_anonymous: bool
    recipient_type: Literal["USER", "ADMIN", "EVERYONE"]
    recipient_id: Optional[int]
    parent_id: Optional[int] = None
    is_flagged: bool = False
    flagged_reason: Optional[str] = None
    created_at: datetime
    sentiment_label: Optional[Literal["positive", "neutral", "negative"]]
    sentiment_score: Optional[float]
    keywords: Optional[list[str]]
    reply_count: int = 0
    # author is masked if anonymous and viewer is not admin
    author: Optional[FeedbackAuthor] = None
    author_display: Optional[str] = None  # "Anonymous" or actual name
    
    class Config:
        from_attributes = True

class FeedbackSentimentDistribution(BaseModel):
    positive: int
    neutral: int
    negative: int
    total: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float

class KeywordCount(BaseModel):
    term: str
    count: int

class TrendPoint(BaseModel):
    date: str
    count: int
    avg_sentiment: Optional[float]

class TopRecipient(BaseModel):
    id: Optional[int]
    name: str
    count: int
    recipient_type: str

class FeedbackInsights(BaseModel):
    sentiment: FeedbackSentimentDistribution
    keywords: list[KeywordCount]
    trend: list[TrendPoint]
    recipients: list[TopRecipient]
    total_feedback: int
    window_days: int

