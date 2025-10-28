import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface LeaveSummaryCardsProps {
  loading?: boolean;
  stats?: {
    totalAllocated: number;
    totalUsed: number;
    totalRemaining: number;
    pendingRequests: number;
  };
}

interface StatCard {
  title: string;
  value: number;
  suffix: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const LeaveSummaryCards: React.FC<LeaveSummaryCardsProps> = ({
  loading = false,
  stats
}) => {
  const cards: StatCard[] = [
    {
      title: 'Total Allocated',
      value: stats?.totalAllocated || 0,
      suffix: 'days',
      icon: Calendar,
      color: 'text-primary dark:text-blue-400',
      bgColor: 'bg-primary-50 dark:bg-blue-900/20',
      borderColor: 'border-primary-200 dark:border-blue-800'
    },
    {
      title: 'Used',
      value: stats?.totalUsed || 0,
      suffix: 'days',
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      title: 'Remaining',
      value: stats?.totalRemaining || 0,
      suffix: 'days',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      suffix: '',
      icon: AlertCircle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, staggerChildren: 0.1, delayChildren: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <motion.div
            key={card.title}
            variants={cardVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ 
              y: -4,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className={`
              bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border
              hover:shadow-lg transition-all duration-300 group cursor-default
              ${card.borderColor}
            `}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${card.bgColor} group-hover:scale-110 transition-transform duration-300
              `}>
                <IconComponent className={`w-6 h-6 ${card.color}`} />
              </div>
              
              {/* Optional trend indicator - you could add this based on historical data */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Card Content */}
            <div className="space-y-2">
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-baseline space-x-2"
              >
                <span className="text-3xl font-medium text-gray-900 dark:text-white">
                  {card.value}
                </span>
                {card.suffix && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {card.suffix}
                  </span>
                )}
              </motion.div>
              
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
            </div>

            {/* Progress bar for allocated vs used */}
            {(card.title === 'Total Allocated' && stats) && stats.totalAllocated > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>Usage</span>
                  <span>{Math.round((stats.totalUsed / stats.totalAllocated) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min((stats.totalUsed / stats.totalAllocated) * 100, 100)}%`
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-2 rounded-full ${
                      (stats.totalUsed / stats.totalAllocated) > 0.8 
                        ? 'bg-red-500' 
                        : (stats.totalUsed / stats.totalAllocated) > 0.6 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                    }`}
                  />
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default LeaveSummaryCards;
