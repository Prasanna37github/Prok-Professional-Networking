import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { PostsFilters } from './api';

interface PostFiltersProps {
  filters: PostsFilters;
  onFiltersChange: (filters: PostsFilters) => void;
  onSearch: (search: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const PostFilters: React.FC<PostFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  searchValue,
  onSearchChange
}) => {
  const { isDarkMode } = useTheme();

  const handleSortChange = (sortBy: PostsFilters['sort_by']) => {
    onFiltersChange({ ...filters, sort_by: sortBy });
  };

  const handleFilterChange = (filterBy: PostsFilters['filter_by']) => {
    onFiltersChange({ ...filters, filter_by: filterBy });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search posts, users, or content..."
              className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Sort Dropdown */}
        <div className="lg:w-48">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Sort By
          </label>
          <select
            value={filters.sort_by || 'newest'}
            onChange={(e) => handleSortChange(e.target.value as PostsFilters['sort_by'])}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_liked">Most Liked</option>
            <option value="most_commented">Most Commented</option>
          </select>
        </div>

        {/* Filter Dropdown */}
        <div className="lg:w-48">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter By
          </label>
          <select
            value={filters.filter_by || 'all'}
            onChange={(e) => handleFilterChange(e.target.value as PostsFilters['filter_by'])}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Posts</option>
            <option value="public">Public Posts</option>
            <option value="private">Private Posts</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search || filters.sort_by !== 'newest' || filters.filter_by !== 'all') && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                Search: "{filters.search}"
                <button
                  onClick={() => onFiltersChange({ ...filters, search: undefined })}
                  className="ml-2 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            )}
            {filters.sort_by && filters.sort_by !== 'newest' && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
              }`}>
                Sort: {filters.sort_by.replace('_', ' ')}
                <button
                  onClick={() => handleSortChange('newest')}
                  className="ml-2 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            )}
            {filters.filter_by && filters.filter_by !== 'all' && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
              }`}>
                Filter: {filters.filter_by}
                <button
                  onClick={() => handleFilterChange('all')}
                  className="ml-2 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                onFiltersChange({});
                onSearchChange('');
              }}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFilters; 