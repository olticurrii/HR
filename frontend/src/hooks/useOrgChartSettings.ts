import { useState, useEffect } from 'react';
import { api } from '../services/authService';

export interface OrgChartSettings {
  orgchart_show_unassigned_panel: boolean;
  orgchart_manager_subtree_edit: boolean;
  orgchart_department_colors: boolean;
  orgchart_compact_view: boolean;
  orgchart_show_connectors: boolean;
}

export const useOrgChartSettings = () => {
  const [settings, setSettings] = useState<OrgChartSettings>({
    orgchart_show_unassigned_panel: true,
    orgchart_manager_subtree_edit: true,
    orgchart_department_colors: true,
    orgchart_compact_view: false,
    orgchart_show_connectors: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/v1/settings/org');
        setSettings({
          orgchart_show_unassigned_panel: response.data.orgchart_show_unassigned_panel,
          orgchart_manager_subtree_edit: response.data.orgchart_manager_subtree_edit,
          orgchart_department_colors: response.data.orgchart_department_colors,
          orgchart_compact_view: response.data.orgchart_compact_view,
          orgchart_show_connectors: response.data.orgchart_show_connectors,
        });
      } catch (error) {
        console.error('Failed to fetch org chart settings:', error);
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
};

