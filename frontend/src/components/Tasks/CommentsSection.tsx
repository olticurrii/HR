import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { commentService, Comment as CommentType } from '../../services/commentService';
import Comment from './Comment';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface CommentsSectionProps {
  taskId: number;
}

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatar, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };
  
  const initial = name?.charAt(0).toUpperCase() || '?';
  
  return (
    <div className={clsx(
      'rounded-full flex items-center justify-center font-medium text-white',
      'bg-gradient-to-br from-blue-500 to-purple-600 shadow-md',
      sizeClasses[size]
    )}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
};

const CommentsSection: React.FC<CommentsSectionProps> = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showAddComment, setShowAddComment] = useState(false);

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const commentsData = await commentService.getTaskComments(taskId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const comment = await commentService.createComment(taskId, {
        content: newComment.trim()
      });
      
      // Add the new comment to the list
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setShowAddComment(false);
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId: number) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmitting(true);
    try {
      const reply = await commentService.createComment(taskId, {
        content: replyContent.trim(),
        parent_comment_id: parentCommentId
      });
      
      // Reload comments to get the proper tree structure
      await loadComments();
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number, newContent: string) => {
    try {
      await commentService.updateComment(commentId, { content: newContent });
      
      // Update the comment in the list
      const updateCommentInTree = (comments: CommentType[]): CommentType[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content: newContent, is_edited: true };
          }
          if (comment.replies.length > 0) {
            return { ...comment, replies: updateCommentInTree(comment.replies) };
          }
          return comment;
        });
      };
      
      setComments(updateCommentInTree(comments));
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
      
      // Remove the comment from the list
      const removeCommentFromTree = (comments: CommentType[]): CommentType[] => {
        return comments
          .filter(comment => comment.id !== commentId)
          .map(comment => ({
            ...comment,
            replies: comment.replies.length > 0 ? removeCommentFromTree(comment.replies) : []
          }));
      };
      
      setComments(removeCommentFromTree(comments));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <MessageCircle className="w-5 h-5 text-primary dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Comments</h3>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Loader className="w-8 h-8 text-primary mx-auto" />
          </motion.div>
          <p className="mt-3 text-sm font-medium">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageCircle className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Comments</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Discussion and feedback</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-3 py-1 rounded-full font-medium">
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </span>
            {!showAddComment && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddComment(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Comment</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Add new comment form */}
        {showAddComment && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
          >
            <div className="flex space-x-3 mb-4">
              <UserAvatar name={user?.full_name} avatar={user?.avatar_url} />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {user?.full_name || 'You'}
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className={clsx(
                    'w-full border rounded-lg px-4 py-3 text-sm resize-none transition-all',
                    'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                  )}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddComment(false);
                  setNewComment('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitting}
                className={clsx(
                  'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                  'bg-primary hover:bg-primary-700 text-white shadow-sm',
                  'disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none'
                )}
              >
                {submitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No comments yet</h4>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to share your thoughts!</p>
              {!showAddComment && (
                <button
                  onClick={() => setShowAddComment(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Add First Comment
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Comment
                    comment={comment}
                    onReply={(parentCommentId) => {
                      setReplyingTo(parentCommentId);
                      setReplyContent('');
                    }}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Reply input (when replying to a specific comment) */}
        {replyingTo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-primary-50 dark:bg-blue-900/20 rounded-xl border border-primary-200 dark:border-blue-800"
          >
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Replying to comment</span>
            </div>
            <div className="flex space-x-3">
              <UserAvatar name={user?.full_name} avatar={user?.avatar_url} size="sm" />
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a thoughtful reply..."
                  className={clsx(
                    'w-full border rounded-lg px-3 py-2 text-sm resize-none transition-all',
                    'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                  )}
                  rows={2}
                />
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReply(replyingTo)}
                    disabled={!replyContent.trim() || submitting}
                    className={clsx(
                      'flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                      'bg-primary hover:bg-primary-700 text-white',
                      'disabled:bg-gray-400 disabled:cursor-not-allowed'
                    )}
                  >
                    {submitting ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>{submitting ? 'Posting...' : 'Reply'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentsSection;