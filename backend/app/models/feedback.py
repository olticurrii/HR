from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_type = Column(String(8), nullable=False)  # 'USER', 'ADMIN', 'EVERYONE'
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    sentiment_label = Column(String(8), nullable=True)  # 'positive', 'neutral', 'negative'
    sentiment_score = Column(Float, nullable=True)
    keywords = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    parent_id = Column(Integer, ForeignKey("feedback.id"), nullable=True, index=True)
    is_flagged = Column(Boolean, default=False, nullable=False)
    flagged_reason = Column(String, nullable=True)
    
    # Relationships
    author = relationship("User", foreign_keys=[author_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    parent = relationship("Feedback", remote_side=[id], foreign_keys=[parent_id], backref="replies")

