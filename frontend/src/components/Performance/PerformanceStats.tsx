import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, TrendingUp, ClipboardList } from 'lucide-react';

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
  const statsConfig = [
    { name: 'Total Goals', value: stats.totalGoals.toString(), icon: Target, color: 'bg-primary-500', bgColor: 'bg-primary-50' },
    { name: 'Completed', value: stats.completedGoals.toString(), icon: CheckCircle, color: 'bg-green-500', bgColor: 'bg-green-50' },
    { name: 'Avg Progress', value: `${Math.round(stats.averageProgress)}%`, icon: TrendingUp, color: 'bg-purple-500', bgColor: 'bg-purple-50' },
    { name: 'Pending', value: stats.pendingApprovals.toString(), icon: ClipboardList, color: 'bg-orange-500', bgColor: 'bg-orange-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat) => (
        <motion.div key={stat.name} className={`${stat.bgColor} rounded-2xl p-6`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-medium text-gray-900">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PerformanceStats;
