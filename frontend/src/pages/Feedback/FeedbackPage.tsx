import React, { useState, useEffect } from 'react';
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
  EyeOff,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { feedbackService, Feedback, FeedbackCreate } from '../../services/feedbackService';
import { userService } from '../../services/userService';
import FeedbackThread from '../../components/Feedback/FeedbackThread';
import { useFeedbackSettings } from '../../hooks/useFeedbackSettings';

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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'neutral':
        return <MinusCircle className="w-5 h-5 text-gray-500" />;
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
        <span className="inline-flex items-center text-sm text-purple-600">
          <Shield className="w-4 h-4 mr-1" />
          Admin
        </span>
      );
    } else if (feedback.recipient_type === 'EVERYONE') {
      return (
        <span className="inline-flex items-center text-sm text-primary">
          <Users className="w-4 h-4 mr-1" />
          Everyone
        </span>
      );
    } else {
      const recipient = users.find((u) => u.id === feedback.recipient_id);
      return (
        <span className="inline-flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-1" />
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white flex flex-col">
          <span className="flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            Feedback
          </span>
          <span className="accent-line mt-2"></span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-light">Share feedback and insights with your team</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Send Feedback
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'received'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Inbox className="w-4 h-4 inline mr-2" />
            Received
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sent'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <SendHorizonal className="w-4 h-4 inline mr-2" />
            Sent
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                All Feedback
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'insights'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Insights
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Content */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Send Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send To
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('EVERYONE');
                    setRecipientId(undefined);
                  }}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center ${
                    recipientType === 'EVERYONE'
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Everyone</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('ADMIN');
                    setRecipientId(undefined);
                  }}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center ${
                    recipientType === 'ADMIN'
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Shield className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('USER')}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center ${
                    recipientType === 'USER'
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Specific User</span>
                </button>
              </div>
            </div>

            {/* User Selection */}
            {recipientType === 'USER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Recipient
                </label>
                <select
                  value={recipientId || ''}
                  onChange={(e) => setRecipientId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Share your thoughts, suggestions, or concerns..."
                required
              />
            </div>

            {/* Anonymous Option - Conditional based on settings */}
            {feedbackSettings.feedback_allow_anonymous && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                  Send anonymously
                  {isAnonymous && (
                    <span className="ml-2 text-xs text-gray-500">
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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'received' && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Feedback Received</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : receivedFeedback.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No feedback received yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedFeedback.filter(f => !f.parent_id).map((feedback) => renderFeedbackCard(feedback))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sent' && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Feedback Sent</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : sentFeedback.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <SendHorizonal className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No feedback sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentFeedback.filter(f => !f.parent_id).map((feedback) => renderFeedbackCard(feedback))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'all' && isAdmin && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">All Feedback (Admin View)</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : allFeedback.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No feedback in the system yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allFeedback.filter(f => !f.parent_id).map((feedback) => renderFeedbackCard(feedback))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'insights' && isAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Insights Dashboard</h3>
            <p className="text-sm">View detailed analytics and trends</p>
            <button
              onClick={() => (window.location.href = '/feedback/insights')}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              View Full Insights
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
