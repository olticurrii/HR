import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Coffee, 
  MapPin, 
  Building2, 
  Search, 
  Filter,
  User,
  TrendingUp,
  Activity
} from 'lucide-react';
import clsx from 'clsx';
import { ActiveUser, NotClockedInUser, UserWithStatus } from '../../services/timeTrackingService';

interface TeamViewProps {
  activeUsers: ActiveUser[];
  notClockedInUsers: NotClockedInUser[];
  allUsersStatus: UserWithStatus[];
  loading: boolean;
}

type FilterType = 'all' | 'active' | 'on-break' | 'clocked-out';
type SortType = 'name' | 'duration' | 'status' | 'department';

const TeamView: React.FC<TeamViewProps> = ({
  activeUsers,
  notClockedInUsers,
  allUsersStatus,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');

  // Combine all users into a unified format
  const unifiedUsers = useMemo(() => {
    const users = allUsersStatus.map(user => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      department_name: user.department_name,
      job_role: user.job_role,
      is_clocked_in: user.is_clocked_in,
      is_on_break: user.is_on_break,
      is_terrain: user.is_terrain,
      clock_in: user.clock_in,
      current_duration_minutes: user.current_duration_minutes || 0
    }));

    return users;
  }, [allUsersStatus]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = [...unifiedUsers];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.department_name?.toLowerCase().includes(search) ||
        user.job_role?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(user => {
        switch (filter) {
          case 'active':
            return user.is_clocked_in && !user.is_on_break;
          case 'on-break':
            return user.is_clocked_in && user.is_on_break;
          case 'clocked-out':
            return !user.is_clocked_in;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'duration':
          return (b.current_duration_minutes || 0) - (a.current_duration_minutes || 0);
        case 'status':
          if (a.is_clocked_in === b.is_clocked_in) {
            return a.is_on_break === b.is_on_break ? 0 : a.is_on_break ? 1 : -1;
          }
          return a.is_clocked_in ? -1 : 1;
        case 'department':
          return (a.department_name || '').localeCompare(b.department_name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [unifiedUsers, searchTerm, filter, sortBy]);

  // Team statistics
  const teamStats = useMemo(() => {
    const totalUsers = unifiedUsers.length;
    const activeCount = unifiedUsers.filter(u => u.is_clocked_in && !u.is_on_break).length;
    const onBreakCount = unifiedUsers.filter(u => u.is_on_break).length;
    const clockedOutCount = unifiedUsers.filter(u => !u.is_clocked_in).length;
    const totalHours = unifiedUsers.reduce((sum, u) => sum + (u.current_duration_minutes || 0), 0) / 60;
    const avgHours = totalUsers > 0 ? totalHours / totalUsers : 0;

    return {
      totalUsers,
      activeCount,
      onBreakCount,
      clockedOutCount,
      totalHours: totalHours.toFixed(1),
      avgHours: avgHours.toFixed(1)
    };
  }, [unifiedUsers]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getUserStatus = (user: typeof unifiedUsers[0]) => {
    if (!user.is_clocked_in) {
      return {
        label: 'Clocked Out',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        icon: User
      };
    }
    if (user.is_on_break) {
      return {
        label: 'On Break',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        icon: Coffee
      };
    }
    return {
      label: 'Working',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      icon: Activity
    };
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading skeleton for user list */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Team Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-medium text-gray-900 dark:text-white">
                {teamStats.totalUsers}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Team</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-medium text-gray-900 dark:text-white">
                {teamStats.activeCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Now</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
              <Coffee className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-medium text-gray-900 dark:text-white">
                {teamStats.onBreakCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">On Break</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-medium text-gray-900 dark:text-white">
                {teamStats.avgHours}h
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Hours</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on-break">On Break</option>
              <option value="clocked-out">Clocked Out</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="duration">Sort by Hours</option>
              <option value="status">Sort by Status</option>
              <option value="department">Sort by Department</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Team Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Team Members
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredUsers.length} of {teamStats.totalUsers} members
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <AnimatePresence>
            {filteredUsers.map((user, index) => {
              const status = getUserStatus(user);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>

                      {/* User Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {user.full_name}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{user.job_role || 'Employee'}</span>
                          {user.department_name && (
                            <>
                              <span>•</span>
                              <span>{user.department_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Location */}
                      {user.is_clocked_in && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          {user.is_terrain ? (
                            <>
                              <MapPin className="w-4 h-4 text-primary" />
                              <span>Terrain</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="w-4 h-4 text-purple-500" />
                              <span>Office</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Working Hours */}
                      {user.current_duration_minutes > 0 && (
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDuration(user.current_duration_minutes)}
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className={clsx(
                        'flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium',
                        status.color
                      )}>
                        <status.icon className="w-4 h-4" />
                        <span>{status.label}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filter !== 'all' 
                  ? 'No team members match your filters'
                  : 'No team members found'
                }
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeamView;
