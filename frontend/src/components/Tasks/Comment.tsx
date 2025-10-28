import React, { useState } from 'react';
import { MessageCircle, Reply, Edit, Trash2, MoreVertical, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Comment as CommentType } from '../../services/commentService';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface CommentProps {
  comment: CommentType;
  onReply: (parentCommentId: number) => void;
  onEdit: (commentId: number, newContent: string) => void;
  onDelete: (commentId: number) => void;
  depth?: number;
}

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatar, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base'
  };
  
  const initial = name?.charAt(0).toUpperCase() || '?';
  
  return (
    <div className={clsx(
      'rounded-full flex items-center justify-center font-medium text-white flex-shrink-0',
      'bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm',
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

const Comment: React.FC<CommentProps> = ({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete, 
  depth = 0 
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showActions, setShowActions] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const canEdit = isOwner;
  const canDelete = isOwner || user?.is_admin;

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditContent(comment.content);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const maxDepth = 3; // Limit nesting depth
  const shouldShowReply = depth < maxDepth;
  const isNested = depth > 0;

  return (
    <div className={clsx(
      'relative',
      isNested && 'ml-6 md:ml-8'
    )}>
      {/* Connection line for nested comments */}
      {isNested && (
        <div className="absolute -left-3 md:-left-4 top-0 w-px h-full bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600" />
      )}
      
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={clsx(
          'relative bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200',
          'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
          'hover:shadow-md p-4',
          isNested && 'ml-3 md:ml-4'
        )}
      >
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <UserAvatar name={comment.user_name} avatar={comment.user_avatar_url} />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {comment.user_name || 'Unknown User'}
                </h4>
                {comment.is_edited && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    edited
                  </span>
                )}
              </div>
              <time className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {formatDate(comment.created_at)}
              </time>
            </div>
          </div>
          
          {/* Actions Menu */}
          {(canEdit || canDelete) && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowActions(!showActions)}
                className={clsx(
                  'p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                  'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                  showActions && 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                )}
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>
              
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-20 min-w-[140px]"
                    onMouseLeave={() => setShowActions(false)}
                  >
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-3 text-primary" />
                        Edit Comment
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowActions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-3" />
                        Delete Comment
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Comment Content */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={clsx(
                  'w-full border rounded-lg px-3 py-2 text-sm resize-none transition-all',
                  'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700',
                  'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                )}
                rows={3}
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEdit}
                  disabled={!editContent.trim()}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                    'bg-primary hover:bg-primary-700 text-white',
                    'disabled:bg-gray-400 disabled:cursor-not-allowed'
                  )}
                >
                  <Check className="w-3 h-3" />
                  <span>Save</span>
                </motion.button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="comment-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                {comment.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment Actions */}
        {!isEditing && (
          <div className="flex items-center space-x-1 pt-2 border-t border-gray-100 dark:border-gray-700">
            {shouldShowReply && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onReply(comment.id)}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 hover:bg-primary-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </motion.button>
            )}
            
            {/* Reply Count Indicator */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                <MessageCircle className="w-3 h-3" />
                <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Render Replies */}
      <AnimatePresence>
        {comment.replies && comment.replies.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3"
          >
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Comment;