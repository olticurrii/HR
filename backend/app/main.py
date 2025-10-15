from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.core.config import settings
from app.models import Base
from app.api import auth, users, departments, tasks, projects, project_tasks, chat, comments, orgchart

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HR Management System",
    description="A comprehensive HR management system with real-time chat",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
async def root():
    return {"message": "HR Management System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
