"""
Admin Insights API Endpoints
Keyword tracking, forecasting, and analytics
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from datetime import date, timedelta

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.services.insights_service import (
    get_top_keywords_from_db,
    get_forecast_data,
    get_insights_summary,
    compute_daily_aggregate,
    compute_aggregates_for_date_range
)

router = APIRouter(prefix="/admin/insights", tags=["Admin Insights"])


def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user is admin"""
    if current_user.role not in ["admin", "Admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/keywords")
async def get_keywords(
    window: int = Query(30, description="Days to look back"),
    top_n: int = Query(20, description="Number of top keywords"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    department: Optional[str] = Query(None, description="Filter by department"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get top keywords from feedback within a time window
    
    Query params:
    - window: Number of days to analyze (default 30)
    - top_n: Number of top keywords to return (default 20)
    - sentiment: Optional filter by sentiment (positive/negative/neutral)
    - department: Optional filter by department
    
    Returns:
    - List of keywords with frequency and context
    """
    try:
        keywords = get_top_keywords_from_db(
            db,
            window_days=window,
            top_n=top_n,
            sentiment=sentiment,
            department=department
        )
        
        return {
            "keywords": keywords,
            "window_days": window,
            "total_keywords": len(keywords),
            "filters": {
                "sentiment": sentiment,
                "department": department
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve keywords: {str(e)}")


@router.get("/forecast")
async def get_forecast(
    metric: str = Query("feedback_count", description="Metric to forecast"),
    window: int = Query(90, description="Historical window in days"),
    weeks: int = Query(4, description="Weeks to forecast"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get forecast for feedback metrics
    
    Query params:
    - metric: Metric to forecast ('feedback_count' or 'sentiment_avg')
    - window: Historical window in days (default 90)
    - weeks: Number of weeks to forecast (default 4)
    
    Returns:
    - Historical data, forecast with confidence intervals, and trend analysis
    """
    if metric not in ["feedback_count", "sentiment_avg"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid metric. Must be 'feedback_count' or 'sentiment_avg'"
        )
    
    try:
        forecast_data = get_forecast_data(
            db,
            metric=metric,
            window_days=window,
            forecast_weeks=weeks
        )
        
        return {
            "metric": metric,
            "window_days": window,
            "forecast_weeks": weeks,
            **forecast_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate forecast: {str(e)}")


@router.get("/summary")
async def get_summary(
    window: int = Query(30, description="Days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get comprehensive insights summary
    
    Query params:
    - window: Number of days to analyze (default 30)
    
    Returns:
    - Total feedback count, averages, sentiment distribution, top keywords, trends
    """
    try:
        summary = get_insights_summary(db, window_days=window)
        return summary
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


@router.post("/compute-aggregates")
async def compute_aggregates(
    days_back: int = Query(30, description="Days to compute"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Manually trigger computation of daily aggregates
    
    Query params:
    - days_back: Number of days to compute (default 30)
    
    Returns:
    - Number of aggregates computed
    """
    try:
        end_date = date.today()
        start_date = end_date - timedelta(days=days_back)
        
        aggregates = compute_aggregates_for_date_range(db, start_date, end_date)
        
        return {
            "message": "Aggregates computed successfully",
            "start_date": str(start_date),
            "end_date": str(end_date),
            "count": len(aggregates)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute aggregates: {str(e)}")


@router.get("/keywords/by-sentiment")
async def get_keywords_by_sentiment(
    window: int = Query(30, description="Days to look back"),
    top_n: int = Query(10, description="Top keywords per sentiment"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get top keywords categorized by sentiment
    
    Returns:
    - Keywords grouped by positive, negative, and neutral sentiment
    """
    try:
        positive_keywords = get_top_keywords_from_db(
            db, window_days=window, top_n=top_n, sentiment="positive"
        )
        negative_keywords = get_top_keywords_from_db(
            db, window_days=window, top_n=top_n, sentiment="negative"
        )
        neutral_keywords = get_top_keywords_from_db(
            db, window_days=window, top_n=top_n, sentiment="neutral"
        )
        
        return {
            "window_days": window,
            "positive": positive_keywords,
            "negative": negative_keywords,
            "neutral": neutral_keywords
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to categorize keywords: {str(e)}")


@router.get("/keywords/by-department")
async def get_keywords_by_department(
    window: int = Query(30, description="Days to look back"),
    top_n: int = Query(10, description="Top keywords per department"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get top keywords categorized by department
    
    Returns:
    - Keywords grouped by department
    """
    try:
        # Get unique departments from keywords
        from app.models.insights import FeedbackKeyword
        from sqlalchemy import distinct
        
        cutoff_date = date.today() - timedelta(days=window)
        
        departments = db.query(distinct(FeedbackKeyword.department)).filter(
            FeedbackKeyword.last_seen >= cutoff_date,
            FeedbackKeyword.department.isnot(None)
        ).all()
        
        result = {}
        for (dept,) in departments:
            if dept:
                dept_keywords = get_top_keywords_from_db(
                    db, window_days=window, top_n=top_n, department=dept
                )
                result[dept] = dept_keywords
        
        return {
            "window_days": window,
            "departments": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to categorize by department: {str(e)}")

