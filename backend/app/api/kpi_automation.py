"""
API endpoints for automated KPI calculations
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.services.kpi_calculator import KPICalculator, run_kpi_calculation_job
from app.models.performance import KpiSnapshot
from sqlalchemy import func, desc

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/kpis", tags=["kpi-automation"])


# Auth helper functions
def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to require admin role."""
    if not current_user.is_admin and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_manager(current_user: User = Depends(get_current_user)):
    """Dependency to require admin or manager role."""
    if not current_user.is_admin and current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or Admin access required"
        )
    return current_user


@router.post("/calculate")
async def trigger_kpi_calculation(
    background_tasks: BackgroundTasks,
    user_id: Optional[int] = Query(None, description="Calculate for specific user (None = all users)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Manually trigger KPI calculation job.
    Can be run by admins/managers or via automated cron.
    
    - **user_id**: Optional - calculate for specific user
    - If user_id is None, calculates for all users + company-wide metrics
    """
    try:
        # Run in background to avoid timeout
        background_tasks.add_task(run_kpi_calculation_job, db, user_id)
        
        return {
            "status": "started",
            "message": f"KPI calculation job started for {'user ' + str(user_id) if user_id else 'all users'}",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error triggering KPI calculation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calculate-now")
async def calculate_kpis_now(
    user_id: Optional[int] = Query(None),
    days: int = Query(90, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """
    Calculate KPIs immediately (synchronous).
    Use for testing or immediate results.
    """
    try:
        calculator = KPICalculator(db)
        
        if user_id:
            results = calculator.calculate_all_kpis(user_id=user_id, days=days)
        else:
            # Calculate company-wide
            results = calculator.calculate_company_wide_kpis(days=days)
        
        return {
            "status": "success",
            "kpis_calculated": len(results),
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": [
                {
                    "metric_name": kpi.kpi_name,
                    "value": float(kpi.value),
                    "unit": kpi.unit,
                    "recorded_at": kpi.snapshot_date.isoformat()
                }
                for kpi in results
            ]
        }
    except Exception as e:
        logger.error(f"Error calculating KPIs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/auto-calculated")
async def get_auto_calculated_kpis(
    user_id: Optional[int] = Query(None),
    days: int = Query(90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get automatically calculated KPIs with trends and insights.
    Returns latest value for each metric + historical data.
    """
    try:
        # If no user_id specified, use current user
        target_user_id = user_id if user_id else current_user.id
        
        # Get date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get all KPI snapshots for the user in the date range
        snapshots = db.query(KpiSnapshot).filter(
            KpiSnapshot.user_id == target_user_id,
            KpiSnapshot.snapshot_date >= start_date,
            KpiSnapshot.snapshot_date <= end_date
        ).order_by(KpiSnapshot.snapshot_date.desc()).all()
        
        # Group by metric name
        metrics_data = {}
        for snapshot in snapshots:
            metric_name = snapshot.kpi_name
            if metric_name not in metrics_data:
                metrics_data[metric_name] = {
                    "kpi_name": metric_name,
                    "current_value": float(snapshot.value),
                    "unit": snapshot.unit,
                    "data_points": [],
                    "last_updated": snapshot.snapshot_date.isoformat(),
                }
            
            metrics_data[metric_name]["data_points"].append({
                "date": snapshot.snapshot_date.isoformat(),
                "value": float(snapshot.value)
            })
        
        # Calculate trends
        for metric_name, data in metrics_data.items():
            data_points = data["data_points"]
            if len(data_points) >= 2:
                # Sort by date
                data_points_sorted = sorted(data_points, key=lambda x: x["date"])
                
                # Get recent trend (last 5 points)
                recent_points = data_points_sorted[-5:]
                if len(recent_points) >= 2:
                    recent_avg = sum(p["value"] for p in recent_points) / len(recent_points)
                    earlier_points = data_points_sorted[-10:-5] if len(data_points_sorted) >= 10 else data_points_sorted[:-5]
                    
                    if earlier_points:
                        earlier_avg = sum(p["value"] for p in earlier_points) / len(earlier_points)
                        
                        if earlier_avg != 0:
                            change_percent = ((recent_avg - earlier_avg) / earlier_avg) * 100
                        else:
                            change_percent = 0
                        
                        if abs(change_percent) < 5:
                            trend_direction = "stable"
                        elif change_percent > 0:
                            trend_direction = "up"
                        else:
                            trend_direction = "down"
                        
                        data["trend_direction"] = trend_direction
                        data["change_percent"] = round(change_percent, 1)
                        
                        # Generate insight
                        data["insight"] = generate_insight(
                            metric_name, 
                            data["current_value"],
                            change_percent,
                            trend_direction,
                            data["unit"]
                        )
        
        return {
            "user_id": target_user_id,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "days": days
            },
            "metrics": list(metrics_data.values()),
            "total_metrics": len(metrics_data),
            "last_calculation": max(
                (m["last_updated"] for m in metrics_data.values()),
                default=None
            )
        }
        
    except Exception as e:
        logger.error(f"Error fetching auto-calculated KPIs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_kpi_calculation_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get status of KPI calculations:
    - Last calculation time
    - Number of metrics tracked
    - Next scheduled calculation (if applicable)
    """
    try:
        # Get latest snapshot
        latest_snapshot = db.query(KpiSnapshot).order_by(
            desc(KpiSnapshot.snapshot_date)
        ).first()
        
        # Count unique metrics
        unique_metrics = db.query(
            func.count(func.distinct(KpiSnapshot.kpi_name))
        ).scalar()
        
        # Count total snapshots
        total_snapshots = db.query(func.count(KpiSnapshot.id)).scalar()
        
        # Get metrics list
        metrics = db.query(
            KpiSnapshot.kpi_name,
            func.count(KpiSnapshot.id).label('count'),
            func.max(KpiSnapshot.snapshot_date).label('last_updated')
        ).group_by(KpiSnapshot.kpi_name).all()
        
        return {
            "status": "operational",
            "last_calculation": latest_snapshot.snapshot_date.isoformat() if latest_snapshot else None,
            "total_metrics": unique_metrics or 0,
            "total_snapshots": total_snapshots or 0,
            "metrics_tracked": [
                {
                    "name": m.kpi_name,
                    "data_points": m.count,
                    "last_updated": m.last_updated.isoformat()
                }
                for m in metrics
            ],
            "auto_calculation_enabled": True,
            "calculation_frequency": "Every 6 hours",
        }
        
    except Exception as e:
        logger.error(f"Error getting KPI status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def generate_insight(
    metric_name: str,
    current_value: float,
    change_percent: float,
    trend: str,
    unit: str
) -> str:
    """Generate human-readable insights for KPI trends"""
    
    value_str = f"{current_value:.1f}{unit}"
    
    if trend == "up":
        if change_percent > 20:
            return f"📈 Excellent! {metric_name} improved significantly by {change_percent:+.1f}% to {value_str}"
        elif change_percent > 10:
            return f"↗️ {metric_name} improved by {change_percent:+.1f}% to {value_str}"
        else:
            return f"→ {metric_name} showing slight improvement at {value_str}"
    
    elif trend == "down":
        change_abs = abs(change_percent)
        if change_abs > 20:
            return f"⚠️ {metric_name} dropped significantly by {change_percent:.1f}% to {value_str}. Review needed."
        elif change_abs > 10:
            return f"↘️ {metric_name} declined by {change_percent:.1f}% to {value_str}"
        else:
            return f"→ {metric_name} showing slight decline at {value_str}"
    
    else:  # stable
        return f"➡️ {metric_name} remains stable at {value_str}"


@router.get("/insights/{metric_name}")
async def get_metric_insights(
    metric_name: str,
    user_id: Optional[int] = Query(None),
    days: int = Query(90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed insights and analysis for a specific metric.
    Includes:
    - Historical trend
    - Comparisons to team/company average
    - Recommendations
    """
    target_user_id = user_id if user_id else current_user.id
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get metric data
    snapshots = db.query(KpiSnapshot).filter(
        KpiSnapshot.user_id == target_user_id,
        KpiSnapshot.kpi_name == metric_name,
        KpiSnapshot.snapshot_date >= start_date
    ).order_by(KpiSnapshot.snapshot_date.asc()).all()
    
    if not snapshots:
        raise HTTPException(status_code=404, detail=f"No data found for metric: {metric_name}")
    
    # Calculate statistics
    values = [float(s.value) for s in snapshots]
    current = values[-1]
    avg = sum(values) / len(values)
    min_val = min(values)
    max_val = max(values)
    
    # Calculate trend
    if len(values) >= 2:
        change = current - values[0]
        change_percent = (change / values[0] * 100) if values[0] != 0 else 0
    else:
        change = 0
        change_percent = 0
    
    return {
        "metric_name": metric_name,
        "user_id": target_user_id,
        "current_value": current,
        "statistics": {
            "average": round(avg, 2),
            "minimum": round(min_val, 2),
            "maximum": round(max_val, 2),
            "change_from_start": round(change, 2),
            "change_percent": round(change_percent, 2),
        },
        "data_points": len(snapshots),
        "historical_data": [
            {
                "date": s.snapshot_date.isoformat(),
                "value": float(s.value),
                "notes": s.notes
            }
            for s in snapshots
        ],
        "recommendations": generate_recommendations(metric_name, current, avg, change_percent)
    }


def generate_recommendations(
    metric_name: str,
    current: float,
    average: float,
    change_percent: float
) -> list:
    """Generate actionable recommendations based on metric performance"""
    recommendations = []
    
    if "completion" in metric_name.lower() or "delivery" in metric_name.lower():
        if current < 70:
            recommendations.append("Consider breaking down large tasks into smaller, manageable units")
            recommendations.append("Review task priorities and deadlines with your manager")
        elif current > 90:
            recommendations.append("Excellent performance! Share your workflow with the team")
    
    if "productivity" in metric_name.lower():
        if current < 60:
            recommendations.append("Review your time tracking patterns for optimization opportunities")
            recommendations.append("Consider using the Pomodoro technique for better focus")
        elif current > 85:
            recommendations.append("Great productivity! Document your methods for team sharing")
    
    if change_percent < -10:
        recommendations.append(f"{metric_name} has declined. Schedule a 1-on-1 with your manager to discuss support needs")
    
    if not recommendations:
        recommendations.append("Keep up the good work! Continue monitoring this metric for sustained performance")
    
    return recommendations

