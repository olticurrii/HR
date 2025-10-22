from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Author (unified approach)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String, nullable=True)  # Streamlit compatibility
    is_anonymous = Column(Boolean, default=False, nullable=False)
    
    # Content (dual fields for compatibility)
    message = Column(Text, nullable=False)  # Streamlit style
    content = Column(Text, nullable=True)   # FastAPI style
    
    # Recipients (FastAPI features)
    recipient_type = Column(String, nullable=True)  # 'USER','ADMIN','EVERYONE'
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Threading
    parent_id = Column(Integer, ForeignKey("feedback.id"), nullable=True, index=True)
    
    # Moderation
    is_flagged = Column(Boolean, default=False, nullable=False)
    flagged_reason = Column(String, nullable=True)
    
    # Sentiment analysis (unified)
    sentiment_score = Column(Float, nullable=True)
    sentiment_label = Column(String, nullable=True)  # 'Positive','positive','Neutral','neutral','Negative','negative'
    keywords = Column(Text, nullable=True)  # JSON string for compatibility
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    author = relationship("User", foreign_keys=[author_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    parent = relationship("Feedback", remote_side=[id], foreign_keys=[parent_id], backref="replies")

