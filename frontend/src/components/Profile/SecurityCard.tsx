import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Key, Monitor, Shield, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { UserSession } from '../../services/profileService';
import TRAXCIS_COLORS from '../../theme/traxcis';

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

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300];
  const tabContainerBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const inactiveText = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const hoverBg = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[100];
  const sessionBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];

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
      <h2 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '20px',
        color: textColor,
      }}>
        Security
      </h2>

      {/* Sub-tabs */}
      <div style={{
        backgroundColor: tabContainerBg,
        borderRadius: '12px',
        padding: '6px',
        marginBottom: '24px',
        border: `1px solid ${cardBorder}`,
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'password' as const, label: 'Password', icon: Key },
            { id: 'sessions' as const, label: 'Sessions', icon: Monitor },
            { id: '2fa' as const, label: 'Two-Factor', icon: Shield },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? TRAXCIS_COLORS.primary.DEFAULT : 'transparent',
                  color: isActive ? '#FFFFFF' : inactiveText,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = hoverBg;
                    e.currentTarget.style.color = TRAXCIS_COLORS.primary.DEFAULT;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = inactiveText;
                  }
                }}
              >
                <TabIcon style={{ width: '14px', height: '14px' }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: textColor,
              marginBottom: '6px',
            }}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, current_password: e.target.value })
              }
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
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
              fontSize: '14px',
              fontWeight: '500',
              color: textColor,
              marginBottom: '6px',
            }}>
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
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
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
            <p style={{ fontSize: '12px', color: subTextColor, marginTop: '4px' }}>
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: textColor,
              marginBottom: '6px',
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
              }
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
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

          <button
            type="submit"
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
              alignSelf: 'flex-start',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
          >
            Change Password
          </button>
        </form>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: `3px solid ${cardBorder}`,
                borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }} />
              <p style={{ color: subTextColor, fontSize: '14px' }}>Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Monitor style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: subTextColor, opacity: 0.3 }} />
              <p style={{ color: subTextColor, fontSize: '14px' }}>No active sessions found.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '16px',
                      border: session.is_current 
                        ? `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`
                        : `1px solid ${cardBorder}`,
                      borderRadius: '8px',
                      backgroundColor: session.is_current
                        ? (isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50])
                        : sessionBg,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Monitor style={{ width: '16px', height: '16px', color: subTextColor }} />
                          <span style={{ fontSize: '14px', fontWeight: '500', color: textColor }}>
                            {session.device_info || 'Unknown Device'}
                          </span>
                          {session.is_current && (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                              color: '#FFFFFF',
                              borderRadius: '4px',
                              fontWeight: '600',
                            }}>
                              Current
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '13px', color: subTextColor, marginBottom: '2px' }}>
                          IP: {session.ip_address || 'Unknown'}
                        </p>
                        <p style={{ fontSize: '12px', color: subTextColor }}>
                          Created: {formatDate(session.created_at)}
                        </p>
                        <p style={{ fontSize: '12px', color: subTextColor }}>
                          Last seen: {formatDate(session.last_seen)}
                        </p>
                      </div>
                      {!session.is_current && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          style={{
                            fontSize: '13px',
                            color: TRAXCIS_COLORS.status.error,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={handleRevokeAll}
                style={{
                  padding: '10px 20px',
                  backgroundColor: TRAXCIS_COLORS.status.error,
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.status.error}
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
          <p style={{
            fontSize: '14px',
            color: textColor,
            marginBottom: '16px',
            lineHeight: '1.6',
          }}>
            Two-factor authentication adds an extra layer of security to your account.
          </p>
          <button
            onClick={handle2FAToggle}
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
              marginBottom: '12px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
          >
            Enable Two-Factor Authentication
          </button>
          <p style={{
            fontSize: '13px',
            color: subTextColor,
            padding: '12px',
            backgroundColor: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
            borderRadius: '6px',
            border: `1px solid ${cardBorder}`,
          }}>
            Note: 2FA is currently not implemented. This is a placeholder for future functionality.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default SecurityCard;
