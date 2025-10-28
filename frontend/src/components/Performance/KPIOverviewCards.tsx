import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Target, Clock, Award } from 'lucide-react';

interface KPIOverviewStats {
  totalKpisTracked: number;
  averagePerformance: number;
  kpisImproved: number;
  kpisDeclined: number;
  mostRecentUpdate: string;
  performanceScore?: number;
}

interface KPIOverviewCardsProps {
  stats: KPIOverviewStats;
  loading?: boolean;
}

const KPIOverviewCards: React.FC<KPIOverviewCardsProps> = ({ stats, loading }) => {
  const cards = [
    {
      title: 'KPIs Tracked',
      value: stats.totalKpisTracked || 0,
      icon: BarChart3,
      color: 'blue',
      bgColor: 'bg-primary-50 dark:bg-blue-900/20',
      iconColor: 'text-primary dark:text-blue-400',
      borderColor: 'border-primary-200 dark:border-blue-800',
    },
    {
      title: 'Avg Performance',
      value: `${Math.round(stats.averagePerformance || 0)}%`,
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'KPIs Improved',
      value: stats.kpisImproved || 0,
      icon: TrendingUp,
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      trend: 'up',
    },
    {
      title: 'KPIs Declined',
      value: stats.kpisDeclined || 0,
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      trend: 'down',
    },
    {
      title: 'Last Updated',
      value: stats.mostRecentUpdate || 'Never',
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 h-24 rounded-2xl"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`
            ${card.bgColor} ${card.borderColor}
            border-2 rounded-2xl p-4 
            hover:shadow-lg hover:shadow-${card.color}-500/10 
            transition-all duration-300 cursor-default
            relative overflow-hidden group
          `}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-medium text-gray-900 dark:text-white">
                  {card.value}
                </p>
                {card.trend && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`
                      flex items-center text-xs font-medium px-2 py-1 rounded-full
                      ${card.trend === 'up' 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                      }
                    `}
                  >
                    {card.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(stats.kpisImproved - stats.kpisDeclined)}
                  </motion.div>
                )}
              </div>
            </div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${card.iconColor} bg-white/50 dark:bg-gray-800/50
                group-hover:bg-white/80 dark:group-hover:bg-gray-700/80
                transition-colors duration-300
              `}
            >
              <card.icon className="w-6 h-6" />
            </motion.div>
          </div>
          
          {/* Performance Score Badge */}
          {card.title === 'Avg Performance' && stats.performanceScore && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-2 right-2"
            >
              <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs font-medium shadow-sm">
                <Award className="w-3 h-3 text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">{stats.performanceScore}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default KPIOverviewCards;
