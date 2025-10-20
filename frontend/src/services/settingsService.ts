import { api } from './authService';

export interface OrganizationSettings {
  id: number;
  allow_breaks: boolean;
  require_documentation: boolean;
  orgchart_show_unassigned_panel: boolean;
  orgchart_manager_subtree_edit: boolean;
  orgchart_department_colors: boolean;
  orgchart_compact_view: boolean;
  orgchart_show_connectors: boolean;
  feedback_allow_anonymous: boolean;
  feedback_enable_threading: boolean;
  feedback_enable_moderation: boolean;
  feedback_notify_managers: boolean;
  feedback_weekly_digest: boolean;
  performance_module_enabled: boolean;
  performance_allow_self_goals: boolean;
  performance_require_goal_approval: boolean;
  performance_enable_peer_reviews: boolean;
  performance_allow_anonymous_peer: boolean;
  performance_show_kpi_trends: boolean;
  performance_top_performer_threshold: number;
  performance_monthly_reports: boolean;
  email_notifications_enabled: boolean;
  inapp_notifications_enabled: boolean;
  daily_summary_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettingsUpdate {
  allow_breaks?: boolean;
  require_documentation?: boolean;
  orgchart_show_unassigned_panel?: boolean;
  orgchart_manager_subtree_edit?: boolean;
  orgchart_department_colors?: boolean;
  orgchart_compact_view?: boolean;
  orgchart_show_connectors?: boolean;
  feedback_allow_anonymous?: boolean;
  feedback_enable_threading?: boolean;
  feedback_enable_moderation?: boolean;
  feedback_notify_managers?: boolean;
  feedback_weekly_digest?: boolean;
  performance_module_enabled?: boolean;
  performance_allow_self_goals?: boolean;
  performance_require_goal_approval?: boolean;
  performance_enable_peer_reviews?: boolean;
  performance_allow_anonymous_peer?: boolean;
  performance_show_kpi_trends?: boolean;
  performance_top_performer_threshold?: number;
  performance_monthly_reports?: boolean;
  email_notifications_enabled?: boolean;
  inapp_notifications_enabled?: boolean;
  daily_summary_enabled?: boolean;
}

export const settingsService = {
  // Get organization settings
  getOrgSettings: async (): Promise<OrganizationSettings> => {
    const response = await api.get('/api/v1/settings/org');
    return response.data;
  },

  // Update organization settings (Admin only)
  updateOrgSettings: async (data: OrganizationSettingsUpdate): Promise<OrganizationSettings> => {
    const response = await api.put('/api/v1/settings/org', data);
    return response.data;
  },
};

