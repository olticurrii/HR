from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrganizationSettingsBase(BaseModel):
    allow_breaks: bool
    require_documentation: bool
    orgchart_show_unassigned_panel: bool
    orgchart_manager_subtree_edit: bool
    orgchart_department_colors: bool
    orgchart_compact_view: bool
    orgchart_show_connectors: bool
    feedback_allow_anonymous: bool
    feedback_enable_threading: bool
    feedback_enable_moderation: bool
    feedback_notify_managers: bool
    feedback_weekly_digest: bool
    performance_module_enabled: bool
    performance_allow_self_goals: bool
    performance_require_goal_approval: bool
    performance_enable_peer_reviews: bool
    performance_allow_anonymous_peer: bool
    performance_show_kpi_trends: bool
    performance_top_performer_threshold: int
    performance_monthly_reports: bool
    email_notifications_enabled: bool
    inapp_notifications_enabled: bool
    daily_summary_enabled: bool

class OrganizationSettingsUpdate(BaseModel):
    allow_breaks: Optional[bool] = None
    require_documentation: Optional[bool] = None
    orgchart_show_unassigned_panel: Optional[bool] = None
    orgchart_manager_subtree_edit: Optional[bool] = None
    orgchart_department_colors: Optional[bool] = None
    orgchart_compact_view: Optional[bool] = None
    orgchart_show_connectors: Optional[bool] = None
    feedback_allow_anonymous: Optional[bool] = None
    feedback_enable_threading: Optional[bool] = None
    feedback_enable_moderation: Optional[bool] = None
    feedback_notify_managers: Optional[bool] = None
    feedback_weekly_digest: Optional[bool] = None
    performance_module_enabled: Optional[bool] = None
    performance_allow_self_goals: Optional[bool] = None
    performance_require_goal_approval: Optional[bool] = None
    performance_enable_peer_reviews: Optional[bool] = None
    performance_allow_anonymous_peer: Optional[bool] = None
    performance_show_kpi_trends: Optional[bool] = None
    performance_top_performer_threshold: Optional[int] = None
    performance_monthly_reports: Optional[bool] = None
    email_notifications_enabled: Optional[bool] = None
    inapp_notifications_enabled: Optional[bool] = None
    daily_summary_enabled: Optional[bool] = None

class OrganizationSettingsResponse(OrganizationSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

