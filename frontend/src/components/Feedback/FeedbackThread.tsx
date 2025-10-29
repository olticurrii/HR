import React, { useState, useEffect } from 'react';
import { User, EyeOff, Reply, AlertTriangle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Feedback, feedbackService } from '../../services/feedbackService';
import { useAuth } from '../../contexts/AuthContext';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface FeedbackThreadProps {
  feedback: Feedback;
  onReply?: () => void;
  getSentimentColor: (label?: string) => string;
  getSentimentIcon: (label?: string) => React.ReactNode;
  getRecipientDisplay: (feedback: Feedback) => React.ReactNode;
  enableThreading?: boolean;
  allowAnonymous?: boolean;
}

const FeedbackThread: React.FC<FeedbackThreadProps> = ({
  feedback,
  onReply,
  getSentimentColor,
  getSentimentIcon,
  getRecipientDisplay,
  enableThreading = true,
  allowAnonymous = true,
}) => {
  const { user: currentUser } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Feedback[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isAnonymousReply, setIsAnonymousReply] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  const loadReplies = async () => {
    if (feedback.reply_count === 0) return;
    
    setLoadingReplies(true);
    try {
      const data = await feedbackService.getReplies(feedback.id);
      setReplies(data);
      setShowReplies(true);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;

    try {
      await feedbackService.createFeedback({
        content: replyContent.trim(),
        is_anonymous: isAnonymousReply,
        recipient_type: feedback.recipient_type,
        recipient_id: feedback.recipient_id,
        parent_id: feedback.id,
      });

      setReplyContent('');
      setIsAnonymousReply(false);
      setShowReplyForm(false);
      
      // Reload replies
      await loadReplies();
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail || 'Failed to submit reply';
      
      // Check if it's a moderation error
      if (errorDetail.includes('Content blocked by moderation')) {
        alert(`❌ ${errorDetail}\n\nPlease revise your reply to use professional language.`);
      } else {
        alert('Failed to submit reply. Please try again.');
      }
      console.error('Failed to submit reply:', error);
    }
  };

  // Theme colors
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300];
  const replyBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        fontFamily: "'Outfit', sans-serif",
      }}
      whileHover={{
        boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Flagged Indicator */}
      {feedback.is_flagged && isAdmin && (
        <div style={{
          marginBottom: '16px',
          padding: '8px 12px',
          backgroundColor: '#FEF3C7',
          border: `1px solid #FDE68A`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          color: '#92400E',
        }}>
          <AlertTriangle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          <span>Flagged: {feedback.flagged_reason}</span>
        </div>
      )}

      {/* Main Feedback */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {feedback.author_display === 'Anonymous' ? (
            <div style={{ display: 'flex', alignItems: 'center', color: subTextColor }}>
              <EyeOff style={{ width: '16px', height: '16px', marginRight: '6px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Anonymous</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', color: textColor }}>
              <User style={{ width: '16px', height: '16px', marginRight: '6px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{feedback.author_display}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {feedback.sentiment_label && (
            <span
              className={getSentimentColor(feedback.sentiment_label)}
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {getSentimentIcon(feedback.sentiment_label)}
              <span style={{ textTransform: 'capitalize' }}>{feedback.sentiment_label}</span>
            </span>
          )}
        </div>
      </div>

      <p style={{ 
        color: textColor, 
        marginBottom: '16px', 
        whiteSpace: 'pre-wrap',
        fontSize: '14px',
        lineHeight: '1.6',
      }}>
        {feedback.content}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: subTextColor,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>To: {getRecipientDisplay(feedback)}</span>
          <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
        </div>
        {feedback.keywords && feedback.keywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {feedback.keywords.slice(0, 3).map((keyword, idx) => (
              <span 
                key={idx} 
                style={{
                  padding: '2px 8px',
                  backgroundColor: isDark ? TRAXCIS_COLORS.primary[900] : TRAXCIS_COLORS.primary[50],
                  color: TRAXCIS_COLORS.primary.DEFAULT,
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reply Actions - Conditional based on threading setting */}
      {enableThreading && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: `1px solid ${cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          {feedback.reply_count > 0 && (
            <button
              onClick={() => {
                if (showReplies) {
                  setShowReplies(false);
                } else {
                  loadReplies();
                }
              }}
              style={{
                fontSize: '14px',
                color: TRAXCIS_COLORS.primary.DEFAULT,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '500',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = TRAXCIS_COLORS.primary[700]}
              onMouseLeave={(e) => e.currentTarget.style.color = TRAXCIS_COLORS.primary.DEFAULT}
            >
              <MessageSquare style={{ width: '16px', height: '16px' }} />
              {showReplies ? 'Hide' : 'View'} {feedback.reply_count} {feedback.reply_count === 1 ? 'reply' : 'replies'}
            </button>
          )}
          
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            style={{
              fontSize: '14px',
              color: subTextColor,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: '500',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = textColor}
            onMouseLeave={(e) => e.currentTarget.style.color = subTextColor}
          >
            <Reply style={{ width: '16px', height: '16px' }} />
            Reply
          </button>
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <form 
          onSubmit={handleReplySubmit} 
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: replyBg,
            borderRadius: '8px',
          }}
        >
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${inputBorder}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif",
              backgroundColor: inputBg,
              color: textColor,
              resize: 'vertical',
            }}
            onFocus={(e) => {
              e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
              e.target.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
            }}
            placeholder="Write your reply..."
            required
          />
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {allowAnonymous && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: textColor,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={isAnonymousReply}
                  onChange={(e) => setIsAnonymousReply(e.target.checked)}
                  style={{
                    height: '16px',
                    width: '16px',
                    marginRight: '8px',
                    cursor: 'pointer',
                  }}
                />
                Reply anonymously
              </label>
            )}
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                  setIsAnonymousReply(false);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  color: subTextColor,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: '500',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = textColor}
                onMouseLeave={(e) => e.currentTarget.style.color = subTextColor}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
              >
                <Reply style={{ width: '14px', height: '14px' }} />
                Reply
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Replies Thread */}
      {showReplies && (
        <div style={{
          marginTop: '16px',
          paddingLeft: '24px',
          borderLeft: `2px solid ${cardBorder}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {loadingReplies ? (
            <div style={{ fontSize: '14px', color: subTextColor }}>Loading replies...</div>
          ) : replies.length === 0 ? (
            <div style={{ fontSize: '14px', color: subTextColor }}>No replies yet</div>
          ) : (
            replies.map((reply) => (
              <motion.div 
                key={reply.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  backgroundColor: replyBg,
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {reply.author_display === 'Anonymous' ? (
                      <div style={{ display: 'flex', alignItems: 'center', color: subTextColor }}>
                        <EyeOff style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                        <span style={{ fontSize: '12px', fontWeight: '500' }}>Anonymous</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', color: textColor }}>
                        <User style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                        <span style={{ fontSize: '12px', fontWeight: '500' }}>{reply.author_display}</span>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: subTextColor }}>
                    {new Date(reply.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: textColor,
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5',
                }}>
                  {reply.content}
                </p>
                {reply.sentiment_label && (
                  <span 
                    className={getSentimentColor(reply.sentiment_label)}
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: '500',
                    }}
                  >
                    {reply.sentiment_label}
                  </span>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FeedbackThread;

