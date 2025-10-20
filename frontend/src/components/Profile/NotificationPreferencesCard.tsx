import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { notificationService, NotificationPreferences } from '../../services/notificationService';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const NotificationPreferencesCard: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const {
    isSupported: pushSupported,
    permission: pushPermission,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    error: pushError,
    toggleSubscription: togglePushSubscription
  } = usePushNotifications();

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await notificationService.updatePreferences(preferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully' });
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  const toggleAllForType = (type: 'email' | 'inapp' | 'push', enabled: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = { ...preferences };
    Object.keys(preferences).forEach(key => {
      if (key.startsWith(type) && key !== 'user_id') {
        (updatedPreferences as any)[key] = enabled;
      }
    });
    setPreferences(updatedPreferences);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Failed to load notification preferences</p>
      </div>
    );
  }

  const notificationCategories = [
    {
      title: 'Tasks',
      items: [
        { key: 'email_task_assigned', label: 'Task Assigned' },
        { key: 'email_task_completed', label: 'Task Completed' },
        { key: 'email_task_overdue', label: 'Task Overdue' }
      ]
    },
    {
      title: 'Projects',
      items: [
        { key: 'email_project_assigned', label: 'Project Assigned' }
      ]
    },
    {
      title: 'Work',
      items: [
        { key: 'email_late_to_work', label: 'Late to Work' }
      ]
    },
    {
      title: 'Comments',
      items: [
        { key: 'email_comment_reply', label: 'Comment Reply' }
      ]
    },
    {
      title: 'Reviews',
      items: [
        { key: 'email_task_reviewed', label: 'Task Reviewed' },
        { key: 'email_peer_review', label: 'Peer Review' },
        { key: 'email_manager_review', label: 'Manager Review' }
      ]
    },
    {
      title: 'Feedback',
      items: [
        { key: 'email_feedback_received', label: 'Feedback Received' },
        { key: 'email_public_feedback', label: 'Public Feedback' },
        { key: 'email_feedback_replied', label: 'Feedback Reply' }
      ]
    },
    {
      title: 'Goals',
      items: [
        { key: 'email_goal_approved', label: 'Goal Approved' },
        { key: 'email_goal_rejected', label: 'Goal Rejected' }
      ]
    },
    {
      title: 'Leave',
      items: [
        { key: 'email_leave_approved', label: 'Leave Approved' },
        { key: 'email_leave_rejected', label: 'Leave Rejected' }
      ]
    },
    {
      title: 'Messages',
      items: [
        { key: 'email_private_message', label: 'Private Message' },
        { key: 'email_department_message', label: 'Department Message' },
        { key: 'email_company_message', label: 'Company Message' }
      ]
    },
    {
      title: 'Mentions',
      items: [
        { key: 'email_mention', label: 'Mentioned' }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        </div>
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Push Notification Status */}
      {pushSupported && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {pushSubscribed ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications (Optional)</h4>
                <p className="text-sm text-gray-600">
                  {pushSubscribed 
                    ? 'Enabled - You will receive browser push notifications' 
                    : 'Not configured - In-app notifications are working'
                  }
                </p>
                {pushError && (
                  <p className="text-sm text-yellow-600 mt-1">
                    {pushError.includes('not configured') ? 'ℹ️ ' : '⚠️ '}{pushError}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Note: In-app notifications work without push notifications
                </p>
              </div>
            </div>
            <button
              onClick={togglePushSubscription}
              disabled={pushLoading || pushPermission === 'denied'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pushSubscribed
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {pushLoading ? 'Loading...' : pushSubscribed ? 'Disable' : 'Setup Push'}
            </button>
          </div>
        </div>
      )}

      {/* Channel Toggle All */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Email</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleAllForType('email', true)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                All
              </button>
              <button
                onClick={() => toggleAllForType('email', false)}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                None
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">In-App</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleAllForType('inapp', true)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                All
              </button>
              <button
                onClick={() => toggleAllForType('inapp', false)}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                None
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Push</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleAllForType('push', true)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                All
              </button>
              <button
                onClick={() => toggleAllForType('push', false)}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                None
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="space-y-6">
        {notificationCategories.map((category) => (
          <div key={category.title}>
            <h4 className="text-sm font-medium text-gray-900 mb-3">{category.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.items.map((item) => (
                <div key={item.key} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                        onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Mail className="w-3 h-3 text-gray-500" />
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences[item.key.replace('email_', 'inapp_') as keyof NotificationPreferences] as boolean}
                        onChange={(e) => updatePreference(item.key.replace('email_', 'inapp_') as keyof NotificationPreferences, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Monitor className="w-3 h-3 text-gray-500" />
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences[item.key.replace('email_', 'push_') as keyof NotificationPreferences] as boolean}
                        onChange={(e) => updatePreference(item.key.replace('email_', 'push_') as keyof NotificationPreferences, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Smartphone className="w-3 h-3 text-gray-500" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPreferencesCard;
