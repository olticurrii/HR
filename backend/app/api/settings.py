"""
Settings API endpoints.
Admin-only endpoints for managing organization-wide settings.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.organization_settings import OrganizationSettings
from app.schemas.settings import OrganizationSettingsResponse, OrganizationSettingsUpdate

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to require admin role."""
    if not current_user.is_admin and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def get_organization_settings(db: Session) -> OrganizationSettings:
    """Get or create organization settings."""
    settings = db.query(OrganizationSettings).filter(OrganizationSettings.id == 1).first()
    if not settings:
        # Create default settings if they don't exist
        settings = OrganizationSettings(
            id=1,
            allow_breaks=True,
            require_documentation=False,
            orgchart_show_unassigned_panel=True,
            orgchart_manager_subtree_edit=True,
            orgchart_department_colors=True,
            orgchart_compact_view=False,
            orgchart_show_connectors=True,
            feedback_allow_anonymous=True,
            feedback_enable_threading=True,
            feedback_enable_moderation=True,
            feedback_notify_managers=True,
            feedback_weekly_digest=True,
            performance_module_enabled=True,
            performance_allow_self_goals=True,
            performance_require_goal_approval=True,
            performance_enable_peer_reviews=True,
            performance_allow_anonymous_peer=True,
            performance_show_kpi_trends=True,
            performance_top_performer_threshold=85,
            performance_monthly_reports=True,
            email_notifications_enabled=True,
            inapp_notifications_enabled=True,
            daily_summary_enabled=True
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("/settings/org", response_model=OrganizationSettingsResponse)
def get_org_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get organization settings.
    Available to all authenticated users (they need to know if breaks are allowed).
    """
    settings = get_organization_settings(db)
    return settings

@router.put("/settings/org", response_model=OrganizationSettingsResponse)
def update_org_settings(
    settings_update: OrganizationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update organization settings (Admin only).
    """
    settings = get_organization_settings(db)
    
    # Update settings (only update fields that are provided)
    update_data = settings_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    
    return settings

# Helper functions for time tracking
def check_breaks_allowed(db: Session) -> bool:
    """Check if breaks are allowed in organization settings."""
    settings = get_organization_settings(db)
    return settings.allow_breaks

def check_documentation_required(db: Session) -> bool:
    """Check if documentation is required when clocking out."""
    settings = get_organization_settings(db)
    return settings.require_documentation

