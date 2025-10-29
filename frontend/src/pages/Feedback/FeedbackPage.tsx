import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Inbox,
  SendHorizonal,
  User,
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  MinusCircle,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { feedbackService, Feedback, FeedbackCreate } from '../../services/feedbackService';
import { userService } from '../../services/userService';
import FeedbackThread from '../../components/Feedback/FeedbackThread';
import FeedbackTabs from '../../components/Feedback/FeedbackTabs';
import { useFeedbackSettings } from '../../hooks/useFeedbackSettings';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface UserOption {
  id: number;
  full_name: string;
  email: string;
}

const FeedbackPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { settings: feedbackSettings, loading: settingsLoading } = useFeedbackSettings();
  const [activeTab, setActiveTab] = useState<'create' | 'received' | 'sent' | 'all' | 'insights'>(
    'create'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Form state
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [recipientType, setRecipientType] = useState<'USER' | 'ADMIN' | 'EVERYONE'>('EVERYONE');
  const [recipientId, setRecipientId] = useState<number | undefined>(undefined);

  // Data state
  const [users, setUsers] = useState<UserOption[]>([]);
  const [receivedFeedback, setReceivedFeedback] = useState<Feedback[]>([]);
  const [sentFeedback, setSentFeedback] = useState<Feedback[]>([]);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.is_admin;

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
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'received') {
      loadReceivedFeedback();
    } else if (activeTab === 'sent') {
      loadSentFeedback();
    } else if (activeTab === 'all' && isAdmin) {
      loadAllFeedback();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadReceivedFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getMyFeedback();
      setReceivedFeedback(data);
    } catch (err) {
      setError('Failed to load received feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSentFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getSentFeedback();
      setSentFeedback(data);
    } catch (err) {
      setError('Failed to load sent feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getAllFeedback();
      setAllFeedback(data);
    } catch (err) {
      setError('Failed to load all feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!content.trim()) {
      setError('Please enter feedback content');
      return;
    }

    if (recipientType === 'USER' && !recipientId) {
      setError('Please select a recipient');
      return;
    }

    try {
      setLoading(true);
      const feedbackData: FeedbackCreate = {
        content: content.trim(),
        is_anonymous: isAnonymous,
        recipient_type: recipientType,
        recipient_id: recipientType === 'USER' ? recipientId : undefined,
      };

      await feedbackService.createFeedback(feedbackData);
      setSuccess('Feedback submitted successfully!');
      setContent('');
      setIsAnonymous(false);
      setRecipientType('EVERYONE');
      setRecipientId(undefined);

      // Refresh sent feedback
      if (activeTab === 'sent') {
        loadSentFeedback();
      }
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail || 'Failed to submit feedback';
      
      // Check if it's a moderation error
      if (errorDetail.includes('Content blocked by moderation')) {
        setError(`❌ ${errorDetail}\n\nPlease revise your feedback to use professional language.`);
      } else {
        setError(errorDetail);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (label?: string) => {
    switch (label) {
      case 'positive':
        return <CheckCircle style={{ width: '16px', height: '16px' }} />;
      case 'negative':
        return <AlertCircle style={{ width: '16px', height: '16px' }} />;
      case 'neutral':
        return <MinusCircle style={{ width: '16px', height: '16px' }} />;
      default:
        return null;
    }
  };

  const getSentimentColor = (label?: string) => {
    switch (label) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getRecipientDisplay = (feedback: Feedback) => {
    if (feedback.recipient_type === 'ADMIN') {
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          fontSize: '14px', 
          color: '#9333EA',
          gap: '4px',
        }}>
          <Shield style={{ width: '14px', height: '14px' }} />
          Admin
        </span>
      );
    } else if (feedback.recipient_type === 'EVERYONE') {
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          fontSize: '14px', 
          color: TRAXCIS_COLORS.primary.DEFAULT,
          gap: '4px',
        }}>
          <Users style={{ width: '14px', height: '14px' }} />
          Everyone
        </span>
      );
    } else {
      const recipient = users.find((u) => u.id === feedback.recipient_id);
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          fontSize: '14px', 
          color: isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[600],
          gap: '4px',
        }}>
          <User style={{ width: '14px', height: '14px' }} />
          {recipient?.full_name || 'Unknown User'}
        </span>
      );
    }
  };

  const renderFeedbackCard = (feedback: Feedback) => {
    // Only show top-level feedback (no parent_id)
    if (feedback.parent_id) return null;

    return (
      <FeedbackThread
        key={feedback.id}
        feedback={feedback}
        getSentimentColor={getSentimentColor}
        getSentimentIcon={getSentimentIcon}
        getRecipientDisplay={getRecipientDisplay}
        enableThreading={feedbackSettings.feedback_enable_threading}
        allowAnonymous={feedbackSettings.feedback_allow_anonymous}
      />
    );
  };

  // Theme colors
  const pageBg = isDark ? TRAXCIS_COLORS.secondary[900] : TRAXCIS_COLORS.neutral.light;
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px',
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Page Header */}
      <div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '500',
          color: textColor,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Outfit', sans-serif",
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageCircle style={{ width: '28px', height: '28px' }} />
            Feedback
          </span>
        </h1>
        <p style={{ 
          color: subTextColor, 
          fontWeight: '300',
          marginTop: '8px',
          fontSize: '15px',
        }}>
          Share feedback and insights with your team
        </p>
      </div>

      {/* Tabs */}
      <FeedbackTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showAdminTabs={isAdmin}
      />

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#D1FAE5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          {success}
        </motion.div>
      )}

      {/* Content */}
      {activeTab === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '16px',
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            padding: '24px',
          }}
        >
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            color: textColor,
          }}>
            Send Feedback
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Recipient Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: textColor,
                marginBottom: '12px',
              }}>
                Send To
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('EVERYONE');
                    setRecipientId(undefined);
                  }}
                  style={{
                    padding: '16px',
                    border: `2px solid ${recipientType === 'EVERYONE' ? TRAXCIS_COLORS.primary.DEFAULT : cardBorder}`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: recipientType === 'EVERYONE' 
                      ? (isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50])
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: recipientType === 'EVERYONE' ? TRAXCIS_COLORS.primary.DEFAULT : textColor,
                  }}
                  onMouseEnter={(e) => {
                    if (recipientType !== 'EVERYONE') {
                      e.currentTarget.style.borderColor = TRAXCIS_COLORS.secondary[400];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (recipientType !== 'EVERYONE') {
                      e.currentTarget.style.borderColor = cardBorder;
                    }
                  }}
                >
                  <Users style={{ width: '24px', height: '24px', marginBottom: '8px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Everyone</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('ADMIN');
                    setRecipientId(undefined);
                  }}
                  style={{
                    padding: '16px',
                    border: `2px solid ${recipientType === 'ADMIN' ? TRAXCIS_COLORS.primary.DEFAULT : cardBorder}`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: recipientType === 'ADMIN' 
                      ? (isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50])
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: recipientType === 'ADMIN' ? TRAXCIS_COLORS.primary.DEFAULT : textColor,
                  }}
                  onMouseEnter={(e) => {
                    if (recipientType !== 'ADMIN') {
                      e.currentTarget.style.borderColor = TRAXCIS_COLORS.secondary[400];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (recipientType !== 'ADMIN') {
                      e.currentTarget.style.borderColor = cardBorder;
                    }
                  }}
                >
                  <Shield style={{ width: '24px', height: '24px', marginBottom: '8px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('USER')}
                  style={{
                    padding: '16px',
                    border: `2px solid ${recipientType === 'USER' ? TRAXCIS_COLORS.primary.DEFAULT : cardBorder}`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: recipientType === 'USER' 
                      ? (isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50])
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: recipientType === 'USER' ? TRAXCIS_COLORS.primary.DEFAULT : textColor,
                  }}
                  onMouseEnter={(e) => {
                    if (recipientType !== 'USER') {
                      e.currentTarget.style.borderColor = TRAXCIS_COLORS.secondary[400];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (recipientType !== 'USER') {
                      e.currentTarget.style.borderColor = cardBorder;
                    }
                  }}
                >
                  <User style={{ width: '24px', height: '24px', marginBottom: '8px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Specific User</span>
                </button>
              </div>
            </div>

            {/* User Selection */}
            {recipientType === 'USER' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: textColor,
                  marginBottom: '8px',
                }}>
                  Select Recipient
                </label>
                <select
                  value={recipientId || ''}
                  onChange={(e) => setRecipientId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: "'Outfit', sans-serif",
                    backgroundColor: inputBg,
                    color: textColor,
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                    e.target.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = 'none';
                  }}
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Feedback Content */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: textColor,
                marginBottom: '8px',
              }}>
                Your Feedback
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'Outfit', sans-serif",
                  backgroundColor: inputBg,
                  color: textColor,
                  resize: 'vertical',
                  lineHeight: '1.5',
                }}
                onFocus={(e) => {
                  e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
                  e.target.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                }}
                placeholder="Share your thoughts, suggestions, or concerns..."
                required
              />
            </div>

            {/* Anonymous Option - Conditional based on settings */}
            {feedbackSettings.feedback_allow_anonymous && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{
                    height: '16px',
                    width: '16px',
                    marginRight: '8px',
                    cursor: 'pointer',
                  }}
                />
                <label 
                  htmlFor="anonymous" 
                  style={{ 
                    fontSize: '14px', 
                    color: textColor,
                    cursor: 'pointer',
                  }}
                >
                  Send anonymously
                  {isAnonymous && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: subTextColor }}>
                      (Your identity will be hidden from non-admins)
                    </span>
                  )}
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.primary.DEFAULT,
                color: '#FFFFFF',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: "'Outfit', sans-serif",
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700];
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT;
                }
              }}
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send style={{ width: '16px', height: '16px' }} />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {activeTab === 'received' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: textColor }}>
            Feedback Received
          </h2>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '64px 0',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRight: `3px solid ${cardBorder}`,
                borderBottom: `3px solid ${cardBorder}`,
                borderLeft: `3px solid ${cardBorder}`,
                borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }} />
            </div>
          ) : receivedFeedback.length === 0 ? (
            <div style={{
              backgroundColor: cardBg,
              borderRadius: '16px',
              boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: `1px solid ${cardBorder}`,
              padding: '64px',
              textAlign: 'center',
              color: subTextColor,
            }}>
              <Inbox style={{ width: '64px', height: '64px', margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '15px' }}>No feedback received yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {receivedFeedback.filter(f => !f.parent_id).map((feedback) => renderFeedbackCard(feedback))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'sent' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: textColor }}>
            Feedback Sent
          </h2>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '64px 0',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRight: `3px solid ${cardBorder}`,
                borderBottom: `3px solid ${cardBorder}`,
                borderLeft: `3px solid ${cardBorder}`,
                borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }} />
            </div>
          ) : sentFeedback.length === 0 ? (
            <div style={{
              backgroundColor: cardBg,
              borderRadius: '16px',
              boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: `1px solid ${cardBorder}`,
              padding: '64px',
              textAlign: 'center',
              color: subTextColor,
            }}>
              <SendHorizonal style={{ width: '64px', height: '64px', margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '15px' }}>No feedback sent yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sentFeedback.filter(f => !f.parent_id).map((feedback) => renderFeedbackCard(feedback))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'all' && isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: textColor }}>
            All Feedback (Admin View)
          </h2>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '64px 0',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRight: `3px solid ${cardBorder}`,
                borderBottom: `3px solid ${cardBorder}`,
                borderLeft: `3px solid ${cardBorder}`,
                borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }} />
            </div>
          ) : allFeedback.length === 0 ? (
            <div style={{
              backgroundColor: cardBg,
              borderRadius: '16px',
              boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: `1px solid ${cardBorder}`,
              padding: '64px',
              textAlign: 'center',
              color: subTextColor,
            }}>
              <Eye style={{ width: '64px', height: '64px', margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '15px' }}>No feedback in the system yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allFeedback.filter(f => !f.parent_id).map((feedback) => renderFeedbackCard(feedback))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'insights' && isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: cardBg,
            borderRadius: '16px',
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            padding: '64px',
          }}
        >
          <div style={{ textAlign: 'center', color: subTextColor }}>
            <TrendingUp style={{ width: '64px', height: '64px', margin: '0 auto 16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: textColor }}>
              Insights Dashboard
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>
              View detailed analytics and trends
            </p>
            <button
              onClick={() => (window.location.href = '/feedback/insights')}
              style={{
                backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
            >
              View Full Insights
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FeedbackPage;
