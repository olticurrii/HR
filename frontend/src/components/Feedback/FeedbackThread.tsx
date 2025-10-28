import React, { useState, useEffect } from 'react';
import { User, EyeOff, Reply, AlertTriangle, MessageSquare } from 'lucide-react';
import { Feedback, feedbackService } from '../../services/feedbackService';
import { useAuth } from '../../contexts/AuthContext';

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

  const isAdmin = currentUser?.role === 'admin' || currentUser?.is_admin;

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

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Flagged Indicator */}
      {feedback.is_flagged && isAdmin && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center text-sm text-yellow-800">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span>Flagged: {feedback.flagged_reason}</span>
        </div>
      )}

      {/* Main Feedback */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {feedback.author_display === 'Anonymous' ? (
            <div className="flex items-center text-gray-500">
              <EyeOff className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Anonymous</span>
            </div>
          ) : (
            <div className="flex items-center text-gray-700">
              <User className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{feedback.author_display}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {feedback.sentiment_label && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getSentimentColor(
                feedback.sentiment_label
              )}`}
            >
              {getSentimentIcon(feedback.sentiment_label)}
              <span className="ml-1 capitalize">{feedback.sentiment_label}</span>
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{feedback.content}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span>To: {getRecipientDisplay(feedback)}</span>
          <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
        </div>
        {feedback.keywords && feedback.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {feedback.keywords.slice(0, 3).map((keyword, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-primary-50 text-primary rounded">
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reply Actions - Conditional based on threading setting */}
      {enableThreading && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-3">
          {feedback.reply_count > 0 && (
            <button
              onClick={() => {
                if (showReplies) {
                  setShowReplies(false);
                } else {
                  loadReplies();
                }
              }}
              className="text-sm text-primary hover:text-blue-700 flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              {showReplies ? 'Hide' : 'View'} {feedback.reply_count} {feedback.reply_count === 1 ? 'reply' : 'replies'}
            </button>
          )}
          
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-3 p-3 bg-gray-50 rounded-lg">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Write your reply..."
            required
          />
          <div className="mt-2 flex items-center justify-between">
            {allowAnonymous && (
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={isAnonymousReply}
                  onChange={(e) => setIsAnonymousReply(e.target.checked)}
                  className="h-3 w-3 text-primary border-gray-300 rounded mr-2"
                />
                Reply anonymously
              </label>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                  setIsAnonymousReply(false);
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Replies Thread */}
      {showReplies && (
        <div className="mt-3 pl-6 border-l-2 border-gray-200 space-y-3">
          {loadingReplies ? (
            <div className="text-sm text-gray-500">Loading replies...</div>
          ) : replies.length === 0 ? (
            <div className="text-sm text-gray-500">No replies yet</div>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {reply.author_display === 'Anonymous' ? (
                      <div className="flex items-center text-gray-500">
                        <EyeOff className="w-3 h-3 mr-1" />
                        <span className="text-xs font-medium">Anonymous</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-700">
                        <User className="w-3 h-3 mr-1" />
                        <span className="text-xs font-medium">{reply.author_display}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(reply.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                {reply.sentiment_label && (
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${getSentimentColor(reply.sentiment_label)}`}>
                    {reply.sentiment_label}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackThread;

