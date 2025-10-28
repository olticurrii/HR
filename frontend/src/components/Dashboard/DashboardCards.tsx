import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  name: string;
  value: string;
  icon: LucideIcon;
  color: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  loading?: boolean;
}

interface DashboardCardsProps {
  stats: StatCardProps[];
}

const StatCard: React.FC<StatCardProps> = React.memo(({ 
  name, 
  value, 
  icon: Icon, 
  color, 
  change, 
  loading = false 
}) => {
  // Memoized gradient colors mapping for better performance
  const gradientColors = useMemo(() => {
    const gradientMap: Record<string, string> = {
      'bg-primary': 'from-primary-600 to-primary-700',
      'bg-green-500': 'from-green-500 to-emerald-600',
      'bg-secondary': 'from-secondary-700 to-secondary-800',
      'bg-accent': 'from-accent-500 to-accent-600',
      'bg-red-500': 'from-red-500 to-rose-600',
      'bg-indigo-500': 'from-indigo-500 to-indigo-600'
    };
    return gradientMap[color] || 'from-gray-500 to-gray-600';
  }, [color]);

  // Memoized trend styling
  const trendStyles = useMemo(() => {
    if (!change) return null;
    
    const trendColorMap: Record<'up' | 'down' | 'neutral', string> = {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400'
    };
    
    const trendIconMap: Record<'up' | 'down' | 'neutral', string> = {
      up: '↗',
      down: '↘',
      neutral: '→'
    };
    
    return {
      color: trendColorMap[change.trend],
      icon: trendIconMap[change.trend]
    };
  }, [change]);

  // Memoized class names for better performance
  const cardClasses = useMemo(() => clsx(
    'group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl',
    'border border-gray-100 dark:border-gray-700 p-6',
    'transition-all duration-300 hover:border-gray-200 dark:hover:border-gray-600'
  ), []);

  const iconContainerClasses = useMemo(() => clsx(
    'p-3 rounded-xl bg-gradient-to-br shadow-lg',
    'group-hover:scale-110 transition-transform duration-200',
    gradientColors
  ), [gradientColors]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={cardClasses}
    >
      {loading ? (
        // Loading skeleton
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Icon and Trend Indicator */}
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className={iconContainerClasses}
              whileHover={{ rotate: 5 }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
            
            {change && trendStyles && (
              <div className={clsx(
                'flex items-center space-x-1 text-sm font-medium',
                trendStyles.color
              )}>
                <span>{trendStyles.icon}</span>
                <span>{change.value}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
              {name}
            </p>
            <p className="text-3xl font-medium text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
              {value}
            </p>
          </div>

          {/* Bottom accent line */}
          <motion.div 
            className={clsx(
              'mt-4 h-1 bg-gradient-to-r rounded-full',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              gradientColors
            )}
            layoutId={`accent-${name}`}
          />
        </>
      )}
    </motion.div>
  );
});

const DashboardCards: React.FC<DashboardCardsProps> = React.memo(({ stats }) => {
  // Memoize animation variants to prevent recreation on each render
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }), []);

  // Memoize grid classes
  const gridClasses = useMemo(() => 
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
    []
  );

  return (
    <motion.div
      className={gridClasses}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          variants={itemVariants}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  );
});

// Set display names for better debugging
StatCard.displayName = 'StatCard';
DashboardCards.displayName = 'DashboardCards';

export default DashboardCards;
export type { StatCardProps };
