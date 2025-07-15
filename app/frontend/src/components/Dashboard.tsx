import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from './posts/api';
import { profileApi } from './profile/api';
import { useTheme } from '../context/ThemeContext';
import type { Post } from './posts/api';
import type { User } from '../types';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [showShareModal, setShowShareModal] = useState<number | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
  }, [currentPage]);

  useEffect(() => {
    // Fetch like status for all posts
    const fetchLikeStatuses = async () => {
      const likedSet = new Set<number>();
      for (const post of posts) {
        try {
          const response = await postsApi.getLikeStatus(post.id);
          if (response.liked) {
            likedSet.add(post.id);
          }
        } catch (error) {
          console.error('Error fetching like status:', error);
        }
      }
      setLikedPosts(likedSet);
    };

    if (posts.length > 0) {
      fetchLikeStatuses();
    }
  }, [posts]);

  const fetchUserProfile = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        setError('No username found. Please login again.');
        return;
      }
      
      const res = await profileApi.getProfileByUsername(username);
      if (res.success) {
        setUser(res.profile);
      } else {
        setError(res.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('An error occurred while fetching profile');
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsApi.getPosts(currentPage, 10);
      setPosts(response.posts);
      setHasNext(response.has_next);
      setHasPrev(response.has_prev);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMedia = (post: Post) => {
    if (!post.media_url) return null;

    const mediaUrl = `http://localhost:5000${post.media_url}`;

    switch (post.media_type) {
      case 'image':
        return (
          <img 
            src={mediaUrl} 
            alt="Post media" 
            className="w-full h-48 object-cover rounded-lg mt-3"
          />
        );
      case 'video':
        return (
          <video 
            src={mediaUrl} 
            controls 
            className="w-full h-48 object-cover rounded-lg mt-3"
          />
        );
      case 'audio':
        return (
          <audio 
            src={mediaUrl} 
            controls 
            className="w-full mt-3"
          />
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await postsApi.likePost(postId);
      if (response.liked) {
        setLikedPosts(prev => new Set([...prev, postId]));
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
      
      // Update the post's like count in the posts array
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, like_count: response.like_count }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId: number) => {
    // Enable comment input for this post
    setCommentInputs(prev => ({
      ...prev,
      [postId]: prev[postId] || ''
    }));
  };

  const handleShare = (postId: number) => {
    setShowShareModal(postId);
  };

  const getShareLink = (postId: number) => {
    return `${window.location.origin}/posts/${postId}`;
  };

  if (loading && !user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Section - User Profile Area */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* User Profile Info */}
            <div className="flex items-center space-x-4">
              {/* Profile Image */}
              <div className="relative">
                {user?.avatar ? (
                  <img 
                    src={`http://localhost:5000${user.avatar}`}
                    alt={user?.name || user?.username}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {getInitials(user?.name || user?.username || 'U')}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              
              {/* User Details */}
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome back, {user?.name || user?.username}!
                </h1>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {user?.title || 'Professional Network Member'}
                </p>
                {user?.location && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center mt-1`}>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {user.location}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons and Theme Toggle */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <Link
                to="/profile"
                className={`px-6 py-3 rounded-lg transition-colors font-medium flex items-center ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Edit Profile
              </Link>
              <Link
                to="/posts/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Posts Feed */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Your Feed</h2>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Stay connected with your professional network</p>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {loading && posts.length === 0 ? (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8`}>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading posts...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8`}>
              <div className="text-center">
                <svg className={`w-16 h-16 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No posts yet</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Be the first to create a post and start sharing!</p>
                <Link
                  to="/posts/create"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Post
                </Link>
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow`}>
                {/* Post Header */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* User Profile Image */}
                      {post.user?.avatar ? (
                        <img 
                          src={`http://localhost:5000${post.user.avatar}`}
                          alt={post.user?.name || post.user?.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {post.user?.name?.charAt(0).toUpperCase() || post.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      
                      {/* User Info and Post Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {post.user?.name || post.user?.username || 'Unknown User'}
                          </h3>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                        
                        {/* Post Title and Content */}
                        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {post.title}
                        </h2>
                        
                        <div className="prose max-w-none">
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                            {post.content.length > 200 
                              ? `${post.content.substring(0, 200)}...` 
                              : post.content
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Post Settings */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!post.is_public && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          Private
                        </span>
                      )}
                      {!post.allow_comments && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          No Comments
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Media */}
                {post.media_url && (
                  <div className="px-6 pb-6">
                    {renderMedia(post)}
                  </div>
                )}

                {/* Post Actions */}
                <div className={`flex items-center justify-between px-6 pb-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        likedPosts.has(post.id)
                          ? 'text-red-500 hover:text-red-600'
                          : isDarkMode 
                            ? 'text-gray-400 hover:text-blue-400' 
                            : 'text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <svg className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{post.like_count || 0}</span>
                    </button>
                    {post.allow_comments && (
                      <button 
                        onClick={() => handleComment(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Comment</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleShare(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Comment Input Section */}
                {commentInputs[post.id] !== undefined && (
                  <div className={`px-6 pb-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center space-x-3 mt-4">
                      <textarea
                        value={commentInputs[post.id]}
                        onChange={(e) => setCommentInputs(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))}
                        placeholder="Write a comment..."
                        className={`flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        rows={2}
                      />
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Pagination */}
          {(hasNext || hasPrev) && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!hasPrev}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } border`}
              >
                Previous
              </button>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!hasNext}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } border`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Share Post
              </h3>
              <button
                onClick={() => setShowShareModal(null)}
                className={`p-1 rounded-full hover:bg-gray-200 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Share this link:
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={getShareLink(showShareModal)}
                  readOnly
                  className={`flex-1 px-3 py-2 border rounded-l-lg focus:outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getShareLink(showShareModal));
                    // You could add a toast notification here
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowShareModal(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 