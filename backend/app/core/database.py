from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Configure engine based on database type
# SQLite needs check_same_thread=False, PostgreSQL doesn't support it
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url, 
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL or other databases
    engine = create_engine(settings.database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_database():
    """Initialize database with all models"""
    from app.models.user import User
    from app.models.department import Department
    from app.models.task import Task
    from app.models.project import Project
    from app.models.chat import ChatRoom, Message
    from app.models.role import Role, Permission
    from app.models.time_entry import TimeEntry
    
    Base.metadata.create_all(bind=engine)
