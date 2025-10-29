import React from 'react';
import { Target, CheckCircle, TrendingUp, ClipboardList } from 'lucide-react';
import KPICard from '../shared/KPICard';

interface PerformanceStatsProps {
  stats: {
    totalGoals: number;
    completedGoals: number;
    averageProgress: number;
    pendingApprovals: number;
  };
  loading?: boolean;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ stats, loading = false }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
    }}>
      <KPICard
        name="Total Goals"
        value={stats.totalGoals}
        icon={Target}
        color="primary"
        loading={loading}
      />
      <KPICard
        name="Completed"
        value={stats.completedGoals}
        icon={CheckCircle}
        color="green"
        loading={loading}
      />
      <KPICard
        name="Avg Progress"
        value={`${Math.round(stats.averageProgress)}%`}
        icon={TrendingUp}
        color="yellow"
        loading={loading}
        progress={stats.averageProgress}
      />
      <KPICard
        name="Pending Approvals"
        value={stats.pendingApprovals}
        icon={ClipboardList}
        color="orange"
        loading={loading}
      />
    </div>
  );
};

export default PerformanceStats;
