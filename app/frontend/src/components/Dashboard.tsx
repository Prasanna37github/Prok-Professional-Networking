import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postsApi } from './posts/api';
import { profileApi } from './profile/api';
import { commentsApi } from './comments/api';
import { useTheme } from '../context/ThemeContext';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import PostFilters from './posts/PostFilters';
import type { Post, PostsFilters } from './posts/api';
import type { User } from '../types';
import type { Comment } from './comments/api';

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
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [showComments, setShowComments] = useState<Set<number>>(new Set());
  const [showShareModal, setShowShareModal] = useState<number | null>(null);
  const [showImageModal, setShowImageModal] = useState<{ url: string; alt: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Search and filter state
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<PostsFilters>({});
  const debouncedSearch = useDebounce(searchValue, 500);
  
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Infinite scroll hook
  const loadingRef = useInfiniteScroll({
    hasNext,
    isLoading: loading,
    onLoadMore: () => setCurrentPage(prev => prev + 1)
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchPosts();
  }, [debouncedSearch, filters]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchPosts(true); // Append mode
    }
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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

  const fetchPosts = async (append: boolean = false) => {
    try {
      setLoading(true);
      const searchFilters = { ...filters };
      if (debouncedSearch) {
        searchFilters.search = debouncedSearch;
      }
      
      const response = await postsApi.getPosts(currentPage, 10, searchFilters);
      
      if (append) {
        setPosts(prev => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }
      
      setHasNext(response.has_next);
      setHasPrev(response.has_prev);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setSearchValue(search);
  };

  const handleFiltersChange = (newFilters: PostsFilters) => {
    setFilters(newFilters);
  };

  const handleSignout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
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

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const mediaUrl = `${API_URL}${post.media_url}`;

    switch (post.media_type) {
      case 'image':
        return (
          <div 
            className="relative w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mt-3 overflow-hidden cursor-pointer group"
            onClick={() => setShowImageModal({ url: mediaUrl, alt: post.title })}
          >
            <img 
              src={mediaUrl} 
              alt="Post media" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="relative w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mt-3 overflow-hidden">
            <video 
              src={mediaUrl} 
              controls 
              className="w-full h-full object-cover"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="w-full mt-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <audio 
              src={mediaUrl} 
              controls 
              className="w-full"
            />
          </div>
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

  const handleComment = async (postId: number) => {
    // Toggle comment section for this post
    setShowComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        // Close comment input when hiding comments
        setCommentInputs(prevInputs => {
          const newInputs = { ...prevInputs };
          delete newInputs[postId];
          return newInputs;
        });
      } else {
        newSet.add(postId);
        // Load comments if not already loaded
        if (!comments[postId]) {
          loadComments(postId);
        }
        // Enable comment input for this post
        setCommentInputs(prev => ({
          ...prev,
          [postId]: ''
        }));
      }
      return newSet;
    });
  };

  const loadComments = async (postId: number) => {
    try {
      const response = await commentsApi.getComments(postId);
      if (response.success && response.comments) {
        setComments(prev => ({
          ...prev,
          [postId]: response.comments || []
        }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const response = await commentsApi.createComment(postId, content);
      if (response.success && response.comment) {
        // Add new comment to the list
        setComments(prev => ({
          ...prev,
          [postId]: [response.comment!, ...(prev[postId] || [])]
        }));
        
        // Update post comment count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, comment_count: (post.comment_count || 0) + 1 }
            : post
        ));
        
        // Clear the input and close it
        setCommentInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[postId];
          return newInputs;
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleShare = (postId: number) => {
    setShowShareModal(postId);
  };

  const getShareLink = (postId: number) => {
    return `${window.location.origin}/posts/${postId}`;
  };

  if (loading && !user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-purple-200' : 'text-indigo-700'}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Top Section - User Profile Area */}
      <div className={`${isDarkMode ? 'bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 border-purple-700' : 'bg-gradient-to-r from-white via-blue-50 to-white border-indigo-200'} shadow-xl border-b backdrop-blur-sm`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* User Profile Info */}
            <div className="flex items-center space-x-4">
              {/* Profile Image */}
              <div className="relative">
                {user?.avatar ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile/image/${user.avatar}`}
                    alt={user?.name || user?.username}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-purple-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-xl ring-4 ring-purple-200">
                    {getInitials(user?.name || user?.username || 'U')}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>
              
              {/* User Details */}
              <div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome back, {user?.name || user?.username}!
                </h1>
                <p className={`${isDarkMode ? 'text-purple-200' : 'text-indigo-700'} font-medium`}>
                  {user?.title || 'Professional Network Member'}
                </p>
                {user?.location && (
                  <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'} flex items-center mt-1`}>
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
                className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-yellow-300 hover:from-purple-700 hover:to-pink-700 shadow-lg' 
                    : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 shadow-md'
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

              {/* Dropdown Menu */}
              <div className="dropdown-container relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                    showDropdown
                      ? isDarkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : isDarkMode 
                        ? 'bg-gradient-to-r from-slate-700 to-purple-700 text-purple-200 hover:from-slate-600 hover:to-purple-600 shadow-lg' 
                        : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 shadow-md'
                  }`}
                  title="Menu"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl transform transition-all duration-200 ease-in-out backdrop-blur-sm z-[9999] ${
                  showDropdown 
                    ? 'translate-x-0 opacity-100 scale-100' 
                    : 'translate-x-4 opacity-0 scale-95 pointer-events-none'
                } ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-purple-800 border border-purple-600' : 'bg-gradient-to-br from-white to-indigo-50 border border-indigo-200'}`}>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className={`flex items-center px-4 py-3 text-sm transition-all duration-200 hover:scale-105 font-medium ${
                        isDarkMode 
                          ? 'text-purple-200 hover:bg-gradient-to-r hover:from-purple-700 hover:to-pink-700' 
                          : 'text-indigo-700 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      to="/posts/create"
                      onClick={() => setShowDropdown(false)}
                      className={`flex items-center px-4 py-3 text-sm transition-all duration-200 hover:scale-105 font-medium ${
                        isDarkMode 
                          ? 'text-purple-200 hover:bg-gradient-to-r hover:from-purple-700 hover:to-pink-700' 
                          : 'text-indigo-700 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Post
                    </Link>
                    <div className={`border-t ${isDarkMode ? 'border-purple-600' : 'border-indigo-200'} my-1`}></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleSignout();
                      }}
                      className={`flex items-center w-full px-4 py-3 text-sm transition-all duration-200 hover:scale-105 font-medium ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-gradient-to-r hover:from-red-700 hover:to-pink-700' 
                          : 'text-red-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Combined Feed and Dashboard */}
      <div className="max-w-6xl mx-auto px-4 py-8">


        {/* Search and Filter Section */}
        <PostFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Posts List */}
        <div className="space-y-6">
          {loading && posts.length === 0 ? (
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-purple-800' : 'bg-gradient-to-br from-white to-indigo-50'} rounded-xl shadow-xl p-8 backdrop-blur-sm`}>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-purple-500 to-pink-500"></div>
                <span className={`ml-2 ${isDarkMode ? 'text-purple-200' : 'text-indigo-700'}`}>Loading posts...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-purple-800' : 'bg-gradient-to-br from-white to-indigo-50'} rounded-xl shadow-xl p-8 backdrop-blur-sm`}>
                              <div className="text-center">
                  <svg className={`w-16 h-16 ${isDarkMode ? 'text-purple-400' : 'text-indigo-400'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No posts found</h3>
                  <p className={`${isDarkMode ? 'text-purple-200' : 'text-indigo-700'} mb-4`}>
                    {debouncedSearch || Object.keys(filters).length > 0 
                      ? 'Try adjusting your search or filters.' 
                      : 'Be the first to create a post and start sharing!'
                    }
                  </p>
                  {!debouncedSearch && Object.keys(filters).length === 0 && (
                    <Link
                      to="/posts/create"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Post
                  </Link>
                )}
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-purple-800 border-purple-600' : 'bg-gradient-to-br from-white to-indigo-50 border-indigo-200'} rounded-xl shadow-xl border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm min-h-[200px]`}>
                {/* Post Header */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-purple-600' : 'border-indigo-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* User Profile Image */}
                      {post.user?.avatar ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile/image/${post.user.avatar}`}
                          alt={post.user?.name || post.user?.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 shadow-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                          {post.user?.name?.charAt(0).toUpperCase() || post.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      
                      {/* User Info and Post Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                            {post.user?.name || post.user?.username || 'Unknown User'}
                          </h3>
                          <span className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`}>
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                        
                        {/* Post Title and Content */}
                        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {post.title}
                        </h2>
                        
                        <div className="prose max-w-none">
                          <p className={`${isDarkMode ? 'text-purple-200' : 'text-indigo-700'} leading-relaxed`}>
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
                        <span className={`px-3 py-1 text-xs rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md`}>
                          Private
                        </span>
                      )}
                      {!post.allow_comments && (
                        <span className={`px-3 py-1 text-xs rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md`}>
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
                <div className={`flex items-center justify-between px-6 pb-6 border-t ${isDarkMode ? 'border-purple-600' : 'border-indigo-200'}`}>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-all duration-200 hover:scale-110 ${
                        likedPosts.has(post.id)
                          ? 'text-red-500 hover:text-red-600'
                          : isDarkMode 
                            ? 'text-purple-300 hover:text-pink-400' 
                            : 'text-indigo-600 hover:text-pink-600'
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
                        className={`flex items-center space-x-2 transition-all duration-200 hover:scale-110 ${
                          isDarkMode ? 'text-purple-300 hover:text-pink-400' : 'text-indigo-600 hover:text-pink-600'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comment_count || 0}</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleShare(post.id)}
                      className={`flex items-center space-x-2 transition-all duration-200 hover:scale-110 ${
                        isDarkMode ? 'text-purple-300 hover:text-pink-400' : 'text-indigo-600 hover:text-pink-600'
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
                  <div className={`px-6 pb-6 border-t ${isDarkMode ? 'border-purple-600' : 'border-indigo-200'}`}>
                    <div className="flex items-center space-x-3 mt-4">
                                              <textarea
                          value={commentInputs[post.id]}
                          onChange={(e) => setCommentInputs(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          placeholder="Write a comment..."
                          className={`flex-1 px-3 py-2 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-slate-700 to-purple-700 border-purple-600 text-white' 
                              : 'bg-gradient-to-r from-white to-indigo-50 border-indigo-300 text-gray-900'
                          }`}
                          rows={2}
                        />
                        <button 
                          onClick={() => handleSubmitComment(post.id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                        Post
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments Display Section */}
                {showComments.has(post.id) && (
                  <div className={`px-6 pb-6 border-t ${isDarkMode ? 'border-purple-600' : 'border-indigo-200'}`}>
                    <div className="mt-4">
                                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-purple-200' : 'text-indigo-700'}`}>
                          Comments ({comments[post.id]?.length || 0})
                        </h4>
                        
                        {comments[post.id] && comments[post.id].length > 0 ? (
                          <div className="space-y-3">
                            {comments[post.id].map((comment) => (
                              <div key={comment.id} className={`p-3 rounded-xl ${
                                isDarkMode ? 'bg-gradient-to-r from-slate-700 to-purple-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                              }`}>
                              <div className="flex items-start space-x-2">
                                {comment.user.avatar ? (
                                  <img 
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile/image/${comment.user.avatar}`}
                                    alt={comment.user.name}
                                    className="w-8 h-8 rounded-full object-cover border border-purple-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold border border-purple-200">
                                    {comment.user.name?.charAt(0).toUpperCase() || comment.user.username?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                )}
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`font-medium text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                                      {comment.user.name || comment.user.username}
                                    </span>
                                    <span className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`}>
                                      {formatDate(comment.created_at)}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${isDarkMode ? 'text-purple-200' : 'text-indigo-700'}`}>
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'} text-center py-4`}>
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading indicator for infinite scroll */}
          {loading && posts.length > 0 && (
            <div ref={loadingRef} className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-purple-800' : 'bg-gradient-to-br from-white to-indigo-50'} rounded-xl shadow-xl p-8 backdrop-blur-sm`}>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-purple-500 to-pink-500"></div>
                <span className={`ml-2 ${isDarkMode ? 'text-purple-200' : 'text-indigo-700'}`}>Loading more posts...</span>
              </div>
            </div>
          )}

          {/* Pagination (fallback for non-infinite scroll) */}
          {!hasNext && !hasPrev && posts.length > 0 && (
            <div className="text-center py-4">
              <p className={isDarkMode ? 'text-purple-300' : 'text-indigo-600'}>No more posts to load</p>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-purple-800' : 'bg-gradient-to-br from-white to-indigo-50'} rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border ${isDarkMode ? 'border-purple-600' : 'border-indigo-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                Share Post
              </h3>
              <button
                onClick={() => setShowShareModal(null)}
                className={`p-1 rounded-full hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-200 ${isDarkMode ? 'text-purple-300 hover:text-white' : 'text-indigo-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-purple-200' : 'text-indigo-700'}`}>
                Share this link:
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={getShareLink(showShareModal)}
                  readOnly
                  className={`flex-1 px-3 py-2 border rounded-l-xl focus:outline-none ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-slate-700 to-purple-700 border-purple-600 text-white' 
                      : 'bg-gradient-to-r from-white to-indigo-50 border-indigo-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getShareLink(showShareModal));
                    // You could add a toast notification here
                  }}
                  className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-r-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg ${
                    isDarkMode ? 'border-purple-600' : 'border-indigo-300'
                  } border-l-0`}
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowShareModal(null)}
                className={`px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-slate-700 to-purple-700 text-purple-200 hover:from-slate-600 hover:to-purple-600 shadow-lg' 
                    : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 shadow-md'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setShowImageModal(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full mx-4">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all duration-200 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={showImageModal.url} 
                alt={showImageModal.alt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium">{showImageModal.alt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 