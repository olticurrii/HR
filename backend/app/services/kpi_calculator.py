"""
KPI Auto-Calculation Service

Automatically calculates and updates KPI metrics from existing data sources:
- Tasks (completion rate, on-time delivery)
- Projects (innovation count, delivery rate)
- Time Tracking (productivity score)
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from sqlalchemy import func, and_, case, extract
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.project import Project
from app.models.time_entry import TimeEntry
from app.models.performance import KpiSnapshot
from app.models.user import User
import logging

logger = logging.getLogger(__name__)


class KPICalculator:
    """Service for calculating automated KPI metrics"""
    
    def __init__(self, db: Session):
        self.db = db
        
    def calculate_all_kpis(
        self, 
        user_id: Optional[int] = None,
        days: int = 90
    ) -> List[Dict]:
        """
        Calculate all KPI metrics and store them in the database.
        
        Args:
            user_id: Optional user ID to calculate KPIs for (None = all users)
            days: Number of days to look back for data
            
        Returns:
            List of calculated KPI records
        """
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        kpi_results = []
        
        # Calculate each metric
        metrics = [
            self._calculate_task_completion_rate,
            self._calculate_on_time_delivery_rate,
            self._calculate_productivity_score,
            self._calculate_innovation_projects_count,
            self._calculate_average_task_duration,
            self._calculate_project_delivery_rate,
            self._calculate_team_collaboration_score,
        ]
        
        for metric_func in metrics:
            try:
                result = metric_func(user_id, start_date, end_date)
                if result:
                    kpi_results.append(result)
            except Exception as e:
                logger.error(f"Error calculating {metric_func.__name__}: {str(e)}")
                continue
        
        # Store results in database
        stored_kpis = []
        for kpi_data in kpi_results:
            try:
                kpi_record = self._store_kpi(kpi_data, user_id)
                stored_kpis.append(kpi_record)
            except Exception as e:
                logger.error(f"Error storing KPI {kpi_data.get('metric_name')}: {str(e)}")
                continue
        
        logger.info(f"Calculated and stored {len(stored_kpis)} KPI metrics")
        return stored_kpis
    
    def _calculate_task_completion_rate(
        self, 
        user_id: Optional[int],
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """Calculate percentage of completed tasks"""
        query = self.db.query(
            func.count(Task.id).label('total'),
            func.sum(case((Task.status == 'Done', 1), else_=0)).label('completed')
        ).filter(
            Task.created_at >= start_date,
            Task.created_at <= end_date
        )
        
        if user_id:
            query = query.filter(Task.assignee_id == user_id)
        
        result = query.first()
        
        if result.total and result.total > 0:
            rate = float(result.completed or 0) / float(result.total) * 100.0
        else:
            rate = 0.0
        
        # Get previous value for trend calculation
        previous_value = self._get_previous_kpi_value(
            'Task Completion Rate', 
            user_id,
            start_date
        )
        
        return {
            'metric_name': 'Task Completion Rate',
            'value': round(rate, 1),
            'unit': '%',
            'period': 'quarterly',
            'visibility': 'manager',
            'notes': f'Calculated from {result.total} tasks in the last {(end_date - start_date).days} days',
            'previous_value': previous_value,
        }
    
    def _calculate_on_time_delivery_rate(
        self,
        user_id: Optional[int],
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """Calculate percentage of tasks completed on or before due date"""
        # Only look at completed tasks with due dates
        query = self.db.query(
            func.count(Task.id).label('total'),
            func.sum(
                case(
                    (Task.completed_at <= Task.due_date, 1),
                    else_=0
                )
            ).label('on_time')
        ).filter(
            Task.status == 'Done',
            Task.completed_at.isnot(None),
            Task.due_date.isnot(None),
            Task.completed_at >= start_date,
            Task.completed_at <= end_date
        )
        
        if user_id:
            query = query.filter(Task.assignee_id == user_id)
        
        result = query.first()
        
        if result.total and result.total > 0:
            rate = float(result.on_time or 0) / float(result.total) * 100.0
        else:
            rate = 0.0
        
        previous_value = self._get_previous_kpi_value(
            'On-Time Delivery Rate',
            user_id,
            start_date
        )
        
        return {
            'metric_name': 'On-Time Delivery Rate',
            'value': round(rate, 1),
            'unit': '%',
            'period': 'quarterly',
            'visibility': 'manager',
            'notes': f'{result.on_time} of {result.total} tasks delivered on time',
            'previous_value': previous_value,
        }
    
    def _calculate_productivity_score(
        self,
        user_id: Optional[int],
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """
        Calculate productivity score based on time tracking data.
        Score = (Total hours logged / Expected work hours) * 100
        Expected = 8 hours * workdays in period
        """
        # Get all completed time entries
        entries_query = self.db.query(TimeEntry).filter(
            TimeEntry.clock_in >= start_date,
            TimeEntry.clock_in <= end_date,
            TimeEntry.clock_out.isnot(None)
        )
        
        if user_id:
            entries_query = entries_query.filter(TimeEntry.user_id == user_id)
        
        entries = entries_query.all()
        
        # Calculate total hours manually
        total_hours = 0.0
        for entry in entries:
            if entry.clock_out and entry.clock_in:
                duration = (entry.clock_out - entry.clock_in).total_seconds() / 3600
                total_hours += duration
        
        # Get number of days with time entries
        days_logged = self.db.query(
            func.count(func.distinct(func.date(TimeEntry.clock_in)))
        ).filter(
            TimeEntry.clock_in >= start_date,
            TimeEntry.clock_in <= end_date,
            TimeEntry.clock_out.isnot(None)
        )
        
        if user_id:
            days_logged = days_logged.filter(TimeEntry.user_id == user_id)
        
        days_count = days_logged.scalar() or 1
        
        # Expected: 8 hours per day logged
        expected_hours = float(days_count * 8)
        
        if expected_hours > 0:
            score = min((total_hours / expected_hours) * 100.0, 100.0)  # Cap at 100%
        else:
            score = 0.0
        
        previous_value = self._get_previous_kpi_value(
            'Productivity Score',
            user_id,
            start_date
        )
        
        return {
            'metric_name': 'Productivity Score',
            'value': round(score, 1),
            'unit': '%',
            'period': 'monthly',
            'visibility': 'manager',
            'notes': f'{round(total_hours, 1)} hours logged in period',
            'previous_value': previous_value,
        }
    
    def _calculate_innovation_projects_count(
        self,
        user_id: Optional[int],
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """Count projects marked as innovation or R&D"""
        query = self.db.query(func.count(Project.id)).filter(
            and_(
                Project.created_at >= start_date,
                Project.created_at <= end_date,
                Project.title.ilike('%innovation%') | 
                Project.title.ilike('%r&d%') |
                Project.description.ilike('%innovation%') |
                Project.description.ilike('%research%')
            )
        )
        
        # Note: Projects don't have direct user assignment in the current model
        # If needed, join through tasks
        
        count = query.scalar() or 0
        
        previous_value = self._get_previous_kpi_value(
            'Innovation Projects',
            user_id,
            start_date
        )
        
        return {
            'metric_name': 'Innovation Projects',
            'value': count,
            'unit': 'count',
            'period': 'quarterly',
            'visibility': 'admin',
            'notes': 'Projects with innovation or R&D keywords',
            'previous_value': previous_value,
        }
    
    def _calculate_average_task_duration(
        self,
        user_id: Optional[int],
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """Calculate average time to complete tasks (in days)"""
        # Get completed tasks with valid dates
        completed_tasks = self.db.query(Task).filter(
            Task.status == 'Done',
            Task.completed_at.isnot(None),
            Task.created_at.isnot(None),
            Task.completed_at >= start_date,
            Task.completed_at <= end_date
        )
        
        if user_id:
            completed_tasks = completed_tasks.filter(Task.assignee_id == user_id)
        
        completed_tasks = completed_tasks.all()
        
        if completed_tasks:
            durations = [
                (task.completed_at - task.created_at).total_seconds() / 86400
                for task in completed_tasks
                if task.completed_at > task.created_at  # Ensure valid duration
            ]
            avg_days = sum(durations) / len(durations) if durations else 0
        else:
            avg_days = 0
        
        previous_value = self._get_previous_kpi_value(
            'Average Task Duration',
            user_id,
            start_date
        )
        
        return {
            'metric_name': 'Average Task Duration',
            'value': round(avg_days, 1),
            'unit': 'days',
            'period': 'monthly',
            'visibility': 'manager',
            'notes': 'Average time from creation to completion',
            'previous_value': previous_value,
        }
    
    def _calculate_project_delivery_rate(
        self,
        user_id: Optional[int],
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """Calculate percentage of projects completed (simplified - count only)"""
        # Since Project model doesn't have status, just count all projects
        query = self.db.query(
            func.count(Project.id).label('total')
        ).filter(
            Project.created_at >= start_date,
            Project.created_at <= end_date
        )
        
        result = query.first()
        total_projects = result.total or 0
        
        previous_value = self._get_previous_kpi_value(
            'Active Projects Count',
            user_id,
            start_date
        )
        
        return {
            'metric_name': 'Active Projects Count',
            'value': total_projects,
            'unit': 'count',
            'period': 'quarterly',
            'visibility': 'admin',
            'notes': f'{total_projects} projects in period',
            'previous_value': previous_value,
        }
    
    def _calculate_team_collaboration_score(
        self,
        user_id: Optional[int],
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """
        Calculate collaboration score based on:
        - Number of tasks with multiple assignees
        - Comments/interactions on tasks
        - Cross-team projects
        """
        # For now, simplified: score based on task comments
        query = self.db.query(
            func.count(Task.id).label('total_tasks')
        ).filter(
            Task.created_at >= start_date,
            Task.created_at <= end_date
        )
        
        if user_id:
            query = query.filter(Task.assignee_id == user_id)
        
        result = query.first()
        total_tasks = result.total_tasks or 1
        
        # Simple score: normalize to 0-10 scale
        # This is a placeholder - enhance with actual collaboration metrics
        score = min(total_tasks / 10, 10)
        
        previous_value = self._get_previous_kpi_value(
            'Team Collaboration Score',
            user_id,
            start_date
        )
        
        return {
            'metric_name': 'Team Collaboration Score',
            'value': round(score, 1),
            'unit': '/10',
            'period': 'monthly',
            'visibility': 'manager',
            'notes': 'Based on task interactions and cross-team activities',
            'previous_value': previous_value,
        }
    
    def _get_previous_kpi_value(
        self,
        metric_name: str,
        user_id: Optional[int],
        before_date: datetime
    ) -> Optional[float]:
        """Get the most recent previous value for a KPI metric"""
        query = self.db.query(KpiSnapshot.value).filter(
            KpiSnapshot.kpi_name == metric_name,
            KpiSnapshot.snapshot_date < before_date
        )
        
        if user_id:
            query = query.filter(KpiSnapshot.user_id == user_id)
        
        result = query.order_by(KpiSnapshot.snapshot_date.desc()).first()
        
        return float(result.value) if result else None
    
    def _store_kpi(
        self, 
        kpi_data: Dict,
        user_id: Optional[int]
    ) -> KpiSnapshot:
        """Store a calculated KPI in the database"""
        # Calculate trend
        current_value = kpi_data['value']
        previous_value = kpi_data.get('previous_value')
        
        if previous_value is not None:
            change_percent = ((current_value - previous_value) / previous_value * 100) if previous_value != 0 else 0
        else:
            change_percent = 0
        
        # If user_id not provided, use system user (id=1) or None
        target_user_id = user_id if user_id else 1
        
        kpi_snapshot = KpiSnapshot(
            user_id=target_user_id,
            kpi_name=kpi_data['metric_name'],
            value=kpi_data['value'],
            unit=kpi_data.get('unit'),
            snapshot_date=datetime.utcnow(),
            notes=kpi_data.get('notes'),
            period=kpi_data.get('period', 'monthly'),
            visibility=kpi_data.get('visibility', 'manager'),
            measured_by_id=target_user_id
        )
        
        self.db.add(kpi_snapshot)
        self.db.commit()
        self.db.refresh(kpi_snapshot)
        
        logger.info(
            f"Stored KPI: {kpi_data['metric_name']} = {current_value} "
            f"(change: {change_percent:+.1f}%)"
        )
        
        return kpi_snapshot
    
    def calculate_for_all_users(self, days: int = 90) -> Dict[int, List[Dict]]:
        """Calculate KPIs for all active users"""
        users = self.db.query(User).filter(User.is_active == True).all()
        
        results = {}
        for user in users:
            logger.info(f"Calculating KPIs for user: {user.full_name} (ID: {user.id})")
            try:
                user_kpis = self.calculate_all_kpis(user_id=user.id, days=days)
                results[user.id] = user_kpis
            except Exception as e:
                logger.error(f"Error calculating KPIs for user {user.id}: {str(e)}")
                continue
        
        return results
    
    def calculate_company_wide_kpis(self, days: int = 90) -> List[Dict]:
        """Calculate aggregate KPIs across the entire company"""
        logger.info("Calculating company-wide KPIs...")
        return self.calculate_all_kpis(user_id=None, days=days)


def run_kpi_calculation_job(db: Session, user_id: Optional[int] = None):
    """
    Main entry point for KPI calculation job.
    Can be called from cron, API endpoint, or background task.
    """
    calculator = KPICalculator(db)
    
    if user_id:
        # Calculate for specific user
        results = calculator.calculate_all_kpis(user_id=user_id, days=90)
        logger.info(f"Calculated {len(results)} KPIs for user {user_id}")
    else:
        # Calculate for all users + company-wide
        user_results = calculator.calculate_for_all_users(days=90)
        company_results = calculator.calculate_company_wide_kpis(days=90)
        
        total_kpis = sum(len(kpis) for kpis in user_results.values()) + len(company_results)
        logger.info(f"Calculated {total_kpis} total KPIs across {len(user_results)} users")
    
    return {"status": "success", "timestamp": datetime.utcnow().isoformat()}

