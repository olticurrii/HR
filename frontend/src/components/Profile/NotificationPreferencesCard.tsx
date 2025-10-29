import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, Smartphone, Monitor, Wifi, WifiOff, Save, CheckCircle, AlertCircle, X } from 'lucide-react';
import { notificationService, NotificationPreferences } from '../../services/notificationService';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import TRAXCIS_COLORS from '../../theme/traxcis';

const NotificationPreferencesCard: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDark, setIsDark] = useState(false);
  
  const {
    isSupported: pushSupported,
    permission: pushPermission,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    error: pushError,
    toggleSubscription: togglePushSubscription
  } = usePushNotifications();

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
      setTimeout(() => setMessage(null), 3000);
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

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const sectionBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const infoBg = isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50];
  const infoBorder = isDark ? TRAXCIS_COLORS.primary[700] : TRAXCIS_COLORS.primary[200];
  const infoText = isDark ? TRAXCIS_COLORS.primary[100] : TRAXCIS_COLORS.primary[900];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: cardBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          padding: '24px',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '16px',
                backgroundColor: sectionBg,
                borderRadius: '4px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!preferences) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: cardBg,
          borderRadius: '16px',
          boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: `1px solid ${cardBorder}`,
          padding: '24px',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <p style={{ color: subTextColor, fontSize: '14px' }}>Failed to load notification preferences</p>
      </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: cardBg,
        borderRadius: '16px',
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: `1px solid ${cardBorder}`,
        padding: '24px',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell style={{ width: '20px', height: '20px', color: textColor }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: textColor }}>
            Notification Preferences
          </h2>
        </div>
        <button
          onClick={savePreferences}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: saving ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.primary.DEFAULT,
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700];
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT;
            }
          }}
        >
          {saving ? (
            <>
              <div style={{
                width: '14px',
                height: '14px',
                borderLeft: '2px solid rgba(255,255,255,0.3)',
                borderRight: '2px solid rgba(255,255,255,0.3)',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid #FFFFFF',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }} />
              Saving...
            </>
          ) : (
            <>
              <Save style={{ width: '16px', height: '16px' }} />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginBottom: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
              border: message.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
              color: message.type === 'success' ? '#065F46' : '#991B1B',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {message.type === 'success' ? (
              <CheckCircle style={{ width: '16px', height: '16px' }} />
            ) : (
              <AlertCircle style={{ width: '16px', height: '16px' }} />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Push Notification Status */}
      {pushSupported && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: infoBg,
          borderRadius: '8px',
          border: `1px solid ${infoBorder}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
              {pushSubscribed ? (
                <Wifi style={{ width: '20px', height: '20px', color: TRAXCIS_COLORS.status.success }} />
              ) : (
                <WifiOff style={{ width: '20px', height: '20px', color: subTextColor }} />
              )}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: infoText, marginBottom: '4px' }}>
                  Push Notifications (Optional)
                </h4>
                <p style={{ fontSize: '13px', color: infoText, marginBottom: '4px' }}>
                  {pushSubscribed 
                    ? 'Enabled - You will receive browser push notifications' 
                    : 'Not configured - In-app notifications are working'
                  }
                </p>
                {pushError && (
                  <p style={{ fontSize: '12px', color: TRAXCIS_COLORS.status.warning, marginTop: '4px' }}>
                    {pushError.includes('not configured') ? 'ℹ️ ' : '⚠️ '}{pushError}
                  </p>
                )}
                <p style={{ fontSize: '11px', color: infoText, marginTop: '4px', opacity: 0.8 }}>
                  Note: In-app notifications work without push notifications
                </p>
              </div>
            </div>
            <button
              onClick={togglePushSubscription}
              disabled={pushLoading || pushPermission === 'denied'}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                border: 'none',
                cursor: pushLoading || pushPermission === 'denied' ? 'not-allowed' : 'pointer',
                opacity: pushLoading || pushPermission === 'denied' ? 0.5 : 1,
                transition: 'background-color 0.2s ease',
                backgroundColor: pushSubscribed
                  ? TRAXCIS_COLORS.status.error
                  : (isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200]),
                color: pushSubscribed
                  ? '#FFFFFF'
                  : textColor,
              }}
              onMouseEnter={(e) => {
                if (!pushLoading && pushPermission !== 'denied') {
                  e.currentTarget.style.backgroundColor = pushSubscribed
                    ? '#DC2626'
                    : (isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300]);
                }
              }}
              onMouseLeave={(e) => {
                if (!pushLoading && pushPermission !== 'denied') {
                  e.currentTarget.style.backgroundColor = pushSubscribed
                    ? TRAXCIS_COLORS.status.error
                    : (isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200]);
                }
              }}
            >
              {pushLoading ? 'Loading...' : pushSubscribed ? 'Disable' : 'Setup Push'}
            </button>
          </div>
        </div>
      )}

      {/* Channel Toggle All */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {[
          { type: 'email' as const, label: 'Email', icon: Mail },
          { type: 'inapp' as const, label: 'In-App', icon: Monitor },
          { type: 'push' as const, label: 'Push', icon: Smartphone },
        ].map((channel) => {
          const ChannelIcon = channel.icon;
          
          return (
            <div
              key={channel.type}
              style={{
                backgroundColor: sectionBg,
                borderRadius: '8px',
                padding: '16px',
                border: `1px solid ${cardBorder}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ChannelIcon style={{ width: '16px', height: '16px', color: subTextColor }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
                    {channel.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => toggleAllForType(channel.type, true)}
                    style={{
                      fontSize: '12px',
                      color: TRAXCIS_COLORS.primary.DEFAULT,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => toggleAllForType(channel.type, false)}
                    style={{
                      fontSize: '12px',
                      color: subTextColor,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    None
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {notificationCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.05 }}
          >
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: textColor,
              marginBottom: '12px',
            }}>
              {category.title}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px',
            }}>
              {category.items.map((item) => (
                <div
                  key={item.key}
                  style={{
                    backgroundColor: sectionBg,
                    borderRadius: '8px',
                    padding: '14px',
                    border: `1px solid ${cardBorder}`,
                  }}
                >
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: textColor, fontWeight: '500' }}>
                      {item.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                        onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: TRAXCIS_COLORS.primary.DEFAULT,
                        }}
                      />
                      <Mail style={{ width: '14px', height: '14px', color: subTextColor }} />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences[item.key.replace('email_', 'inapp_') as keyof NotificationPreferences] as boolean}
                        onChange={(e) => updatePreference(item.key.replace('email_', 'inapp_') as keyof NotificationPreferences, e.target.checked)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: TRAXCIS_COLORS.primary.DEFAULT,
                        }}
                      />
                      <Monitor style={{ width: '14px', height: '14px', color: subTextColor }} />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences[item.key.replace('email_', 'push_') as keyof NotificationPreferences] as boolean}
                        onChange={(e) => updatePreference(item.key.replace('email_', 'push_') as keyof NotificationPreferences, e.target.checked)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: TRAXCIS_COLORS.primary.DEFAULT,
                        }}
                      />
                      <Smartphone style={{ width: '14px', height: '14px', color: subTextColor }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default NotificationPreferencesCard;
