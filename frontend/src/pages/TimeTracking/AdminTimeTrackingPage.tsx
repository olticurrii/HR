import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Download, Filter, AlertCircle, X, CheckCircle, MapPin, Coffee } from 'lucide-react';
import { 
  timeTrackingService, 
  ActiveUser, 
  NotClockedInUser,
  TimeEntryRecord,
  UserWithStatus 
} from '../../services/timeTrackingService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import TRAXCIS_COLORS from '../../theme/traxcis';

const AdminTimeTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [notClockedInUsers, setNotClockedInUsers] = useState<NotClockedInUser[]>([]);
  const [allUsers, setAllUsers] = useState<UserWithStatus[]>([]);
  const [records, setRecords] = useState<TimeEntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();
  const [terrainFilter, setTerrainFilter] = useState<boolean | undefined>();
  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    if (!user?.is_admin) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const fetchData = async () => {
    try {
      setError(null);
      const [active, notClocked, allUsersData] = await Promise.all([
        timeTrackingService.getActiveUsers(),
        timeTrackingService.getNotClockedInUsers(),
        timeTrackingService.getAllUsersWithStatus(),
      ]);
      
      setActiveUsers(active);
      setNotClockedInUsers(notClocked);
      setAllUsers(allUsersData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      setError(null);
      const params: any = {};
      
      if (startDate) params.start_date = new Date(startDate).toISOString();
      if (endDate) params.end_date = new Date(endDate).toISOString();
      if (selectedUserId) params.user_id = selectedUserId;
      if (selectedDepartmentId) params.department_id = selectedDepartmentId;
      if (terrainFilter !== undefined) params.is_terrain = terrainFilter;
      
      const data = await timeTrackingService.getTimeRecords(params);
      setRecords(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch records');
    }
  };

  const handleExport = async () => {
    try {
      setError(null);
      const params: any = {};
      
      if (startDate) params.start_date = new Date(startDate).toISOString();
      if (endDate) params.end_date = new Date(endDate).toISOString();
      if (selectedUserId) params.user_id = selectedUserId;
      if (selectedDepartmentId) params.department_id = selectedDepartmentId;
      if (terrainFilter !== undefined) params.is_terrain = terrainFilter;
      
      await timeTrackingService.exportToCSV(params);
      toast.success('Data exported successfully');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to export data';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusIcon = (user: ActiveUser | UserWithStatus) => {
    if ('is_clocked_in' in user && !user.is_clocked_in) return '⚪';
    if (user.is_on_break) return '🟠';
    if (user.is_terrain) return '🔵';
    return '🟢';
  };

  const getStatusText = (user: UserWithStatus) => {
    if (!user.is_clocked_in) return 'Not Clocked In';
    if (user.is_on_break) return 'On Break';
    if (user.is_terrain) return 'Working (Terrain)';
    return 'Working (Office)';
  };

  const getLocationText = (user: UserWithStatus) => {
    if (!user.is_clocked_in) return 'N/A';
    return user.is_terrain ? 'Terrain' : 'Office';
  };

  const getActivity = (user: UserWithStatus) => {
    if (!user.is_clocked_in) return 'Not Active';
    if (user.is_on_break) return 'On Break';
    return 'Working';
  };

  const getStatusBadgeColors = (status: string) => {
    switch (status.toLowerCase()) {
      case 'working (office)':
      case 'active':
        return {
          bg: isDark ? '#064E3B' : '#D1FAE5',
          text: isDark ? '#6EE7B7' : '#065F46',
          border: isDark ? '#065F46' : '#A7F3D0',
        };
      case 'working (terrain)':
        return {
          bg: isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50],
          text: TRAXCIS_COLORS.primary.DEFAULT,
          border: isDark ? TRAXCIS_COLORS.primary[700] : TRAXCIS_COLORS.primary[200],
        };
      case 'on break':
        return {
          bg: isDark ? '#78350F' : '#FEF3C7',
          text: isDark ? '#FCD34D' : '#92400E',
          border: isDark ? '#92400E' : '#FDE68A',
        };
      case 'not clocked in':
        return {
          bg: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
          text: isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[600],
          border: isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200],
        };
      default:
        return {
          bg: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
          text: isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[600],
          border: isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200],
        };
    }
  };

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const tableBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const tableHeaderBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const tableRowHoverBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300];

  if (!user?.is_admin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Clock style={{ width: '28px', height: '28px' }} />
            Admin Time Tracking Dashboard
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            Monitor employee time tracking and attendance
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '16px',
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            padding: '64px',
            textAlign: 'center',
          }}
        >
          <AlertCircle style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: TRAXCIS_COLORS.status.error, opacity: 0.6 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: textColor }}>
            Access Denied
          </h3>
          <p style={{ fontSize: '14px', color: subTextColor }}>
            Admin privileges required to view this page.
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Clock style={{ width: '28px', height: '28px' }} />
            Admin Time Tracking Dashboard
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            Monitor employee time tracking and attendance
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '16px',
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            padding: '64px',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRight: `3px solid ${cardBorder}`,
            borderBottom: `3px solid ${cardBorder}`,
            borderLeft: `3px solid ${cardBorder}`,
            borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: subTextColor, fontSize: '14px' }}>Loading time tracking data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '500',
            color: textColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <Clock style={{ width: '28px', height: '28px' }} />
            Admin Time Tracking Dashboard
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', fontSize: '15px' }}>
            Monitor employee time tracking and attendance
          </p>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: TRAXCIS_COLORS.accent.DEFAULT,
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent[600]}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent.DEFAULT}
        >
          <Download style={{ width: '18px', height: '18px' }} />
          Export CSV
        </motion.button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#991B1B' }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Active Users Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: subTextColor,
                marginBottom: '8px',
              }}>
                Active Users
              </p>
              <p style={{
                fontSize: '32px',
                fontWeight: '600',
                color: TRAXCIS_COLORS.status.success,
              }}>
                {activeUsers.length}
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users style={{ width: '24px', height: '24px', color: TRAXCIS_COLORS.status.success }} />
            </div>
          </div>
        </motion.div>

        {/* Not Clocked In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: subTextColor,
                marginBottom: '8px',
              }}>
                Not Clocked In
              </p>
              <p style={{
                fontSize: '32px',
                fontWeight: '600',
                color: TRAXCIS_COLORS.status.error,
              }}>
                {notClockedInUsers.length}
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: isDark ? '#7C2D12' : '#FEE2E2',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock style={{ width: '24px', height: '24px', color: TRAXCIS_COLORS.status.error }} />
            </div>
          </div>
        </motion.div>

        {/* On Break Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: subTextColor,
                marginBottom: '8px',
              }}>
                On Break
              </p>
              <p style={{
                fontSize: '32px',
                fontWeight: '600',
                color: TRAXCIS_COLORS.status.warning,
              }}>
                {activeUsers.filter(u => u.is_on_break).length}
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: isDark ? '#78350F' : '#FEF3C7',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Coffee style={{ width: '24px', height: '24px', color: TRAXCIS_COLORS.status.warning }} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* All Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          backgroundColor: tableBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
            marginBottom: '4px',
          }}>
            All Users - Activity & Location
          </h2>
          <p style={{ fontSize: '13px', color: subTextColor }}>
            View all employees with their current status and location
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr style={{ backgroundColor: tableHeaderBg, borderBottom: `1px solid ${cardBorder}` }}>
                {['Status', 'Employee', 'Department', 'Job Role', 'Location', 'Activity', 'Clock In Time', 'Duration'].map((header) => (
                  <th key={header} style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: subTextColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: subTextColor }}>
                    No users found
                  </td>
                </tr>
              ) : (
                allUsers.map((user, index) => {
                  const statusText = getStatusText(user);
                  const badgeColors = getStatusBadgeColors(statusText);
                  
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      style={{
                        borderBottom: `1px solid ${cardBorder}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = tableRowHoverBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: badgeColors.bg,
                          color: badgeColors.text,
                          border: `1px solid ${badgeColors.border}`,
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                        }}>
                          {getStatusIcon(user)} {statusText}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: textColor }}>
                          {user.full_name}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '14px', color: textColor }}>
                          {user.department_name || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '14px', color: subTextColor }}>
                          {user.job_role || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin style={{ width: '14px', height: '14px', color: subTextColor }} />
                          <span style={{ fontSize: '14px', color: textColor }}>
                            {getLocationText(user)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '14px', color: textColor }}>
                          {getActivity(user)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '14px', color: textColor }}>
                          {user.clock_in ? new Date(user.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: TRAXCIS_COLORS.primary.DEFAULT }}>
                          {user.current_duration_minutes ? formatDuration(user.current_duration_minutes) : '-'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Currently Active Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          backgroundColor: tableBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
          }}>
            Currently Active Users
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr style={{ backgroundColor: tableHeaderBg, borderBottom: `1px solid ${cardBorder}` }}>
                {['Status', 'Employee', 'Department', 'Clock In', 'Duration', 'State'].map((header) => (
                  <th key={header} style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: subTextColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: subTextColor }}>
                    No active users at the moment
                  </td>
                </tr>
              ) : (
                activeUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    style={{
                      borderBottom: `1px solid ${cardBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tableRowHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: user.is_on_break 
                          ? (isDark ? '#78350F' : '#FEF3C7')
                          : (isDark ? '#064E3B' : '#D1FAE5'),
                        color: user.is_on_break
                          ? (isDark ? '#FCD34D' : '#92400E')
                          : (isDark ? '#6EE7B7' : '#065F46'),
                        border: `1px solid ${user.is_on_break 
                          ? (isDark ? '#92400E' : '#FDE68A')
                          : (isDark ? '#065F46' : '#A7F3D0')}`,
                        fontWeight: '500',
                      }}>
                        {getStatusIcon(user)} {user.is_on_break ? 'On Break' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: textColor }}>
                        {user.full_name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: textColor }}>
                        {user.department_name || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: textColor }}>
                        {new Date(user.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: TRAXCIS_COLORS.primary.DEFAULT }}>
                        {formatDuration(user.current_duration_minutes)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: textColor }}>
                        {user.is_terrain ? 'Terrain' : 'Office'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${cardBorder}`,
          backgroundColor: tableHeaderBg,
          fontSize: '14px',
          color: subTextColor,
        }}>
          {activeUsers.length} active user{activeUsers.length !== 1 ? 's' : ''} currently working
        </div>
      </motion.div>

      {/* Not Clocked In Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          backgroundColor: tableBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}` }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
          }}>
            Not Clocked In Today
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr style={{ backgroundColor: tableHeaderBg, borderBottom: `1px solid ${cardBorder}` }}>
                {['Employee', 'Department'].map((header) => (
                  <th key={header} style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: subTextColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notClockedInUsers.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <CheckCircle style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: TRAXCIS_COLORS.status.success, opacity: 0.3 }} />
                    <p style={{ color: subTextColor, fontSize: '14px' }}>
                      All users have clocked in today!
                    </p>
                  </td>
                </tr>
              ) : (
                notClockedInUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    style={{
                      borderBottom: `1px solid ${cardBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tableRowHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: textColor }}>
                        {user.full_name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: textColor }}>
                        {user.department_name || '-'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${cardBorder}`,
          backgroundColor: tableHeaderBg,
          fontSize: '14px',
          color: subTextColor,
        }}>
          {notClockedInUsers.length} user{notClockedInUsers.length !== 1 ? 's' : ''} not clocked in
        </div>
      </motion.div>

      {/* Time Records Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          backgroundColor: tableBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: textColor,
          }}>
            Time Records
          </h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowFilters(!showFilters);
              if (!showFilters) fetchRecords();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: showFilters ? TRAXCIS_COLORS.accent.DEFAULT : 'transparent',
              color: showFilters ? '#FFFFFF' : textColor,
              border: `1px solid ${showFilters ? TRAXCIS_COLORS.accent.DEFAULT : cardBorder}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!showFilters) {
                e.currentTarget.style.backgroundColor = tableRowHoverBg;
              }
            }}
            onMouseLeave={(e) => {
              if (!showFilters) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <Filter style={{ width: '16px', height: '16px' }} />
            {showFilters ? 'Hide' : 'Show'} Filters
          </motion.button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${cardBorder}`,
                backgroundColor: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50],
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: textColor,
                    marginBottom: '6px',
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: `1px solid ${inputBorder}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: "'Outfit', sans-serif",
                      backgroundColor: inputBg,
                      color: textColor,
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                      e.target.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: textColor,
                    marginBottom: '6px',
                  }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: `1px solid ${inputBorder}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: "'Outfit', sans-serif",
                      backgroundColor: inputBg,
                      color: textColor,
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                      e.target.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={fetchRecords}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr style={{ backgroundColor: tableHeaderBg, borderBottom: `1px solid ${cardBorder}` }}>
                {['Employee', 'Department', 'Clock In', 'Clock Out', 'Hours', 'Break', 'Type'].map((header) => (
                  <th key={header} style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: subTextColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <Filter style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: subTextColor, opacity: 0.3 }} />
                    <p style={{ color: subTextColor, fontSize: '14px' }}>
                      No records found. Apply filters to view records.
                    </p>
                  </td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    style={{
                      borderBottom: `1px solid ${cardBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tableRowHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: textColor }}>
                        {record.user_name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: textColor }}>
                        {record.department_name || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: textColor }}>
                        {new Date(record.clock_in).toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: textColor }}>
                        {record.clock_out 
                          ? new Date(record.clock_out).toLocaleString([], { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : '-'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: TRAXCIS_COLORS.primary.DEFAULT }}>
                        {record.total_worked_hours ? `${record.total_worked_hours.toFixed(2)}h` : '-'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', color: textColor }}>
                        {record.break_duration_minutes ? formatDuration(record.break_duration_minutes) : '-'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: record.is_terrain
                          ? (isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50])
                          : (isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100]),
                        color: record.is_terrain
                          ? TRAXCIS_COLORS.primary.DEFAULT
                          : (isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[600]),
                        border: `1px solid ${record.is_terrain
                          ? (isDark ? TRAXCIS_COLORS.primary[700] : TRAXCIS_COLORS.primary[200])
                          : (isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200])}`,
                        fontWeight: '500',
                      }}>
                        {record.is_terrain ? 'Terrain' : 'Office'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {records.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: `1px solid ${cardBorder}`,
            backgroundColor: tableHeaderBg,
            fontSize: '14px',
            color: subTextColor,
          }}>
            Showing {records.length} time record{records.length !== 1 ? 's' : ''}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminTimeTrackingPage;
