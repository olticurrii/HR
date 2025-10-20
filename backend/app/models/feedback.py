from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class RecipientType(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    EVERYONE = "EVERYONE"

class SentimentLabel(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Recipient types: single user, admin, everyone (company-wide broadcast)
    recipient_type = Column(SQLEnum(RecipientType), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # required if recipient_type == USER
    
    content = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    
    # Threading support
    parent_id = Column(Integer, ForeignKey("feedback.id"), nullable=True, index=True)
    
    # Moderation
    is_flagged = Column(Boolean, default=False, nullable=False)
    flagged_reason = Column(String, nullable=True)
    
    # Insights fields (computed on create/update)
    sentiment_label = Column(SQLEnum(SentimentLabel), nullable=True)
    sentiment_score = Column(Float, nullable=True)  # e.g., compound score -1..1
    keywords = Column(JSON, nullable=True)  # list of top keywords
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    author = relationship("User", foreign_keys=[author_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    parent = relationship("Feedback", remote_side=[id], foreign_keys=[parent_id], backref="replies")

