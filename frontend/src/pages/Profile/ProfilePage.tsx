import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, TrendingUp, MessageCircle, Bell, Settings as SettingsIcon } from 'lucide-react';
import profileService, { UserProfile, ProfileUpdate } from '../../services/profileService';
import ProfileInfoCard from '../../components/Profile/ProfileInfoCard';
import SecurityCard from '../../components/Profile/SecurityCard';
import PerformanceCard from '../../components/Profile/PerformanceCard';
import FeedbackCard from '../../components/Profile/FeedbackCard';
import PreferencesCard from '../../components/Profile/PreferencesCard';
import NotificationPreferencesCard from '../../components/Profile/NotificationPreferencesCard';
import TopPerformerBadge from '../../components/Performance/TopPerformerBadge';
import TRAXCIS_COLORS from '../../theme/traxcis';

type Section = 'profile' | 'security' | 'performance' | 'feedback' | 'preferences' | 'notifications';

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

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
    { id: 'profile' as Section, label: 'Profile', icon: User },
    { id: 'security' as Section, label: 'Security', icon: Lock },
    { id: 'performance' as Section, label: 'Performance', icon: TrendingUp },
    { id: 'feedback' as Section, label: 'My Feedback', icon: MessageCircle },
    { id: 'notifications' as Section, label: 'Notifications', icon: Bell },
    { id: 'preferences' as Section, label: 'Preferences', icon: SettingsIcon },
  ];

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const tabContainerBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const tabBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const inactiveText = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const hoverBg = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[100];

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
            <User style={{ width: '28px', height: '28px' }} />
            My Profile
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            Manage your account settings and preferences
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
            borderLeft: `3px solid ${cardBorder}`,
            borderRight: `3px solid ${cardBorder}`,
            borderBottom: `3px solid ${cardBorder}`,
            borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: subTextColor, fontSize: '14px' }}>Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
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
            <User style={{ width: '28px', height: '28px' }} />
            My Profile
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', marginTop: '8px', fontSize: '15px' }}>
            Manage your account settings and preferences
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
          <p style={{ fontSize: '16px', color: TRAXCIS_COLORS.status.error, marginBottom: '16px' }}>
            Failed to load profile
          </p>
          <button
            onClick={loadProfile}
            style={{
              padding: '10px 20px',
              backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Outfit', sans-serif" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 50,
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              boxShadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '20px', color: TRAXCIS_COLORS.status.success }}>✓</span>
            <p style={{ fontSize: '14px', color: textColor }}>{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

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
            <User style={{ width: '28px', height: '28px' }} />
            My Profile
          </h1>
          <p style={{ color: subTextColor, fontWeight: '300', fontSize: '15px' }}>
            Manage your account settings and preferences
          </p>
        </div>
        
        <div>
          <TopPerformerBadge userId={profile.id} size="lg" />
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: tabContainerBg,
          borderRadius: '16px',
          padding: '8px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${tabBorder}`,
        }}
      >
        <nav style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }} role="tablist">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const SectionIcon = section.icon;
            
            return (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  fontSize: '14px',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? TRAXCIS_COLORS.accent.DEFAULT : 'transparent',
                  color: isActive ? '#FFFFFF' : inactiveText,
                  boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                }}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = TRAXCIS_COLORS.accent.DEFAULT;
                    e.currentTarget.style.backgroundColor = hoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = inactiveText;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                role="tab"
                aria-selected={isActive}
              >
                <SectionIcon style={{ width: '16px', height: '16px' }} />
                <span>{section.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </motion.div>

      {/* Content Panel */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
      </motion.div>
    </div>
  );
};

export default ProfilePage;
