"""
Insights and Analytics Models
"""
from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class DailyFeedbackAggregate(Base):
    """Daily aggregated feedback metrics for faster queries and forecasting"""
    __tablename__ = "daily_feedback_aggregates"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True, index=True)
    feedback_count = Column(Integer, default=0)
    sentiment_avg = Column(Float, default=0.0)
    sentiment_positive_count = Column(Integer, default=0)
    sentiment_neutral_count = Column(Integer, default=0)
    sentiment_negative_count = Column(Integer, default=0)
    anonymous_count = Column(Integer, default=0)
    flagged_count = Column(Integer, default=0)
    department_breakdown = Column(Text)  # JSON string
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class FeedbackKeyword(Base):
    """Tracked keywords from feedback with context and frequency"""
    __tablename__ = "feedback_keywords"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, nullable=False, index=True)
    frequency = Column(Integer, default=1, index=True)
    sentiment_context = Column(String)  # 'positive', 'negative', 'neutral'
    department = Column(String, index=True)
    first_seen = Column(Date, nullable=False)
    last_seen = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

