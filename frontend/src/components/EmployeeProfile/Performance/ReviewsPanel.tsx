import React, { useState, useEffect } from 'react';
import { employeeProfileService, ReviewsByType } from '../../../services/employeeProfileService';

interface ReviewsPanelProps {
  userId: number;
}

export const ReviewsPanel: React.FC<ReviewsPanelProps> = ({ userId }) => {
  const [reviews, setReviews] = useState<ReviewsByType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReviewTab, setActiveReviewTab] = useState<'manager' | 'self' | 'peer'>('manager');

  useEffect(() => {
    loadReviews();
  }, [userId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await employeeProfileService.getReviews(userId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating?: number) => {
    if (!rating) return 'N/A';
    const labels = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];
    return `${labels[rating - 1]} (${rating}/5)`;
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-blue-100 text-blue-800';
    if (rating >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const currentReviews = reviews.find(r => r.reviewer_type === activeReviewTab);

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Review Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 border-b border-gray-200 px-6">
          {(['manager', 'self', 'peer'] as const).map((type) => {
            const hasReviews = reviews.some(r => r.reviewer_type === type);
            return (
              <button
                key={type}
                onClick={() => setActiveReviewTab(type)}
                disabled={!hasReviews}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeReviewTab === type
                    ? 'text-primary border-b-2 border-blue-600 -mb-px'
                    : hasReviews
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} Review
                {hasReviews && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {reviews.find(r => r.reviewer_type === type)?.questions_and_answers.length || 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Content */}
      {!currentReviews || currentReviews.questions_and_answers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No {activeReviewTab} reviews available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentReviews.questions_and_answers.map((qa, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium text-gray-900 flex-1">{qa.question}</h4>
                {qa.rating && (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRatingColor(qa.rating)}`}>
                    {getRatingLabel(qa.rating)}
                  </span>
                )}
              </div>

              {qa.comment && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700">{qa.comment}</p>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500">
                Reviewer: {qa.reviewer_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

