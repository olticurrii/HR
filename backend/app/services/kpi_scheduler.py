"""
Background scheduler for automated KPI calculations.
Runs KPI calculation jobs on a scheduled basis (every 6 hours by default).
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.kpi_calculator import run_kpi_calculation_job
import logging

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None


def kpi_calculation_job():
    """
    Background job that runs KPI calculations.
    This function will be called by the scheduler.
    """
    logger.info("=" * 60)
    logger.info(f"Starting scheduled KPI calculation job at {datetime.utcnow().isoformat()}")
    logger.info("=" * 60)
    
    db: Session = SessionLocal()
    try:
        result = run_kpi_calculation_job(db, user_id=None)
        logger.info(f"✅ KPI calculation job completed successfully: {result}")
    except Exception as e:
        logger.error(f"❌ KPI calculation job failed: {str(e)}", exc_info=True)
    finally:
        db.close()
    
    logger.info("=" * 60)


def start_kpi_scheduler():
    """
    Start the background scheduler for KPI calculations.
    Runs every 6 hours by default.
    """
    global scheduler
    
    if scheduler is not None and scheduler.running:
        logger.warning("KPI scheduler is already running")
        return
    
    scheduler = BackgroundScheduler()
    
    # Schedule KPI calculation every 6 hours
    # Using cron: at 00:00, 06:00, 12:00, 18:00
    scheduler.add_job(
        kpi_calculation_job,
        trigger=CronTrigger(hour='0,6,12,18', minute=0),
        id='kpi_calculation',
        name='Automated KPI Calculation',
        replace_existing=True,
        misfire_grace_time=3600  # Allow 1 hour grace period if job misses scheduled time
    )
    
    # Optionally: Run immediately on startup (commented out by default)
    # scheduler.add_job(
    #     kpi_calculation_job,
    #     'date',
    #     run_date=datetime.now(),
    #     id='kpi_calculation_startup',
    #     name='Initial KPI Calculation on Startup'
    # )
    
    scheduler.start()
    logger.info("✅ KPI scheduler started successfully")
    logger.info(f"📅 Next KPI calculation scheduled at: {scheduler.get_job('kpi_calculation').next_run_time}")
    
    return scheduler


def stop_kpi_scheduler():
    """
    Stop the KPI scheduler.
    """
    global scheduler
    
    if scheduler and scheduler.running:
        scheduler.shutdown()
        logger.info("KPI scheduler stopped")
    else:
        logger.warning("KPI scheduler was not running")


def get_scheduler_status():
    """
    Get the current status of the KPI scheduler.
    """
    global scheduler
    
    if scheduler is None:
        return {
            "status": "not_initialized",
            "running": False,
            "jobs": []
        }
    
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger)
        })
    
    return {
        "status": "running" if scheduler.running else "stopped",
        "running": scheduler.running,
        "jobs": jobs
    }


def trigger_manual_calculation():
    """
    Manually trigger KPI calculation outside of schedule.
    Useful for testing or immediate updates.
    """
    logger.info("Manual KPI calculation triggered")
    kpi_calculation_job()

