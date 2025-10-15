import React, { useState } from 'react';
import { MessageCircle, Reply, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Comment as CommentType } from '../../services/commentService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CommentProps {
  comment: CommentType;
  onReply: (parentCommentId: number) => void;
  onEdit: (commentId: number, newContent: string) => void;
  onDelete: (commentId: number) => void;
  depth?: number;
}

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maxDepth = 3; // Limit nesting depth
  const shouldShowReply = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {comment.user_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-medium text-gray-900">{comment.user_name}</div>
              <div className="text-sm text-gray-500">
                {formatDate(comment.created_at)}
                {comment.is_edited && (
                  <span className="ml-2 text-xs text-gray-400">(edited)</span>
                )}
              </div>
            </div>
          </div>
          
          {(canEdit || canDelete) && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-800 whitespace-pre-wrap">{comment.content}</div>
        )}

        <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
          {shouldShowReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
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
        </div>
      )}
    </div>
  );
};

export default Comment;
