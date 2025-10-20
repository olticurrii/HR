import React, { useState } from 'react';
import { X, Users, MessageSquare, EyeOff } from 'lucide-react';
import { performanceService } from '../../services/performanceService';

interface PeerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
  cycleId: number;
  revieweeId: number;
  revieweeName: string;
  questions: Array<{ id: number; prompt: string; scale_min: number; scale_max: number }>;
  allowAnonymous: boolean;
}

const PeerReviewModal: React.FC<PeerReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted,
  cycleId,
  revieweeId,
  revieweeName,
  questions,
  allowAnonymous
}) => {
  const [answers, setAnswers] = useState<Record<number, { rating?: number; comment: string }>>({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRatingChange = (questionId: number, rating: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], rating, comment: prev[questionId]?.comment || '' }
    }));
  };

  const handleCommentChange = (questionId: number, comment: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], comment, rating: prev[questionId]?.rating }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, data]) => ({
        question_id: parseInt(qId),
        rating: data.rating,
        comment: data.comment || undefined
      }));

      await performanceService.submitPeerReview({
        cycle_id: cycleId,
        reviewee_id: revieweeId,
        reviewer_type: 'peer',
        answers: formattedAnswers,
        is_anonymous_peer: isAnonymous
      });

      onReviewSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Peer Review for {revieweeName}
            </h2>
            {isAnonymous && (
              <p className="text-sm text-gray-600 mt-1 flex items-center">
                <EyeOff className="w-4 h-4 mr-1" />
                Your identity will be hidden
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Questions */}
          {questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <span className="text-xs text-gray-500 font-medium">Question {index + 1}</span>
                  <p className="text-gray-900 font-medium mt-1">{question.prompt}</p>
                </div>
              </div>

              {/* Rating Scale */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Rating ({question.scale_min}-{question.scale_max})
                </label>
                <div className="flex gap-2">
                  {Array.from({ length: question.scale_max - question.scale_min + 1 }, (_, i) => {
                    const value = question.scale_min + i;
                    const isSelected = answers[question.id]?.rating === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRatingChange(question.id, value)}
                        className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm text-gray-700 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Comments (Optional)
                </label>
                <textarea
                  value={answers[question.id]?.comment || ''}
                  onChange={(e) => handleCommentChange(question.id, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional feedback..."
                />
              </div>
            </div>
          ))}

          {/* Anonymous Option */}
          {allowAnonymous && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 flex items-center text-gray-900">
                  <EyeOff className="w-4 h-4 mr-2 text-gray-600" />
                  Submit anonymously
                </span>
              </label>
              <p className="text-xs text-gray-600 ml-7 mt-1">
                Your name will be hidden from the reviewee
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || questions.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeerReviewModal;

