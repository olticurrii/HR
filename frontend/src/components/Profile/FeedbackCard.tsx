import React, { useState, useEffect } from 'react';
import { feedbackService, Feedback } from '../../services/feedbackService';

const FeedbackCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedFeedback, setReceivedFeedback] = useState<Feedback[]>([]);
  const [sentFeedback, setSentFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      case 'neutral':
        return '😐';
      default:
        return '💬';
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
      return <p className="text-gray-500">Loading feedback...</p>;
    }

    if (feedbackList.length === 0) {
      return (
        <p className="text-gray-500 text-center py-8">
          No feedback found.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {feedbackList.map((feedback) => (
          <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">
                    {activeTab === 'received'
                      ? `From: ${feedback.author_display || 'Anonymous'}`
                      : getRecipientLabel(feedback)}
                  </span>
                  {feedback.sentiment_label && (
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${getSentimentColor(
                        feedback.sentiment_label
                      )}`}
                    >
                      {getSentimentIcon(feedback.sentiment_label)}{' '}
                      {feedback.sentiment_label}
                    </span>
                  )}
                  {feedback.is_anonymous && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
                      Anonymous
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm">{feedback.content}</p>
                {feedback.keywords && feedback.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {feedback.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {formatDate(feedback.created_at)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">My Feedback</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'received'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received ({receivedFeedback.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'sent'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent ({sentFeedback.length})
        </button>
      </div>

      {/* Feedback List */}
      {activeTab === 'received'
        ? renderFeedbackList(receivedFeedback)
        : renderFeedbackList(sentFeedback)}
    </div>
  );
};

export default FeedbackCard;

