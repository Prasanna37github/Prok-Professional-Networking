const API_URL = 'http://localhost:5000';

export interface PostData {
  title: string;
  content: string;
  media?: File;
  allow_comments?: boolean;
  is_public?: boolean;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  media_url?: string;
  media_type?: string;
  allow_comments: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
  user: {
    id: number;
    username: string;
    name?: string;
    avatar?: string;
    profile?: any;
  };
}

export interface PostsFilters {
  search?: string;
  sort_by?: 'newest' | 'oldest' | 'most_liked' | 'most_commented';
  filter_by?: 'all' | 'public' | 'private';
}

export const postsApi = {
  createPost: async (postData: PostData): Promise<{ message: string; post: Post }> => {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('allow_comments', postData.allow_comments?.toString() || 'true');
    formData.append('is_public', postData.is_public?.toString() || 'true');
    
    if (postData.media) {
      formData.append('media', postData.media);
    }

    const response = await fetch(`${API_URL}/api/posts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create post');
    }

    return response.json();
  },

  getPosts: async (
    page: number = 1, 
    perPage: number = 10, 
    filters?: PostsFilters
  ): Promise<{
    posts: Post[];
    total: number;
    pages: number;
    current_page: number;
    has_next: boolean;
    has_prev: boolean;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.sort_by) {
      params.append('sort_by', filters.sort_by);
    }
    if (filters?.filter_by) {
      params.append('filter_by', filters.filter_by);
    }

    const response = await fetch(`${API_URL}/api/posts/?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch posts');
    }

    return response.json();
  },

  getPost: async (postId: number): Promise<{ post: Post }> => {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch post');
    }

    return response.json();
  },

  updatePost: async (postId: number, postData: Partial<PostData>): Promise<{ message: string; post: Post }> => {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update post');
    }

    return response.json();
  },

  deletePost: async (postId: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete post');
    }

    return response.json();
  },

  likePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getLikeStatus: async (postId: number) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },
}; 