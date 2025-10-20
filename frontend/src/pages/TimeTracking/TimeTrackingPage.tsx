import React, { useState, useEffect } from 'react';
import { Clock, Coffee, MapPin, LogIn, LogOut, Play, Pause, AlertCircle, Users, Ban } from 'lucide-react';
import { timeTrackingService, TimeTrackingStatus, ActiveUser, NotClockedInUser, UserWithStatus } from '../../services/timeTrackingService';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationModal from '../../components/Common/ConfirmationModal';

const TimeTrackingPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-time' | 'team-view'>('my-time');
  const [status, setStatus] = useState<TimeTrackingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionLoading, setActionLoading] = useState(false);
  const [allowBreaks, setAllowBreaks] = useState(true);
  const [requireDocumentation, setRequireDocumentation] = useState(false);
  const [showDocumentationModal, setShowDocumentationModal] = useState(false);
  const [workSummary, setWorkSummary] = useState('');
  
  // Team view data
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [notClockedInUsers, setNotClockedInUsers] = useState<NotClockedInUser[]>([]);
  const [allUsersStatus, setAllUsersStatus] = useState<UserWithStatus[]>([]);

  const isManagerOrAdmin = hasRole(['admin', 'manager']);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'danger';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch settings and status on mount
  useEffect(() => {
    fetchSettings();
    fetchStatus();
    if (isManagerOrAdmin) {
      fetchTeamData();
    }
    const interval = setInterval(() => {
      fetchStatus();
      if (isManagerOrAdmin) {
        fetchTeamData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const settings = await settingsService.getOrgSettings();
      setAllowBreaks(settings.allow_breaks);
      setRequireDocumentation(settings.require_documentation);
    } catch (err) {
      console.error('Failed to load settings:', err);
      // Default values if settings fail to load
      setAllowBreaks(true);
      setRequireDocumentation(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'team-view' && isManagerOrAdmin) {
      fetchTeamData();
    }
  }, [activeTab]);

  const fetchStatus = async () => {
    try {
      setError(null);
      const data = await timeTrackingService.getStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamData = async () => {
    if (!isManagerOrAdmin) return;
    
    try {
      const [active, notClocked, allStatus] = await Promise.all([
        timeTrackingService.getActiveUsers(),
        timeTrackingService.getNotClockedInUsers(),
        timeTrackingService.getAllUsersWithStatus(),
      ]);
      setActiveUsers(active);
      setNotClockedInUsers(notClocked);
      setAllUsersStatus(allStatus);
    } catch (err: any) {
      console.error('Failed to fetch team data:', err);
    }
  };

  const handleClockIn = (isTerrain: boolean = false) => {
    setConfirmModal({
      isOpen: true,
      title: isTerrain ? 'Clock In (Terrain)' : 'Clock In',
      message: isTerrain 
        ? 'Are you sure you want to clock in for terrain work? This will mark you as working off-site.'
        : 'Are you sure you want to clock in? This will start your work session.',
      type: 'success',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await timeTrackingService.clockIn(isTerrain);
          await fetchStatus();
          setError(null);
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to clock in');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleClockOut = () => {
    // If documentation is required, show modal
    if (requireDocumentation) {
      setWorkSummary('');
      setShowDocumentationModal(true);
      return;
    }

    // Otherwise, proceed with normal confirmation
    setConfirmModal({
      isOpen: true,
      title: 'Clock Out',
      message: 'Are you sure you want to clock out? This will end your work session and any active breaks.',
      type: 'warning',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await timeTrackingService.clockOut();
          await fetchStatus();
          setError(null);
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to clock out');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleClockOutWithDocumentation = async () => {
    if (!workSummary.trim()) {
      setError('Work summary is required');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await timeTrackingService.clockOut(workSummary);
      await fetchStatus();
      setShowDocumentationModal(false);
      setWorkSummary('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Start Break',
      message: 'Are you sure you want to start a break? Your work time will be paused.',
      type: 'info',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await timeTrackingService.startBreak();
          await fetchStatus();
          setError(null);
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to start break');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleEndBreak = () => {
    setConfirmModal({
      isOpen: true,
      title: 'End Break',
      message: 'Are you sure you want to end your break? Your work time will resume.',
      type: 'success',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await timeTrackingService.endBreak();
          await fetchStatus();
          setError(null);
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to end break');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleToggleTerrain = () => {
    const isCurrentlyTerrain = status?.is_terrain;
    setConfirmModal({
      isOpen: true,
      title: isCurrentlyTerrain ? 'Switch to Office Mode' : 'Switch to Terrain Mode',
      message: isCurrentlyTerrain 
        ? 'Are you sure you want to switch to office mode? This will mark you as working on-site.'
        : 'Are you sure you want to switch to terrain mode? This will mark you as working off-site.',
      type: 'info',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await timeTrackingService.toggleTerrain();
          await fetchStatus();
          setError(null);
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to toggle terrain');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '00:00:00';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((currentTime.getTime() - (status?.current_entry?.clock_in ? new Date(status.current_entry.clock_in).getTime() : 0)) / 1000) % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Clock className="w-6 h-6 mr-2" />
          Time Tracking
        </h1>
        <p className="text-gray-600">Track your working hours and manage your time</p>
      </div>

      {/* Tabs for Manager/Admin */}
      {isManagerOrAdmin && (
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('my-time')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'my-time'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            My Time
          </button>
          <button
            onClick={() => setActiveTab('team-view')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'team-view'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Team View
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* My Time Tab */}
      {activeTab === 'my-time' && (
        <>
          {/* Current Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <div className={`w-3 h-3 rounded-full ${status?.is_clocked_in ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-lg font-semibold mt-2">
                  {status?.is_clocked_in ? 'Clocked In' : 'Not Working'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Break</span>
                  <div className={`w-3 h-3 rounded-full ${status?.is_on_break ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-lg font-semibold mt-2">
                  {status?.is_on_break ? 'On Break' : 'Active'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <div className={`w-3 h-3 rounded-full ${status?.is_terrain ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                </div>
                <p className="text-lg font-semibold mt-2">
                  {status?.is_terrain ? 'Terrain' : 'Office'}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <span className="text-gray-600">Working Time</span>
                <p className="text-2xl font-mono font-bold mt-2 text-blue-600">
                  {status?.is_clocked_in ? formatDuration(status.current_duration_minutes) : '00:00:00'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {!status?.is_clocked_in ? (
                <>
                  <button
                    onClick={() => handleClockIn(false)}
                    disabled={actionLoading}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Clock In
                  </button>
                  <button
                    onClick={() => handleClockIn(true)}
                    disabled={actionLoading}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Clock In (Terrain)
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleClockOut}
                    disabled={actionLoading}
                    className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Clock Out
                  </button>
                  
                  {/* Break Controls - Only show if breaks are allowed */}
                  {allowBreaks ? (
                    <>
                      {!status.is_on_break ? (
                        <button
                          onClick={handleStartBreak}
                          disabled={actionLoading}
                          className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Coffee className="w-5 h-5 mr-2" />
                          Start Break
                        </button>
                      ) : (
                        <button
                          onClick={handleEndBreak}
                          disabled={actionLoading}
                          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          End Break
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-600 rounded-lg border-2 border-dashed border-gray-300">
                      <Ban className="w-5 h-5 mr-2" />
                      <span className="text-sm">Breaks disabled by admin</span>
                    </div>
                  )}

                  <button
                    onClick={handleToggleTerrain}
                    disabled={actionLoading}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      status.is_terrain
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    {status.is_terrain ? 'Terrain Mode' : 'Office Mode'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Session Details */}
          {status?.is_clocked_in && status.current_entry && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Current Session</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Clock In Time:</span>
                  <p className="text-lg font-semibold">
                    {new Date(status.current_entry.clock_in).toLocaleString()}
                  </p>
                </div>
                {status.current_entry.break_start && (
                  <div>
                    <span className="text-gray-600">Break Started:</span>
                    <p className="text-lg font-semibold">
                      {new Date(status.current_entry.break_start).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Team View Tab */}
      {activeTab === 'team-view' && isManagerOrAdmin && (
        <div className="space-y-6">
          {/* All Users Status Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">All Users - Activity & Location</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clock In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Break
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allUsersStatus.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_clocked_in ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                            Not Working
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.clock_in ? new Date(user.clock_in).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {user.current_duration_minutes ? formatDuration(user.current_duration_minutes) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_on_break ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Coffee className="w-3 h-3 mr-1" />
                            On Break
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_terrain ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <MapPin className="w-3 h-3 mr-1" />
                            Terrain
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Office
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allUsersStatus.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No user data available
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Active Users ({activeUsers.length})
              </h3>
              <div className="space-y-3">
                {activeUsers.map((user) => (
                  <div key={user.id} className="border-l-4 border-green-500 pl-3 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-600">
                          Clocked in: {new Date(user.clock_in).toLocaleTimeString()}
                        </p>
                        <p className="text-sm font-medium text-gray-900">Duration: {formatDuration(user.current_duration_minutes)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {user.is_on_break && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                            On Break
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          user.is_terrain ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {user.is_terrain ? 'Terrain' : 'Office'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {activeUsers.length === 0 && (
                  <p className="text-gray-500 text-sm">No active users</p>
                )}
              </div>
            </div>

            {/* Not Clocked In Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                Not Working ({notClockedInUsers.length})
              </h3>
              <div className="space-y-2">
                {notClockedInUsers.map((user) => (
                  <div key={user.id} className="border-l-4 border-gray-300 pl-3 py-2">
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-600">Not clocked in today</p>
                  </div>
                ))}
                {notClockedInUsers.length === 0 && (
                  <p className="text-gray-500 text-sm">All users are clocked in</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Work Documentation Modal */}
      {showDocumentationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Today's Work Summary
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a brief summary of your work today before clocking out.
              </p>
              
              <textarea
                value={workSummary}
                onChange={(e) => setWorkSummary(e.target.value)}
                placeholder="Describe what you accomplished today..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={actionLoading}
              />

              {error && (
                <div className="mt-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowDocumentationModal(false);
                    setWorkSummary('');
                    setError(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClockOutWithDocumentation}
                  disabled={actionLoading || !workSummary.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Clocking Out...
                    </span>
                  ) : (
                    'Clock Out'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingPage;
