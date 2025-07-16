const API_BASE_URL = 'http://localhost:5000';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    name: string;
    avatar?: string;
  };
  post_id: number;
}

export interface CommentResponse {
  success: boolean;
  comments?: Comment[];
  comment?: Comment;
  message?: string;
  error?: string;
}

class CommentsApi {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getComments(postId: number): Promise<CommentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
      }

      return data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async createComment(postId: number, content: string): Promise<CommentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment');
      }

      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async updateComment(commentId: number, content: string): Promise<CommentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update comment');
      }

      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: number): Promise<CommentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete comment');
      }

      return data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export const commentsApi = new CommentsApi(); 