import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, TrendingUp, FileText } from 'lucide-react';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface PerformanceTabsProps {
  activeTab: 'my-goals' | 'pending-approvals' | 'kpi-trends' | 'monthly-reports';
  onTabChange: (tab: 'my-goals' | 'pending-approvals' | 'kpi-trends' | 'monthly-reports') => void;
  pendingCount?: number;
  showApprovals?: boolean;
  showKpiTrends?: boolean;
  showReports?: boolean;
}

const PerformanceTabs: React.FC<PerformanceTabsProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 0,
  showApprovals = false,
  showKpiTrends = true,
  showReports = false,
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  const tabs = [
    {
      id: 'my-goals' as const,
      label: 'My Goals',
      icon: Target,
      show: true,
    },
    {
      id: 'pending-approvals' as const,
      label: 'Pending Approvals',
      icon: Clock,
      show: showApprovals,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'kpi-trends' as const,
      label: 'KPI Trends',
      icon: TrendingUp,
      show: showKpiTrends,
    },
    {
      id: 'monthly-reports' as const,
      label: 'Monthly Reports',
      icon: FileText,
      show: showReports,
    },
  ].filter(tab => tab.show);

  // Container: use neutral light in light mode, secondary dark in dark mode
  const containerBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  // Border: use secondary colors
  const containerBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  // Inactive text: use secondary lighter shades
  const inactiveText = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  // Hover background: use secondary colors
  const hoverBg = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[100];

  return (
    <div style={{
      backgroundColor: containerBg,
      borderRadius: '16px',
      padding: '8px',
      boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: `1px solid ${containerBorder}`,
    }}>
      <nav style={{ display: 'flex', gap: '4px' }} role="tablist">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? TRAXCIS_COLORS.accent.DEFAULT : 'transparent',
                color: isActive ? '#FFFFFF' : inactiveText,
                boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
              }}
              whileHover={{ scale: isActive ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = TRAXCIS_COLORS.accent.DEFAULT;
                  e.currentTarget.style.backgroundColor = hoverBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = inactiveText;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              role="tab"
              aria-selected={isActive}
            >
              <TabIcon style={{ width: '16px', height: '16px' }} />
              <span>{tab.label}</span>
              {tab.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    marginLeft: '8px',
                    backgroundColor: isActive ? (isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF') : TRAXCIS_COLORS.accent.DEFAULT,
                    color: isActive ? TRAXCIS_COLORS.accent.DEFAULT : '#FFFFFF',
                    fontSize: '12px',
                    borderRadius: '9999px',
                    padding: '2px 8px',
                    fontWeight: '600',
                    minWidth: '20px',
                    textAlign: 'center',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {tab.badge}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

export default PerformanceTabs;
