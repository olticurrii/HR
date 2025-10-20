import React, { useState, useEffect } from 'react';
import { UserSession } from '../../services/profileService';

interface SecurityCardProps {
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onGetSessions: () => Promise<UserSession[]>;
  onRevokeSession: (sessionId?: number, revokeAll?: boolean) => Promise<void>;
  onToggle2FA: () => Promise<{ enabled: boolean; message: string }>;
}

const SecurityCard: React.FC<SecurityCardProps> = ({
  onChangePassword,
  onGetSessions,
  onRevokeSession,
  onToggle2FA,
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'sessions' | '2fa'>('password');
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'sessions') {
      loadSessions();
    }
  }, [activeTab]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await onGetSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      alert('New password must be at least 8 characters long');
      return;
    }

    try {
      await onChangePassword(passwordForm.current_password, passwordForm.new_password);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to change password');
    }
  };

  const handleRevokeSession = async (sessionId: number) => {
    if (window.confirm('Are you sure you want to revoke this session?')) {
      try {
        await onRevokeSession(sessionId, false);
        await loadSessions();
      } catch (error) {
        alert('Failed to revoke session');
      }
    }
  };

  const handleRevokeAll = async () => {
    if (window.confirm('Are you sure you want to revoke all sessions? You will need to log in again.')) {
      try {
        await onRevokeSession(undefined, true);
        // User will be logged out
      } catch (error) {
        alert('Failed to revoke all sessions');
      }
    }
  };

  const handle2FAToggle = async () => {
    try {
      const result = await onToggle2FA();
      alert(result.message);
    } catch (error) {
      alert('Failed to toggle 2FA');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Security</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('password')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'password'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'sessions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('2fa')}
          className={`pb-2 px-1 font-medium ${
            activeTab === '2fa'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Two-Factor Auth
        </button>
      </div>

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, current_password: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, new_password: e.target.value })
              }
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Change Password
          </button>
        </form>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div>
          {loading ? (
            <p className="text-gray-500">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500">No active sessions found.</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 border rounded-lg ${
                      session.is_current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {session.device_info || 'Unknown Device'}
                          </p>
                          {session.is_current && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          IP: {session.ip_address || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {formatDate(session.created_at)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last seen: {formatDate(session.last_seen)}
                        </p>
                      </div>
                      {!session.is_current && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleRevokeAll}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Revoke All Sessions
              </button>
            </>
          )}
        </div>
      )}

      {/* 2FA Tab */}
      {activeTab === '2fa' && (
        <div>
          <p className="text-gray-700 mb-4">
            Two-factor authentication adds an extra layer of security to your account.
          </p>
          <button
            onClick={handle2FAToggle}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Enable Two-Factor Authentication
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Note: 2FA is currently not implemented. This is a placeholder for future functionality.
          </p>
        </div>
      )}
    </div>
  );
};

export default SecurityCard;

