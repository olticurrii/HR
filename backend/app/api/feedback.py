"""
Feedback API endpoints.
Supports feedback to specific users, admins, and everyone (company-wide).
Includes anonymous feedback and admin insights.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, desc, distinct
from typing import List, Optional
from datetime import datetime, timedelta
from collections import Counter

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.feedback import Feedback, RecipientType, SentimentLabel
from app.schemas.feedback import (
    FeedbackCreate, 
    FeedbackOut, 
    FeedbackAuthor,
    FeedbackInsights,
    FeedbackSentimentDistribution,
    KeywordCount,
    TrendPoint,
    TopRecipient
)
from app.services.insights_service import analyze_feedback, update_keyword_tracking
from app.services.notification_service import notification_service
from app.utils.moderation import check_content_moderation, sanitize_content
from app.api.settings import get_organization_settings

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to require admin role."""
    if not current_user.is_admin and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def serialize_feedback(feedback: Feedback, viewer: User, db: Session) -> dict:
    """
    Serialize feedback with proper author masking.
    
    Rules:
    - If is_anonymous=True and viewer is not admin and viewer is not the author:
      mask author as "Anonymous"
    - Admin can always see true author
    - Author can always see themselves
    """
    # Count replies
    reply_count = db.query(Feedback).filter(Feedback.parent_id == feedback.id).count()
    
    feedback_dict = {
        "id": feedback.id,
        "content": feedback.content,
        "is_anonymous": feedback.is_anonymous,
        "recipient_type": feedback.recipient_type.value,
        "recipient_id": feedback.recipient_id,
        "parent_id": feedback.parent_id,
        "is_flagged": feedback.is_flagged,
        "flagged_reason": feedback.flagged_reason if viewer.is_admin or viewer.role == "admin" else None,
        "created_at": feedback.created_at,
        "sentiment_label": feedback.sentiment_label.value if feedback.sentiment_label else None,
        "sentiment_score": feedback.sentiment_score,
        "keywords": feedback.keywords or [],
        "reply_count": reply_count
    }
    
    # Determine if we should mask the author
    is_admin = viewer.is_admin or viewer.role == "admin"
    is_author = feedback.author_id == viewer.id
    should_mask = feedback.is_anonymous and not is_admin and not is_author
    
    if should_mask:
        feedback_dict["author"] = None
        feedback_dict["author_display"] = "Anonymous"
    else:
        # Load author if not already loaded
        author = feedback.author
        if not author:
            author = db.query(User).filter(User.id == feedback.author_id).first()
        
        if author:
            feedback_dict["author"] = {
                "id": author.id,
                "full_name": author.full_name
            }
            feedback_dict["author_display"] = author.full_name
        else:
            feedback_dict["author"] = None
            feedback_dict["author_display"] = "Unknown"
    
    return feedback_dict

@router.post("/feedback", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create new feedback.
    
    Employees and admins can send feedback to:
    - Specific user (recipient_type="USER", recipient_id=<id>)
    - Admin (recipient_type="ADMIN")
    - Everyone (recipient_type="EVERYONE")
    
    Sender can choose to be anonymous.
    Sentiment and keywords are computed automatically.
    """
    # Validate recipient
    if payload.recipient_type == "USER":
        if not payload.recipient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="recipient_id is required when recipient_type is USER"
            )
        
        recipient = db.query(User).filter(User.id == payload.recipient_id).first()
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient user not found"
            )
    
    # Validate parent feedback if reply
    if payload.parent_id:
        parent_feedback = db.query(Feedback).filter(Feedback.id == payload.parent_id).first()
        if not parent_feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent feedback not found"
            )
    
    # Get organization settings
    org_settings = get_organization_settings(db)
    
    # Enforce anonymous setting
    is_anonymous = payload.is_anonymous if org_settings.feedback_allow_anonymous else False
    
    # Sanitize content
    clean_content = sanitize_content(payload.content)
    
    # Check for moderation violations (if enabled)
    is_flagged = False
    flagged_reason = None
    if org_settings.feedback_enable_moderation:
        is_flagged, flagged_reason = check_content_moderation(clean_content)
        
        # REJECT content if flagged (don't create the feedback)
        if is_flagged:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Content blocked by moderation: {flagged_reason}"
            )
    
    # Analyze feedback content
    analysis = analyze_feedback(clean_content)
    
    # Create feedback (only if it passed moderation)
    feedback = Feedback(
        author_id=current_user.id,
        recipient_type=RecipientType(payload.recipient_type),
        recipient_id=payload.recipient_id if payload.recipient_type == "USER" else None,
        parent_id=payload.parent_id if org_settings.feedback_enable_threading else None,
        content=clean_content,
        is_anonymous=is_anonymous,
        is_flagged=False,  # Never flagged since we reject flagged content
        flagged_reason=None,
        sentiment_label=SentimentLabel(analysis['sentiment_label']),
        sentiment_score=analysis['sentiment_score'],
        keywords=analysis['keywords']
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    # Track keywords for insights
    try:
        update_keyword_tracking(
            db,
            feedback,
            analysis['sentiment_label'],
            department=current_user.department
        )
    except Exception as e:
        # Don't fail feedback creation if keyword tracking fails
        print(f"⚠️ Keyword tracking failed: {e}")
    
    # Legacy notification code (removed - using new notification system below)
    
    # Send new notification system notifications
    try:
        if payload.recipient_type == "USER" and payload.recipient_id != current_user.id:
            # Direct feedback to user
            notification_service.create_notification(
                db=db,
                user_id=payload.recipient_id,
                notification_type='feedback_received',
                data={
                    'sender_name': 'Anonymous' if is_anonymous else current_user.full_name,
                    'feedback_id': feedback.id,
                    'is_anonymous': is_anonymous
                }
            )
        elif payload.recipient_type == "EVERYONE":
            # Public feedback - notify all users
            all_users = db.query(User).filter(User.is_active == True).all()
            for user in all_users:
                if user.id != current_user.id:
                    notification_service.create_notification(
                        db=db,
                        user_id=user.id,
                        notification_type='public_feedback',
                        data={
                            'sender_name': 'Anonymous' if is_anonymous else current_user.full_name,
                            'feedback_id': feedback.id,
                            'channel': 'Everyone'
                        }
                    )
        elif payload.recipient_type == "ADMIN":
            # Admin feedback - notify all admins
            admins = db.query(User).filter(
                User.is_active == True,
                User.role == 'admin'
            ).all()
            for admin in admins:
                if admin.id != current_user.id:
                    notification_service.create_notification(
                        db=db,
                        user_id=admin.id,
                        notification_type='feedback_received',
                        data={
                            'sender_name': 'Anonymous' if is_anonymous else current_user.full_name,
                            'feedback_id': feedback.id,
                            'is_anonymous': is_anonymous
                        }
                    )
    except Exception as e:
        print(f"⚠️ Failed to send new feedback notifications: {e}")
    
    # Serialize with proper masking
    return serialize_feedback(feedback, current_user, db)

@router.get("/feedback/my", response_model=List[FeedbackOut])
def get_my_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get feedback addressed to me.
    
    Returns:
    - Feedback with recipient_type="USER" and recipient_id=my_id
    - Feedback with recipient_type="EVERYONE" (broadcasts)
    - Feedback with recipient_type="ADMIN" (if I am admin)
    
    Anonymous authors appear as "Anonymous" (unless I am admin).
    """
    conditions = []
    
    # Feedback directly to me
    conditions.append(
        and_(
            Feedback.recipient_type == RecipientType.USER,
            Feedback.recipient_id == current_user.id
        )
    )
    
    # Everyone broadcasts
    conditions.append(Feedback.recipient_type == RecipientType.EVERYONE)
    
    # Admin-targeted feedback (if I am admin)
    if current_user.is_admin or current_user.role == "admin":
        conditions.append(Feedback.recipient_type == RecipientType.ADMIN)
    
    query = db.query(Feedback).filter(or_(*conditions))
    query = query.order_by(desc(Feedback.created_at))
    query = query.offset(skip).limit(limit)
    
    feedbacks = query.all()
    
    return [serialize_feedback(fb, current_user, db) for fb in feedbacks]

@router.get("/feedback/sent", response_model=List[FeedbackOut])
def get_sent_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get feedback authored by me.
    
    Author can always see their own feedback (never masked to self).
    """
    query = db.query(Feedback).filter(Feedback.author_id == current_user.id)
    query = query.order_by(desc(Feedback.created_at))
    query = query.offset(skip).limit(limit)
    
    feedbacks = query.all()
    
    return [serialize_feedback(fb, current_user, db) for fb in feedbacks]

@router.get("/feedback/{feedback_id}/replies", response_model=List[FeedbackOut])
def get_feedback_replies(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all replies to a specific feedback.
    Returns replies in chronological order.
    """
    # Check if threading is enabled
    org_settings = get_organization_settings(db)
    if not org_settings.feedback_enable_threading:
        return []
    
    # Verify parent feedback exists
    parent = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found"
        )
    
    # Get replies
    replies = db.query(Feedback).filter(
        Feedback.parent_id == feedback_id
    ).order_by(Feedback.created_at).all()
    
    return [serialize_feedback(fb, current_user, db) for fb in replies]

@router.get("/admin/feedback", response_model=List[FeedbackOut])
def get_all_feedback(
    recipient_type: Optional[str] = Query(None, description="Filter by recipient type: USER, ADMIN, EVERYONE"),
    recipient_id: Optional[int] = Query(None, description="Filter by recipient user ID"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin endpoint to view all feedback.
    
    Supports filters:
    - recipient_type: USER, ADMIN, EVERYONE
    - recipient_id: specific user ID
    - start_date/end_date: date range
    
    Admin can see true authors even for anonymous feedback.
    """
    query = db.query(Feedback)
    
    # Apply filters
    if recipient_type:
        try:
            query = query.filter(Feedback.recipient_type == RecipientType(recipient_type))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid recipient_type. Must be USER, ADMIN, or EVERYONE"
            )
    
    if recipient_id is not None:
        query = query.filter(Feedback.recipient_id == recipient_id)
    
    if start_date:
        query = query.filter(Feedback.created_at >= start_date)
    
    if end_date:
        query = query.filter(Feedback.created_at <= end_date)
    
    # Order and paginate
    query = query.order_by(desc(Feedback.created_at))
    query = query.offset(skip).limit(limit)
    
    feedbacks = query.all()
    
    return [serialize_feedback(fb, current_user, db) for fb in feedbacks]

@router.get("/admin/feedback/insights", response_model=FeedbackInsights)
def get_feedback_insights(
    window_days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin insights endpoint.
    
    Returns:
    - Sentiment distribution (positive/neutral/negative counts and percentages)
    - Top keywords (frequency)
    - Time trend (daily counts and average sentiment)
    - Top recipients (by volume)
    
    Data is aggregated over the specified window_days (default: 30).
    """
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=window_days)
    
    # Query feedback in window
    feedback_query = db.query(Feedback).filter(Feedback.created_at >= start_date)
    feedbacks = feedback_query.all()
    
    total_feedback = len(feedbacks)
    
    # 1. Sentiment Distribution
    sentiment_counts = {
        'positive': 0,
        'neutral': 0,
        'negative': 0
    }
    
    for fb in feedbacks:
        if fb.sentiment_label:
            sentiment_counts[fb.sentiment_label.value] += 1
    
    sentiment_dist = FeedbackSentimentDistribution(
        positive=sentiment_counts['positive'],
        neutral=sentiment_counts['neutral'],
        negative=sentiment_counts['negative'],
        total=total_feedback,
        positive_pct=round((sentiment_counts['positive'] / max(total_feedback, 1)) * 100, 2),
        neutral_pct=round((sentiment_counts['neutral'] / max(total_feedback, 1)) * 100, 2),
        negative_pct=round((sentiment_counts['negative'] / max(total_feedback, 1)) * 100, 2)
    )
    
    # 2. Top Keywords
    all_keywords = []
    for fb in feedbacks:
        if fb.keywords:
            all_keywords.extend(fb.keywords)
    
    keyword_counter = Counter(all_keywords)
    top_keywords = [
        KeywordCount(term=term, count=count)
        for term, count in keyword_counter.most_common(20)
    ]
    
    # 3. Time Trend (daily)
    # Group by date
    daily_data = {}
    for fb in feedbacks:
        date_key = fb.created_at.date().isoformat()
        if date_key not in daily_data:
            daily_data[date_key] = {
                'count': 0,
                'sentiment_scores': []
            }
        daily_data[date_key]['count'] += 1
        if fb.sentiment_score is not None:
            daily_data[date_key]['sentiment_scores'].append(fb.sentiment_score)
    
    trend = []
    for date_str in sorted(daily_data.keys()):
        data = daily_data[date_str]
        avg_sentiment = None
        if data['sentiment_scores']:
            avg_sentiment = round(sum(data['sentiment_scores']) / len(data['sentiment_scores']), 3)
        
        trend.append(TrendPoint(
            date=date_str,
            count=data['count'],
            avg_sentiment=avg_sentiment
        ))
    
    # 4. Top Recipients
    recipient_counts = {}
    
    for fb in feedbacks:
        if fb.recipient_type == RecipientType.USER and fb.recipient_id:
            key = f"USER_{fb.recipient_id}"
            if key not in recipient_counts:
                recipient = db.query(User).filter(User.id == fb.recipient_id).first()
                recipient_counts[key] = {
                    'id': fb.recipient_id,
                    'name': recipient.full_name if recipient else "Unknown",
                    'type': 'USER',
                    'count': 0
                }
            recipient_counts[key]['count'] += 1
        elif fb.recipient_type == RecipientType.ADMIN:
            key = "ADMIN"
            if key not in recipient_counts:
                recipient_counts[key] = {
                    'id': None,
                    'name': 'Admin',
                    'type': 'ADMIN',
                    'count': 0
                }
            recipient_counts[key]['count'] += 1
        elif fb.recipient_type == RecipientType.EVERYONE:
            key = "EVERYONE"
            if key not in recipient_counts:
                recipient_counts[key] = {
                    'id': None,
                    'name': 'Everyone',
                    'type': 'EVERYONE',
                    'count': 0
                }
            recipient_counts[key]['count'] += 1
    
    # Sort by count and get top recipients
    top_recipients = sorted(
        recipient_counts.values(),
        key=lambda x: x['count'],
        reverse=True
    )[:10]
    
    top_recipients_list = [
        TopRecipient(
            id=r['id'],
            name=r['name'],
            count=r['count'],
            recipient_type=r['type']
        )
        for r in top_recipients
    ]
    
    return FeedbackInsights(
        sentiment=sentiment_dist,
        keywords=top_keywords,
        trend=trend,
        recipients=top_recipients_list,
        total_feedback=total_feedback,
        window_days=window_days
    )

@router.get("/admin/feedback/weekly-digest")
def get_weekly_digest(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin endpoint to get weekly feedback digest.
    
    Returns statistics and summary for the last 7 days.
    """
    digest = send_weekly_digest_email(db)
    return digest

@router.get("/admin/feedback/flagged", response_model=List[FeedbackOut])
def get_flagged_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin endpoint to view all flagged feedback.
    Used for moderation review.
    """
    query = db.query(Feedback).filter(Feedback.is_flagged == True)
    query = query.order_by(desc(Feedback.created_at))
    query = query.offset(skip).limit(limit)
    
    feedbacks = query.all()
    
    return [serialize_feedback(fb, current_user, db) for fb in feedbacks]

@router.patch("/admin/feedback/{feedback_id}/unflag")
def unflag_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin endpoint to unflag feedback after review.
    """
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found"
        )
    
    feedback.is_flagged = False
    feedback.flagged_reason = None
    db.commit()
    
    return {"message": "Feedback unflagged successfully"}

@router.get("/admin/feedback/moderation-wordlist")
def get_moderation_wordlist(
    current_user: User = Depends(require_admin)
):
    """
    Admin endpoint to view the moderation wordlist.
    Shows what words are being filtered.
    """
    from app.utils.moderation import PROFANITY_LIST, SEVERE_VIOLATIONS
    
    return {
        "profanity_count": len(PROFANITY_LIST),
        "severe_violations_count": len(SEVERE_VIOLATIONS),
        "total_blocked_words": len(PROFANITY_LIST) + len(SEVERE_VIOLATIONS),
        "profanity_list": sorted(PROFANITY_LIST),
        "severe_violations": sorted(SEVERE_VIOLATIONS),
        "categories": {
            "mild_profanity": ["damn", "hell", "crap"],
            "strong_profanity": ["shit", "fuck", "ass", "bitch"],
            "derogatory": ["stupid", "idiot", "moron"],
            "sexual": ["sexual content filtered"],
            "severe": ["threats", "violence", "hate speech", "slurs"]
        },
        "note": "Uses word boundaries to avoid false positives"
    }

