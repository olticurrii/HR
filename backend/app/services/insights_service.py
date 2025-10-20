"""
Insights service for aggregating and analyzing feedback data
"""
from datetime import date, datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import re

from app.models.feedback import Feedback
from app.models.insights import DailyFeedbackAggregate, FeedbackKeyword
from app.models.user import User
from app.utils.keyword_extractor import (
    extract_keywords,
    get_top_keywords,
    categorize_keywords_by_sentiment,
    categorize_keywords_by_department
)
from app.utils.forecasting import forecast_with_confidence, simple_trend_analysis


def analyze_feedback(content: str) -> Dict:
    """
    Analyze feedback content for sentiment and keywords
    
    Args:
        content: Feedback text content
    
    Returns:
        Dict with sentiment_label, sentiment_score, and keywords
    """
    # Simple sentiment analysis
    content_lower = content.lower()
    
    # Positive words
    positive_words = [
        'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
        'good', 'nice', 'helpful', 'love', 'appreciate', 'thank', 'thanks',
        'outstanding', 'brilliant', 'superb', 'perfect', 'best'
    ]
    
    # Negative words
    negative_words = [
        'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'hate',
        'disappointing', 'frustrated', 'annoyed', 'angry', 'useless', 'waste',
        'unfair', 'unprofessional', 'rude', 'slow', 'broken', 'issue', 'problem'
    ]
    
    positive_count = sum(1 for word in positive_words if word in content_lower)
    negative_count = sum(1 for word in negative_words if word in content_lower)
    
    # Determine sentiment
    if positive_count > negative_count:
        sentiment_label = 'positive'
        sentiment_score = min(1.0, 0.5 + (positive_count * 0.1))
    elif negative_count > positive_count:
        sentiment_label = 'negative'
        sentiment_score = max(0.0, 0.5 - (negative_count * 0.1))
    else:
        sentiment_label = 'neutral'
        sentiment_score = 0.5
    
    # Extract keywords
    keywords = extract_keywords(content, include_bigrams=True)
    # Limit to top 10 keywords
    keywords = keywords[:10]
    
    return {
        'sentiment_label': sentiment_label,
        'sentiment_score': sentiment_score,
        'keywords': keywords
    }


def compute_daily_aggregate(db: Session, target_date: date) -> Optional[DailyFeedbackAggregate]:
    """
    Compute and store daily feedback aggregate for a specific date
    
    Args:
        db: Database session
        target_date: Date to aggregate
    
    Returns:
        DailyFeedbackAggregate object
    """
    # Check if aggregate already exists
    existing = db.query(DailyFeedbackAggregate).filter(
        DailyFeedbackAggregate.date == target_date
    ).first()
    
    if existing:
        # Update existing
        aggregate = existing
    else:
        # Create new
        aggregate = DailyFeedbackAggregate(date=target_date)
    
    # Get all feedback for this date
    feedback_items = db.query(Feedback).filter(
        func.date(Feedback.created_at) == target_date
    ).all()
    
    if not feedback_items:
        # No feedback for this date
        aggregate.feedback_count = 0
        aggregate.sentiment_avg = 0.0
        aggregate.sentiment_positive_count = 0
        aggregate.sentiment_neutral_count = 0
        aggregate.sentiment_negative_count = 0
        aggregate.anonymous_count = 0
        aggregate.flagged_count = 0
        aggregate.department_breakdown = json.dumps({})
        aggregate.updated_at = datetime.utcnow()
        
        if not existing:
            db.add(aggregate)
        db.commit()
        db.refresh(aggregate)
        return aggregate
    
    # Calculate metrics
    aggregate.feedback_count = len(feedback_items)
    
    # Sentiment counts
    positive = sum(1 for f in feedback_items if f.sentiment_label and f.sentiment_label.value == 'positive')
    neutral = sum(1 for f in feedback_items if f.sentiment_label and f.sentiment_label.value == 'neutral')
    negative = sum(1 for f in feedback_items if f.sentiment_label and f.sentiment_label.value == 'negative')
    
    aggregate.sentiment_positive_count = positive
    aggregate.sentiment_neutral_count = neutral
    aggregate.sentiment_negative_count = negative
    
    # Average sentiment score
    total_score = sum(f.sentiment_score or 0.0 for f in feedback_items)
    aggregate.sentiment_avg = total_score / len(feedback_items) if feedback_items else 0.0
    
    # Anonymous count
    aggregate.anonymous_count = sum(1 for f in feedback_items if f.is_anonymous)
    
    # Flagged count (if exists)
    aggregate.flagged_count = sum(1 for f in feedback_items if getattr(f, 'is_flagged', False))
    
    # Department breakdown
    dept_counts = {}
    for f in feedback_items:
        # Get author's department
        if f.author_id:
            author = db.query(User).filter(User.id == f.author_id).first()
            if author and author.department:
                dept_name = author.department.name if hasattr(author.department, 'name') else str(author.department)
                dept_counts[dept_name] = dept_counts.get(dept_name, 0) + 1
    
    aggregate.department_breakdown = json.dumps(dept_counts)
    aggregate.updated_at = datetime.utcnow()
    
    if not existing:
        db.add(aggregate)
    
    db.commit()
    db.refresh(aggregate)
    
    return aggregate


def compute_aggregates_for_date_range(
    db: Session,
    start_date: date,
    end_date: date
) -> List[DailyFeedbackAggregate]:
    """
    Compute aggregates for a range of dates
    
    Args:
        db: Database session
        start_date: Start date
        end_date: End date
    
    Returns:
        List of DailyFeedbackAggregate objects
    """
    aggregates = []
    current_date = start_date
    
    while current_date <= end_date:
        agg = compute_daily_aggregate(db, current_date)
        if agg:
            aggregates.append(agg)
        current_date += timedelta(days=1)
    
    return aggregates


def update_keyword_tracking(
    db: Session,
    feedback: Feedback,
    sentiment: str,
    department: Optional[str] = None
):
    """
    Extract and track keywords from a feedback item
    
    Args:
        db: Database session
        feedback: Feedback object
        sentiment: Sentiment label
        department: Department context
    """
    if not feedback.content:
        return
    
    # Extract keywords
    keywords = extract_keywords(feedback.content, include_bigrams=True)
    
    today = date.today()
    
    for keyword in keywords:
        # Check if keyword already exists
        existing = db.query(FeedbackKeyword).filter(
            FeedbackKeyword.keyword == keyword,
            FeedbackKeyword.sentiment_context == sentiment,
            FeedbackKeyword.department == department
        ).first()
        
        if existing:
            # Update frequency and last seen
            existing.frequency += 1
            existing.last_seen = today
            existing.updated_at = datetime.utcnow()
        else:
            # Create new keyword entry
            new_keyword = FeedbackKeyword(
                keyword=keyword,
                frequency=1,
                sentiment_context=sentiment,
                department=department,
                first_seen=today,
                last_seen=today
            )
            db.add(new_keyword)
    
    db.commit()


def get_top_keywords_from_db(
    db: Session,
    window_days: int = 30,
    top_n: int = 20,
    sentiment: Optional[str] = None,
    department: Optional[str] = None
) -> List[Dict]:
    """
    Get top keywords from database within a time window
    
    Args:
        db: Database session
        window_days: Number of days to look back
        top_n: Number of top keywords to return
        sentiment: Optional sentiment filter
        department: Optional department filter
    
    Returns:
        List of keyword dicts with frequency and context
    """
    cutoff_date = date.today() - timedelta(days=window_days)
    
    query = db.query(FeedbackKeyword).filter(
        FeedbackKeyword.last_seen >= cutoff_date
    )
    
    if sentiment:
        query = query.filter(FeedbackKeyword.sentiment_context == sentiment)
    
    if department:
        query = query.filter(FeedbackKeyword.department == department)
    
    # Order by frequency
    keywords = query.order_by(FeedbackKeyword.frequency.desc()).limit(top_n).all()
    
    return [
        {
            "keyword": k.keyword,
            "frequency": k.frequency,
            "sentiment": k.sentiment_context,
            "department": k.department,
            "first_seen": str(k.first_seen),
            "last_seen": str(k.last_seen)
        }
        for k in keywords
    ]


def get_forecast_data(
    db: Session,
    metric: str = "feedback_count",
    window_days: int = 90,
    forecast_weeks: int = 4
) -> Dict:
    """
    Get forecast for a specific metric
    
    Args:
        db: Database session
        metric: Metric to forecast ('feedback_count' or 'sentiment_avg')
        window_days: Historical window in days
        forecast_weeks: Number of weeks to forecast
    
    Returns:
        Dict with historical and forecast data
    """
    cutoff_date = date.today() - timedelta(days=window_days)
    
    # Get daily aggregates
    aggregates = db.query(DailyFeedbackAggregate).filter(
        DailyFeedbackAggregate.date >= cutoff_date
    ).order_by(DailyFeedbackAggregate.date).all()
    
    if not aggregates:
        return {
            "historical": [],
            "forecast": [],
            "trend": simple_trend_analysis([]),
            "method": "none"
        }
    
    # Extract dates and values
    dates = [agg.date for agg in aggregates]
    
    if metric == "sentiment_avg":
        values = [agg.sentiment_avg for agg in aggregates]
    else:  # feedback_count
        values = [float(agg.feedback_count) for agg in aggregates]
    
    # Generate forecast
    forecast_result = forecast_with_confidence(
        dates,
        values,
        forecast_weeks,
        method="exponential"
    )
    
    # Add trend analysis
    forecast_result["trend"] = simple_trend_analysis(values)
    
    return forecast_result


def get_insights_summary(db: Session, window_days: int = 30) -> Dict:
    """
    Get comprehensive insights summary
    
    Args:
        db: Database session
        window_days: Number of days to analyze
    
    Returns:
        Dict with various insights metrics
    """
    cutoff_date = date.today() - timedelta(days=window_days)
    
    # Get aggregates
    aggregates = db.query(DailyFeedbackAggregate).filter(
        DailyFeedbackAggregate.date >= cutoff_date
    ).order_by(DailyFeedbackAggregate.date).all()
    
    if not aggregates:
        return {
            "total_feedback": 0,
            "avg_daily_feedback": 0.0,
            "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
            "avg_sentiment_score": 0.0,
            "anonymous_percentage": 0.0,
            "top_keywords": [],
            "trend": simple_trend_analysis([])
        }
    
    # Calculate metrics
    total_feedback = sum(agg.feedback_count for agg in aggregates)
    avg_daily = total_feedback / len(aggregates) if aggregates else 0
    
    total_positive = sum(agg.sentiment_positive_count for agg in aggregates)
    total_neutral = sum(agg.sentiment_neutral_count for agg in aggregates)
    total_negative = sum(agg.sentiment_negative_count for agg in aggregates)
    
    sentiment_scores = [agg.sentiment_avg for agg in aggregates if agg.sentiment_avg > 0]
    avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
    
    total_anonymous = sum(agg.anonymous_count for agg in aggregates)
    anonymous_pct = (total_anonymous / total_feedback * 100) if total_feedback > 0 else 0
    
    # Get top keywords
    top_keywords = get_top_keywords_from_db(db, window_days, top_n=20)
    
    # Trend
    feedback_counts = [agg.feedback_count for agg in aggregates]
    trend = simple_trend_analysis([float(c) for c in feedback_counts])
    
    return {
        "total_feedback": total_feedback,
        "avg_daily_feedback": round(avg_daily, 2),
        "sentiment_distribution": {
            "positive": total_positive,
            "neutral": total_neutral,
            "negative": total_negative
        },
        "avg_sentiment_score": round(avg_sentiment, 2),
        "anonymous_percentage": round(anonymous_pct, 2),
        "top_keywords": top_keywords,
        "trend": trend,
        "window_days": window_days
    }
