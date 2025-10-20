from sqlalchemy import Column, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class OrganizationSettings(Base):
    __tablename__ = "organization_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    allow_breaks = Column(Boolean, nullable=False, default=True)
    require_documentation = Column(Boolean, nullable=False, default=False)
    
    # Org Chart Feature Flags
    orgchart_show_unassigned_panel = Column(Boolean, nullable=False, default=True)
    orgchart_manager_subtree_edit = Column(Boolean, nullable=False, default=True)
    orgchart_department_colors = Column(Boolean, nullable=False, default=True)
    orgchart_compact_view = Column(Boolean, nullable=False, default=False)
    orgchart_show_connectors = Column(Boolean, nullable=False, default=True)
    
    # Feedback Feature Flags
    feedback_allow_anonymous = Column(Boolean, nullable=False, default=True)
    feedback_enable_threading = Column(Boolean, nullable=False, default=True)
    feedback_enable_moderation = Column(Boolean, nullable=False, default=True)
    feedback_notify_managers = Column(Boolean, nullable=False, default=True)
    feedback_weekly_digest = Column(Boolean, nullable=False, default=True)
    
    # Performance Module Feature Flags
    performance_module_enabled = Column(Boolean, nullable=False, default=True)
    performance_allow_self_goals = Column(Boolean, nullable=False, default=True)
    performance_require_goal_approval = Column(Boolean, nullable=False, default=True)
    performance_enable_peer_reviews = Column(Boolean, nullable=False, default=True)
    performance_allow_anonymous_peer = Column(Boolean, nullable=False, default=True)
    performance_show_kpi_trends = Column(Boolean, nullable=False, default=True)
    performance_top_performer_threshold = Column(Integer, nullable=False, default=85)  # Score threshold for badge
    performance_monthly_reports = Column(Boolean, nullable=False, default=True)
    
    # Notification System Feature Flags
    email_notifications_enabled = Column(Boolean, nullable=False, default=True)
    inapp_notifications_enabled = Column(Boolean, nullable=False, default=True)
    daily_summary_enabled = Column(Boolean, nullable=False, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

