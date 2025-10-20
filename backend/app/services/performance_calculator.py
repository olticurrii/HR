"""Calculate performance metrics from tasks and projects"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, timedelta
from typing import Dict, List
from app.models.user import User
from app.models.task import Task
from app.models.project import Project


class PerformanceCalculator:
    """Calculate real-time performance metrics from tasks and projects"""
    
    @staticmethod
    def calculate_task_metrics(user_id: int, db: Session, days: int = 30) -> Dict:
        """Calculate task performance metrics for a user over the last N days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get all tasks assigned to user in the period
        tasks = db.query(Task).filter(
            and_(
                Task.assignee_id == user_id,
                Task.created_at >= cutoff_date
            )
        ).all()
        
        total_tasks = len(tasks)
        if total_tasks == 0:
            return {
                "total_tasks": 0,
                "completed": 0,
                "in_progress": 0,
                "pending": 0,
                "completion_rate": 0.0,
                "on_time_completion_rate": 0.0,
                "overdue": 0
            }
        
        completed_tasks = [t for t in tasks if t.status.lower() in ['completed', 'done']]
        in_progress_tasks = [t for t in tasks if t.status.lower() in ['in_progress', 'in progress']]
        pending_tasks = [t for t in tasks if t.status.lower() in ['open', 'pending', 'todo']]
        
        # Check overdue
        now = datetime.utcnow()
        overdue_tasks = [
            t for t in tasks 
            if t.due_date and t.due_date < now and t.status.lower() not in ['completed', 'done']
        ]
        
        # Check on-time completion
        on_time_completed = [
            t for t in completed_tasks
            if not t.due_date or t.updated_at <= t.due_date
        ]
        
        completion_rate = (len(completed_tasks) / total_tasks) * 100 if total_tasks > 0 else 0
        on_time_rate = (len(on_time_completed) / len(completed_tasks)) * 100 if completed_tasks else 0
        
        return {
            "total_tasks": total_tasks,
            "completed": len(completed_tasks),
            "in_progress": len(in_progress_tasks),
            "pending": len(pending_tasks),
            "completion_rate": round(completion_rate, 1),
            "on_time_completion_rate": round(on_time_rate, 1),
            "overdue": len(overdue_tasks)
        }
    
    @staticmethod
    def calculate_project_metrics(user_id: int, db: Session) -> Dict:
        """Calculate project performance metrics for a user"""
        # Get projects where user is creator or has tasks assigned
        user_projects = db.query(Project).filter(
            Project.created_by == user_id
        ).all()
        
        # Also get projects where user has tasks
        projects_with_tasks = db.query(Project).join(Task).filter(
            Task.assignee_id == user_id
        ).distinct().all()
        
        all_projects = list(set(user_projects + projects_with_tasks))
        
        total_projects = len(all_projects)
        if total_projects == 0:
            return {
                "total_projects": 0,
                "active": 0,
                "completed": 0,
                "involvement_score": 0
            }
        
        # Note: Project model doesn't have status field, so we can't filter by status
        # Instead, count all projects and check their tasks
        completed_projects = []
        active_projects = []
        
        for p in all_projects:
            # Check if all project tasks are completed
            project_tasks = [t for t in p.tasks]
            if project_tasks:
                completed_tasks = [t for t in project_tasks if t.status.lower() in ['done', 'completed']]
                if len(completed_tasks) == len(project_tasks):
                    completed_projects.append(p)
                else:
                    active_projects.append(p)
            else:
                # No tasks yet, consider active
                active_projects.append(p)
        
        # Calculate involvement score based on tasks in projects
        involvement_tasks = db.query(Task).filter(
            and_(
                Task.assignee_id == user_id,
                Task.project_id.isnot(None)
            )
        ).count()
        
        return {
            "total_projects": total_projects,
            "active": len(active_projects),
            "completed": len(completed_projects),
            "involvement_score": involvement_tasks
        }
    
    @staticmethod
    def calculate_overall_performance_score(user_id: int, db: Session) -> float:
        """Calculate an overall performance score (0-100) based on tasks and projects"""
        task_metrics = PerformanceCalculator.calculate_task_metrics(user_id, db, days=90)
        project_metrics = PerformanceCalculator.calculate_project_metrics(user_id, db)
        
        # Weighted score calculation
        # 60% from task completion rate
        # 20% from on-time completion rate
        # 20% from project involvement
        
        task_score = task_metrics["completion_rate"] * 0.6
        on_time_score = task_metrics["on_time_completion_rate"] * 0.2
        
        # Project score: normalize involvement
        project_score = min(20, project_metrics["involvement_score"] * 2)  # Cap at 20
        
        total_score = task_score + on_time_score + project_score
        
        return round(min(100, total_score), 1)
    
    @staticmethod
    def get_performance_insights(user_id: int, db: Session) -> List[Dict]:
        """Generate performance insights and recommendations"""
        task_metrics = PerformanceCalculator.calculate_task_metrics(user_id, db, days=30)
        insights = []
        
        # Insight 1: Completion rate
        if task_metrics["completion_rate"] >= 80:
            insights.append({
                "type": "positive",
                "title": "Excellent Task Completion",
                "message": f"You've completed {task_metrics['completion_rate']}% of your tasks this month. Great job!"
            })
        elif task_metrics["completion_rate"] >= 50:
            insights.append({
                "type": "neutral",
                "title": "Good Progress",
                "message": f"You've completed {task_metrics['completion_rate']}% of tasks. Keep pushing to reach 80%!"
            })
        else:
            insights.append({
                "type": "warning",
                "title": "Completion Rate Needs Attention",
                "message": f"Only {task_metrics['completion_rate']}% of tasks completed. Consider prioritizing your workload."
            })
        
        # Insight 2: Overdue tasks
        if task_metrics["overdue"] > 0:
            insights.append({
                "type": "warning",
                "title": "Overdue Tasks",
                "message": f"You have {task_metrics['overdue']} overdue task(s). Consider addressing these first."
            })
        
        # Insight 3: On-time completion
        if task_metrics["on_time_completion_rate"] >= 90:
            insights.append({
                "type": "positive",
                "title": "Excellent Time Management",
                "message": f"{task_metrics['on_time_completion_rate']}% of tasks completed on time!"
            })
        elif task_metrics["on_time_completion_rate"] < 70 and task_metrics["completed"] > 0:
            insights.append({
                "type": "neutral",
                "title": "Time Management Opportunity",
                "message": f"Consider planning buffer time - {task_metrics['on_time_completion_rate']}% on-time completion rate."
            })
        
        return insights


def link_task_to_objective(task_id: int, objective_id: int, db: Session) -> bool:
    """Link a task to an objective"""
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if task:
            task.objective_id = objective_id
            db.commit()
            return True
        return False
    except Exception as e:
        db.rollback()
        print(f"Error linking task to objective: {e}")
        return False


def auto_update_objective_from_tasks(objective_id: int, db: Session):
    """Auto-update objective progress based on linked tasks"""
    from app.models.performance import PerformanceObjective
    
    objective = db.query(PerformanceObjective).filter(
        PerformanceObjective.id == objective_id
    ).first()
    
    if not objective:
        return
    
    # Get all tasks linked to this objective
    linked_tasks = db.query(Task).filter(Task.objective_id == objective_id).all()
    
    if not linked_tasks:
        return
    
    # Calculate progress from tasks
    total_tasks = len(linked_tasks)
    completed_tasks = sum(1 for t in linked_tasks if t.status.lower() in ['completed', 'done'])
    
    progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    
    # Update objective progress
    objective.progress = round(progress, 2)
    objective.updated_at = datetime.utcnow()
    
    db.commit()

