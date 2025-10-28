import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, TrendingUp, FileText } from 'lucide-react';

interface PerformanceTabsProps {
  activeTab: 'my-goals' | 'pending-approvals' | 'kpi-trends' | 'monthly-reports';
  onTabChange: (tab: 'my-goals' | 'pending-approvals' | 'kpi-trends' | 'monthly-reports') => void;
  pendingCount?: number;
  showApprovals?: boolean;
  showKpiTrends?: boolean;
  showReports?: boolean;
}

const PerformanceTabs: React.FC<PerformanceTabsProps> = ({
  activeTab, onTabChange, pendingCount = 0, showApprovals = false, showKpiTrends = true, showReports = false
}) => {
  const tabs = [
    { id: 'my-goals' as const, label: 'My Goals', icon: Target, show: true },
    { id: 'pending-approvals' as const, label: 'Pending Approvals', icon: Clock, show: showApprovals, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'kpi-trends' as const, label: 'KPI Trends', icon: TrendingUp, show: showKpiTrends },
    { id: 'monthly-reports' as const, label: 'Monthly Reports', icon: FileText, show: showReports },
  ].filter(tab => tab.show);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm border">
      <nav className="flex space-x-1">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge && <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">{tab.badge}</span>}
          </motion.button>
        ))}
      </nav>
    </div>
  );
};

export default PerformanceTabs;
