import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { postsApi } from '../posts/api';
import type { Post } from '../posts/api';

interface UserPostsProps {
  userId?: number;
  isOwnProfile?: boolean;
}

const UserPosts: React.FC<UserPostsProps> = ({ userId, isOwnProfile = false }) => {
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingPost, setDeletingPost] = useState<number | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch all posts and filter by user
      // In a real app, you'd have a specific endpoint for user posts
      const response = await postsApi.getPosts(1, 50);
      const userPosts = response.posts.filter(post => 
        userId ? post.user_id === userId : true // Show all posts if no specific userId
      );
      setPosts(userPosts);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingPost(postId);
      
      // Debug: Check token
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      
      const result = await postsApi.deletePost(postId);
      console.log('Delete post result:', result);
      setPosts(posts.filter(post => post.id !== postId));
      setError(''); // Clear any previous errors
    } catch (err: any) {
      console.error('Error deleting post:', err);
      const errorMessage = err.message || 'Failed to delete post';
      setError(`Failed to delete post: ${errorMessage}`);
      
      // Check if it's an authentication issue
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        alert('Authentication error. Please log in again.');
        window.location.href = '/login';
      }
    } finally {
      setDeletingPost(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Posts</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Posts</h3>
        <div className="text-red-500 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow p-6`}>
      <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {isOwnProfile ? 'My Posts' : 'Posts'}
      </h3>
      
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg">No posts yet</p>
          <p className="text-sm">Start sharing your thoughts and experiences!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  {post.user.avatar ? (
                    <img
                      src={`http://localhost:5000/api/profile/image/${post.user.avatar}`}
                      alt={post.user.name || post.user.username}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      post.user.avatar ? 'hidden' : ''
                    }`}
                    style={{
                      backgroundColor: `hsl(${Math.abs((post.user.name || post.user.username || '').charCodeAt(0)) % 360}, 70%, 50%)`
                    }}
                  >
                    {(post.user.name || post.user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {post.user.name || post.user.username}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(post.created_at)}</p>
                  </div>
                </div>
                
                {isOwnProfile && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        console.log('Delete button clicked for post:', post.id);
                        console.log('isOwnProfile:', isOwnProfile);
                        handleDeletePost(post.id);
                      }}
                      disabled={deletingPost === post.id}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
                      title="Delete post"
                    >
                      {deletingPost === post.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <h5 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{post.title}</h5>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {post.content.length > 200 
                    ? `${post.content.substring(0, 200)}...` 
                    : post.content
                  }
                </p>
              </div>
              
              {post.media_url && (
                <div className="mb-3">
                  <img
                    src={`http://localhost:5000${post.media_url}`}
                    alt="Post media"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.like_count}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.comment_count}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!post.is_public && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      Private
                    </span>
                  )}
                  {!post.allow_comments && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      No Comments
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPosts; 