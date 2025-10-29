from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, SessionLocal
from app.core.config import settings as config_settings
from app.models import Base
from app.api import auth, users, departments, tasks, projects, project_tasks, chat, comments, orgchart, employee_profile, time_tracking, admin, permissions, roles, leave, feedback, settings, profile, search, performance, notifications, insights, kpi_automation, office_booking
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
try:
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully!")
    
    # Create default admin user if database is empty
    try:
        from app.models.user import User
        from app.core.security import get_password_hash
        
        db = SessionLocal()
        user_count = db.query(User).count()
        
        if user_count == 0:
            logger.info("Creating default admin user...")
            admin_user = User(
                email="admin@company.com",
                full_name="Admin User",
                hashed_password=get_password_hash("password123"),
                is_admin=True,
                is_active=True,
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            logger.info("Default admin user created: admin@company.com / password123")
        db.close()
    except Exception as e:
        logger.warning(f"Could not create default admin user: {e}")
        
except Exception as e:
    logger.error(f"Error creating database tables: {e}")
    raise

app = FastAPI(
    title="HR Management System",
    description="A comprehensive HR management system with real-time chat",
    version="1.0.0"
)

# Get allowed origins from environment or use defaults
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

# Log the origins for debugging
logger.info(f"CORS allowed origins: {allowed_origins}")

# If no valid origins found, use localhost as fallback
if not allowed_origins:
    allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]
    logger.warning("No ALLOWED_ORIGINS found, using localhost fallback")

# CORS middleware - Must be added before routes and other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add exception handler to ensure CORS headers are included in error responses
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Initialize KPI background scheduler on startup
@app.on_event("startup")
async def startup_event():
    """Initialize background services on application startup"""
    try:
        from app.services.kpi_scheduler import start_kpi_scheduler
        start_kpi_scheduler()
        logger.info("✅ Background services initialized successfully")
    except Exception as e:
        logger.error(f"❌ Error starting background services: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup background services on application shutdown"""
    try:
        from app.services.kpi_scheduler import stop_kpi_scheduler
        stop_kpi_scheduler()
        logger.info("✅ Background services stopped successfully")
    except Exception as e:
        logger.error(f"❌ Error stopping background services: {e}")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(departments.router, prefix="/api/v1/departments", tags=["Departments"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(project_tasks.router, prefix="/api/v1/projects", tags=["Project Tasks"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(comments.router, prefix="/api/v1", tags=["Comments"])
app.include_router(orgchart.router, prefix="/api/v1", tags=["Org Chart"])
app.include_router(employee_profile.router, tags=["Employee Profile"])
app.include_router(time_tracking.router, prefix="/api/v1/time", tags=["Time Tracking"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(permissions.router, prefix="/api/v1/admin", tags=["Permissions"])
app.include_router(roles.router, prefix="/api/v1/admin", tags=["Roles"])
app.include_router(leave.router, prefix="/api/v1/leave", tags=["Leave Management"])
app.include_router(feedback.router, prefix="/api/v1", tags=["Feedback"])
app.include_router(settings.router, prefix="/api/v1", tags=["Settings"])
app.include_router(profile.router, prefix="/api/v1", tags=["Profile"])
app.include_router(search.router, prefix="/api/v1", tags=["Search"])
app.include_router(performance.router, prefix="/api/v1", tags=["Performance"])
app.include_router(kpi_automation.router, tags=["KPI Automation"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(insights.router, prefix="/api/v1", tags=["Insights"])
app.include_router(office_booking.router, prefix="/api/v1/office-booking", tags=["Office Booking"])

# Mount static files for avatar uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
async def root():
    return {"message": "HR Management System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
