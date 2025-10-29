import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Inbox, Send, Eye, EyeOff, CheckCircle, AlertCircle, MinusCircle } from 'lucide-react';
import { feedbackService, Feedback } from '../../services/feedbackService';
import TRAXCIS_COLORS from '../../theme/traxcis';

const FeedbackCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedFeedback, setReceivedFeedback] = useState<Feedback[]>([]);
  const [sentFeedback, setSentFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
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
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const [received, sent] = await Promise.all([
        feedbackService.getMyFeedback(0, 50),
        feedbackService.getSentFeedback(0, 50),
      ]);
      setReceivedFeedback(received);
      setSentFeedback(sent);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentBadgeColors = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return {
          bg: isDark ? '#064E3B' : '#D1FAE5',
          text: isDark ? '#6EE7B7' : '#065F46',
          icon: <CheckCircle style={{ width: '14px', height: '14px' }} />,
        };
      case 'negative':
        return {
          bg: isDark ? '#7C2D12' : '#FEE2E2',
          text: isDark ? '#FCA5A5' : '#991B1B',
          icon: <AlertCircle style={{ width: '14px', height: '14px' }} />,
        };
      case 'neutral':
        return {
          bg: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
          text: isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[600],
          icon: <MinusCircle style={{ width: '14px', height: '14px' }} />,
        };
      default:
        return {
          bg: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
          text: isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[600],
          icon: <MessageCircle style={{ width: '14px', height: '14px' }} />,
        };
    }
  };

  const getRecipientLabel = (feedback: Feedback) => {
    switch (feedback.recipient_type) {
      case 'USER':
        return 'To: Specific User';
      case 'ADMIN':
        return 'To: Admin';
      case 'EVERYONE':
        return 'To: Everyone';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderFeedbackList = (feedbackList: Feedback[]) => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderLeft: `3px solid ${cardBorder}`,
            borderRight: `3px solid ${cardBorder}`,
            borderBottom: `3px solid ${cardBorder}`,
            borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: subTextColor, fontSize: '14px' }}>Loading feedback...</p>
        </div>
      );
    }

    if (feedbackList.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <MessageCircle style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: subTextColor, opacity: 0.3 }} />
          <p style={{ fontSize: '14px', color: subTextColor }}>
            No feedback found.
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {feedbackList.map((feedback) => {
          const sentimentColors = getSentimentBadgeColors(feedback.sentiment_label);
          
          return (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                border: `1px solid ${cardBorder}`,
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: sectionBg,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: subTextColor }}>
                      {activeTab === 'received'
                        ? `From: ${feedback.author_display || 'Anonymous'}`
                        : getRecipientLabel(feedback)}
                    </span>
                    {feedback.sentiment_label && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '500',
                        borderRadius: '9999px',
                        backgroundColor: sentimentColors.bg,
                        color: sentimentColors.text,
                      }}>
                        {sentimentColors.icon}
                        {feedback.sentiment_label}
                      </span>
                    )}
                    {feedback.is_anonymous && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '500',
                        borderRadius: '9999px',
                        backgroundColor: isDark ? '#581C87' : '#F3E8FF',
                        color: isDark ? '#E9D5FF' : '#6B21A8',
                      }}>
                        <EyeOff style={{ width: '12px', height: '12px' }} />
                        Anonymous
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: textColor, lineHeight: '1.5' }}>
                    {feedback.content}
                  </p>
                  {feedback.keywords && feedback.keywords.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      {feedback.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '2px 6px',
                            fontSize: '11px',
                            backgroundColor: isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50],
                            color: TRAXCIS_COLORS.primary.DEFAULT,
                            borderRadius: '4px',
                            fontWeight: '500',
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '11px', color: subTextColor }}>
                {formatDate(feedback.created_at)}
              </p>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Theme colors
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const sectionBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const tabContainerBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const inactiveText = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const hoverBg = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[100];

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
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: textColor }}>
        My Feedback
      </h2>

      {/* Tabs */}
      <div style={{
        backgroundColor: tabContainerBg,
        borderRadius: '12px',
        padding: '6px',
        marginBottom: '20px',
        border: `1px solid ${cardBorder}`,
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'received' as const, label: 'Received', icon: Inbox, count: receivedFeedback.length },
            { id: 'sent' as const, label: 'Sent', icon: Send, count: sentFeedback.length },
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
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback List */}
      {activeTab === 'received'
        ? renderFeedbackList(receivedFeedback)
        : renderFeedbackList(sentFeedback)}
    </motion.div>
  );
};

export default FeedbackCard;
