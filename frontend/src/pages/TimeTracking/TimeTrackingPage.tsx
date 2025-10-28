import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { timeTrackingService, TimeTrackingStatus, ActiveUser, NotClockedInUser, UserWithStatus } from '../../services/timeTrackingService';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import toast from 'react-hot-toast';

// Import our new components
import TimeTrackingHeader from '../../components/TimeTracking/TimeTrackingHeader';
import StatusCard from '../../components/TimeTracking/StatusCard';
import ActionButtons from '../../components/TimeTracking/ActionButtons';
import SessionCard from '../../components/TimeTracking/SessionCard';
import TeamView from '../../components/TimeTracking/TeamView';
import EmptyState from '../../components/TimeTracking/EmptyState';

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
  }, [isManagerOrAdmin]);

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
  }, [activeTab, isManagerOrAdmin]);

  const fetchStatus = async () => {
    try {
      setError(null);
      const data = await timeTrackingService.getStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch status');
      toast.error('Failed to fetch time tracking status');
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
    } catch (err) {
      console.error('Failed to fetch team data:', err);
      toast.error('Failed to fetch team data');
    }
  };

  const handleClockIn = async (isTerrain: boolean) => {
    setActionLoading(true);
    try {
      await timeTrackingService.clockIn(isTerrain);
      await fetchStatus();
      toast.success(`Successfully clocked in${isTerrain ? ' (Terrain mode)' : ' (Office mode)'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = () => {
    if (requireDocumentation) {
      setShowDocumentationModal(true);
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'Clock Out',
        message: 'Are you sure you want to clock out? This will end your current work session.',
        type: 'warning',
        onConfirm: performClockOut,
      });
    }
  };

  const performClockOut = async (summary?: string) => {
    setActionLoading(true);
    try {
      await timeTrackingService.clockOut(summary);
      await fetchStatus();
      toast.success('Successfully clocked out');
      setWorkSummary('');
      setShowDocumentationModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = async () => {
    setActionLoading(true);
    try {
      await timeTrackingService.startBreak();
      await fetchStatus();
      toast.success('Break started');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to start break');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setActionLoading(true);
    try {
      await timeTrackingService.endBreak();
      await fetchStatus();
      toast.success('Break ended');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to end break');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTerrain = async () => {
    setActionLoading(true);
    try {
      await timeTrackingService.toggleTerrain();
      await fetchStatus();
      const newMode = !status?.is_terrain ? 'Terrain' : 'Office';
      toast.success(`Switched to ${newMode} mode`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to toggle terrain mode');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate working time in minutes from status
  const workingTimeMinutes = status?.current_entry 
    ? Math.floor((currentTime.getTime() - new Date(status.current_entry.clock_in).getTime()) / (1000 * 60))
    : 0;

  // Error state
  if (error && !status) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-red-900 dark:text-red-100 mb-2">
            Unable to load time tracking data
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error}
          </p>
          <button
            onClick={fetchStatus}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <TimeTrackingHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isManagerOrAdmin={isManagerOrAdmin}
        currentTime={currentTime}
        userFullName={user?.full_name}
      />

      {/* Main Content */}
      {activeTab === 'my-time' ? (
        <>
          {loading ? (
            // Loading State
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading your time tracking data...</span>
            </div>
          ) : !status?.is_clocked_in ? (
            // Empty State - User is clocked out
            <EmptyState
              onClockIn={handleClockIn}
              loading={actionLoading}
              userName={user?.full_name?.split(' ')[0] || 'there'}
            />
          ) : (
            // Active State - User is clocked in
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <StatusCard
                  isActive={status.is_clocked_in}
                  isOnBreak={status.is_on_break}
                  isTerrain={status.is_terrain}
                  workingTimeMinutes={workingTimeMinutes}
                  clockInTime={status.current_entry?.clock_in}
                  currentTime={currentTime}
                  loading={loading}
                />

                <ActionButtons
                  isActive={status.is_clocked_in}
                  isOnBreak={status.is_on_break}
                  isTerrain={status.is_terrain}
                  allowBreaks={allowBreaks}
                  loading={actionLoading}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                  onStartBreak={handleStartBreak}
                  onEndBreak={handleEndBreak}
                  onToggleTerrain={handleToggleTerrain}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <SessionCard
                  isActive={status.is_clocked_in}
                  clockInTime={status.current_entry?.clock_in}
                  clockOutTime={status.current_entry?.clock_out || undefined}
                  breakStart={status.current_entry?.break_start || undefined}
                  breakEnd={status.current_entry?.break_end || undefined}
                  isOnBreak={status.is_on_break}
                  isTerrain={status.is_terrain}
                  totalWorkingMinutes={workingTimeMinutes}
                  breakDurationMinutes={0} // You might want to calculate this from break_start and break_end
                  currentTime={currentTime}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        // Team View Tab
        <TeamView
          activeUsers={activeUsers}
          notClockedInUsers={notClockedInUsers}
          allUsersStatus={allUsersStatus}
          loading={loading}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Work Summary Modal */}
      {showDocumentationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Work Summary Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please provide a brief summary of your work before clocking out.
            </p>
            <textarea
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              placeholder="Describe what you accomplished today..."
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDocumentationModal(false);
                  setWorkSummary('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => performClockOut(workSummary)}
                disabled={!workSummary.trim() || actionLoading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Clocking Out...
                  </>
                ) : (
                  'Clock Out'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingPage;