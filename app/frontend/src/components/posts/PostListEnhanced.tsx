import React, { useState, useEffect, useCallback } from 'react';
import { postsApi } from './api';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import PostFilters from './PostFilters';
import LazyImage from '../common/LazyImage';
import { useTheme } from '../../context/ThemeContext';
import type { Post, PostsFilters } from './api';

const PostListEnhanced: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  // Filters state
  const [filters, setFilters] = useState<PostsFilters>({
    search: '',
    sort_by: 'newest'
  });

  // Like states
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Fetch posts with filters
  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(page === 1);
      setLoadingMore(page > 1);
      setError(null);

      const response = await postsApi.getPosts(page, 10, filters);
      
      if (append) {
        setPosts(prev => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }
      
      setHasNext(response.has_next);
      setTotalPosts(response.total);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  // Fetch posts when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchPosts(1, false);
  }, [filters, fetchPosts]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (hasNext && !loadingMore) {
      fetchPosts(currentPage + 1, true);
    }
  }, [hasNext, loadingMore, currentPage, fetchPosts]);

  const loadMoreRef = useInfiniteScroll({
    hasNext: hasNext,
    isLoading: loadingMore,
    onLoadMore: loadMore
  });

  // Post interaction handlers
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
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, like_count: response.like_count }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
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
          <LazyImage 
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

  if (loading && posts.length === 0) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Post List
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Discover and explore posts from your professional network
          </p>
          {totalPosts > 0 && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
              Showing {posts.length} of {totalPosts} posts
            </p>
          )}
        </div>

        {/* Filters */}
        <PostFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={(search) => setFilters(prev => ({ ...prev, search }))}
          searchValue={filters.search || ''}
          onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        />

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow`}>
              {/* Post Header */}
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* User Profile Image */}
                    {post.user?.avatar ? (
                      <LazyImage 
                        src={`http://localhost:5000/api/profile/image/${post.user.avatar}`}
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
            </div>
          ))}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading more posts...</span>
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default PostListEnhanced; 