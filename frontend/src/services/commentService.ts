import { api } from './authService';

export interface Comment {
  id: number;
  content: string;
  task_id: number;
  user_id: number;
  parent_comment_id?: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar_url?: string;
  replies: Comment[];
}

export interface CommentCreate {
  content: string;
  parent_comment_id?: number;
}

export interface CommentUpdate {
  content: string;
}

export const commentService = {
  async getTaskComments(taskId: number): Promise<Comment[]> {
    const response = await api.get(`/api/v1/tasks/${taskId}/comments`);
    return response.data;
  },

  async createComment(taskId: number, commentData: CommentCreate): Promise<Comment> {
    const response = await api.post(`/api/v1/tasks/${taskId}/comments`, commentData);
    return response.data;
  },

  async updateComment(commentId: number, commentData: CommentUpdate): Promise<Comment> {
    const response = await api.put(`/api/v1/comments/${commentId}`, commentData);
    return response.data;
  },

  async deleteComment(commentId: number): Promise<void> {
    await api.delete(`/api/v1/comments/${commentId}`);
  },
};

export default commentService;
