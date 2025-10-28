import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, Calendar, BarChart3 } from 'lucide-react';

interface LeaveTabsProps {
  activeTab: 'my-leaves' | 'team-leaves';
  onTabChange: (tab: 'my-leaves' | 'team-leaves') => void;
  isManagerOrAdmin?: boolean;
  myLeavesCount?: number;
  teamLeavesCount?: number;
  loading?: boolean;
}

const LeaveTabs: React.FC<LeaveTabsProps> = ({
  activeTab,
  onTabChange,
  isManagerOrAdmin = false,
  myLeavesCount = 0,
  teamLeavesCount = 0,
  loading = false
}) => {
  const tabs = [
    {
      id: 'my-leaves' as const,
      label: 'My Leaves',
      icon: User,
      count: myLeavesCount,
      description: 'Your leave requests and balances'
    },
    ...(isManagerOrAdmin ? [{
      id: 'team-leaves' as const,
      label: 'Team Leaves',
      icon: Users,
      count: teamLeavesCount,
      description: 'Manage your team\'s leave requests'
    }] : [])
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center justify-center sm:justify-start space-x-3 px-4 py-3 rounded-xl
                text-sm font-medium transition-all duration-200 flex-1 min-w-0
                ${isActive
                  ? 'text-accent dark:text-orange-400 bg-accent-50 dark:bg-orange-900/20 accent-underline'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-accent'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {/* Active Tab Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-accent-100 dark:bg-accent-900/30 rounded-xl border-2 border-accent-200 dark:border-accent-700"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
              
              {/* Tab Content */}
              <div className="relative flex items-center space-x-3 min-w-0 flex-1">
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                  ${isActive 
                    ? 'bg-accent text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                  transition-all duration-200
                `}>
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Label and Description */}
                <div className="flex-1 min-w-0 text-left hidden sm:block">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium truncate">
                      {tab.label}
                    </span>
                    
                    {/* Count Badge */}
                    {tab.count > 0 && !loading && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`
                          px-2 py-0.5 text-xs font-medium rounded-full min-w-[20px] text-center
                          ${isActive
                            ? 'bg-accent text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        {tab.count}
                      </motion.span>
                    )}

                    {/* Loading Spinner */}
                    {loading && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full"
                      />
                    )}
                  </div>
                  
                  <p className={`
                    text-xs mt-0.5 truncate
                    ${isActive 
                      ? 'text-accent dark:text-orange-400' 
                      : 'text-gray-400 dark:text-gray-500'
                    }
                  `}>
                    {tab.description}
                  </p>
                </div>

                {/* Mobile: Just show label */}
                <span className="font-medium truncate sm:hidden">
                  {tab.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Summary Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            {activeTab === 'my-leaves' 
              ? 'Manage your personal leave requests'
              : 'Review and approve team leave requests'
            }
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
          <BarChart3 className="w-3 h-3" />
          <span>
            {activeTab === 'my-leaves' 
              ? `${myLeavesCount} total requests`
              : `${teamLeavesCount} team requests`
            }
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaveTabs;
