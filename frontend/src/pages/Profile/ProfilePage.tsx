import React, { useState, useEffect } from 'react';
import profileService, { UserProfile, ProfileUpdate } from '../../services/profileService';
import ProfileInfoCard from '../../components/Profile/ProfileInfoCard';
import SecurityCard from '../../components/Profile/SecurityCard';
import PerformanceCard from '../../components/Profile/PerformanceCard';
import FeedbackCard from '../../components/Profile/FeedbackCard';
import PreferencesCard from '../../components/Profile/PreferencesCard';
import NotificationPreferencesCard from '../../components/Profile/NotificationPreferencesCard';
import TopPerformerBadge from '../../components/Performance/TopPerformerBadge';

type Section = 'profile' | 'security' | 'performance' | 'feedback' | 'preferences' | 'notifications';

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadProfile = async () => {
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
  };

  const handleUpdateProfile = async (data: ProfileUpdate) => {
    try {
      const updated = await profileService.updateMyProfile(data);
      setProfile(updated);
      showToast('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Failed to update profile', 'error');
      throw error;
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const result = await profileService.uploadAvatar(file);
      if (profile) {
        setProfile({ ...profile, avatar_url: result.avatar_url });
      }
      showToast('Avatar uploaded successfully');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      showToast('Failed to upload avatar', 'error');
      throw error;
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await profileService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showToast('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  };

  const handleGetSessions = async () => {
    return await profileService.getMySessions();
  };

  const handleRevokeSession = async (sessionId?: number, revokeAll?: boolean) => {
    try {
      await profileService.revokeSessions({ session_id: sessionId, revoke_all: revokeAll });
      showToast('Session(s) revoked successfully');
    } catch (error) {
      console.error('Failed to revoke session:', error);
      showToast('Failed to revoke session', 'error');
      throw error;
    }
  };

  const handleToggle2FA = async () => {
    return await profileService.toggle2FA();
  };

  const handleGetPerformance = async (windowDays: number) => {
    return await profileService.getPerformanceSummary(windowDays);
  };

  const sections = [
    { id: 'profile' as Section, label: 'Profile', icon: '👤' },
    { id: 'security' as Section, label: 'Security', icon: '🔒' },
    { id: 'performance' as Section, label: 'Performance', icon: '📊' },
    { id: 'feedback' as Section, label: 'My Feedback', icon: '💬' },
    { id: 'notifications' as Section, label: 'Notifications', icon: '🔔' },
    { id: 'preferences' as Section, label: 'Preferences', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Failed to load profile</p>
          <button
            onClick={loadProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <span className="text-green-600 text-xl">✓</span>
            <p className="text-gray-800">{toastMessage}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>
            <div>
              <TopPerformerBadge userId={profile.id} size="lg" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow p-4 sticky top-8">
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{section.icon}</span>
                      <span>{section.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 min-w-0">
            {activeSection === 'profile' && (
              <ProfileInfoCard
                profile={profile}
                onUpdate={handleUpdateProfile}
                onAvatarUpload={handleAvatarUpload}
              />
            )}

            {activeSection === 'security' && (
              <SecurityCard
                onChangePassword={handleChangePassword}
                onGetSessions={handleGetSessions}
                onRevokeSession={handleRevokeSession}
                onToggle2FA={handleToggle2FA}
              />
            )}

            {activeSection === 'performance' && (
              <PerformanceCard onGetPerformance={handleGetPerformance} />
            )}

            {activeSection === 'feedback' && <FeedbackCard />}

            {activeSection === 'notifications' && <NotificationPreferencesCard />}

            {activeSection === 'preferences' && (
              <PreferencesCard profile={profile} onUpdate={handleUpdateProfile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
