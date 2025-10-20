import React, { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: string) => {
    setPreferences((prev: any) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await notificationService.updatePreferences(preferences);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { id: 'task_assigned', label: 'Task Assigned', description: 'When a task is assigned to you' },
    { id: 'goal_approved', label: 'Goal Approved', description: 'When your goal is approved' },
    { id: 'goal_rejected', label: 'Goal Rejected', description: 'When your goal needs revision' },
    { id: 'feedback_received', label: 'Feedback Received', description: 'When you receive feedback' },
    { id: 'leave_approved', label: 'Leave Approved', description: 'When your leave is approved' },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Failed to load preferences'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Preferences
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Choose how you want to be notified for different events
        </p>
      </div>

      <div className="p-6">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Preferences saved successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Header Row */}
        <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200 mb-4">
          <div className="text-sm font-medium text-gray-700">Notification Type</div>
          <div className="text-sm font-medium text-gray-700 text-center flex items-center justify-center">
            <Mail className="w-4 h-4 mr-1" />
            Email
          </div>
          <div className="text-sm font-medium text-gray-700 text-center flex items-center justify-center">
            <Bell className="w-4 h-4 mr-1" />
            In-App
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          {notificationTypes.map((type) => (
            <div key={type.id} className="grid grid-cols-3 gap-4 items-center">
              <div>
                <div className="text-sm font-medium text-gray-900">{type.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
              </div>
              
              {/* Email Toggle */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => handleToggle(`email_${type.id}`)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences[`email_${type.id}`] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={preferences[`email_${type.id}`]}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences[`email_${type.id}`] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* In-App Toggle */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => handleToggle(`inapp_${type.id}`)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences[`inapp_${type.id}`] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={preferences[`inapp_${type.id}`]}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences[`inapp_${type.id}`] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Turn off notifications for events you don't want to be alerted about. 
            You can always change these settings later.
          </p>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;

