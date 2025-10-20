import { useState, useEffect } from 'react';
import { settingsService, OrganizationSettings } from '../services/settingsService';

export const usePerformanceSettings = () => {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getOrgSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch performance settings:', err);
        setError('Failed to load performance settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    isModuleEnabled: settings?.performance_module_enabled ?? true,
    allowSelfGoals: settings?.performance_allow_self_goals ?? true,
    requireGoalApproval: settings?.performance_require_goal_approval ?? true,
    enablePeerReviews: settings?.performance_enable_peer_reviews ?? true,
    allowAnonymousPeer: settings?.performance_allow_anonymous_peer ?? true,
    showKpiTrends: settings?.performance_show_kpi_trends ?? true,
    topPerformerThreshold: settings?.performance_top_performer_threshold ?? 85,
    monthlyReports: settings?.performance_monthly_reports ?? true,
  };
};

