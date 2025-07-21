import React, { useState } from 'react';
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [tempSearchValue, setTempSearchValue] = useState(searchValue);

  const handleSortChange = (sortBy: PostsFilters['sort_by']) => {
    onFiltersChange({ ...filters, sort_by: sortBy });
  };

  const handleFilterChange = (filterBy: PostsFilters['filter_by']) => {
    onFiltersChange({ ...filters, filter_by: filterBy });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(tempSearchValue);
    onSearchChange(tempSearchValue);
    setIsSearchOpen(false);
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setTempSearchValue(searchValue);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setTempSearchValue(searchValue);
  };

  const handleSearchConfirm = () => {
    onSearch(tempSearchValue);
    onSearchChange(tempSearchValue);
    setIsSearchOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchConfirm();
    } else if (e.key === 'Escape') {
      handleSearchClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempSearchValue(value);
    onSearchChange(value);
    onSearch(value);
  };

  return (
    <div className={`mb-6 w-fit ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-purple-800' : 'bg-gradient-to-br from-white to-indigo-50'} rounded-xl shadow-xl p-3 backdrop-blur-sm`}>
      <div className="flex items-center justify-start">
        {/* Filter Toggle Button */}
        <div className="mr-4">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
              isFiltersOpen
                ? isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : isDarkMode 
                  ? 'bg-gradient-to-r from-slate-700 to-purple-700 text-purple-200 hover:from-slate-600 hover:to-purple-600 shadow-lg' 
                  : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 shadow-md'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
          </button>
        </div>

        {/* Search Logo and Input */}
        <div className="max-w-64">
          {!isSearchOpen ? (
            // Search Logo Button
            <button
              onClick={handleSearchClick}
              className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-slate-700 to-purple-700 text-purple-200 hover:from-slate-600 hover:to-purple-600 shadow-lg' 
                  : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 shadow-md'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium">
                {searchValue ? `"${searchValue}"` : 'Search...'}
              </span>
            </button>
          ) : (
            // Search Input Box
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  value={tempSearchValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Search..."
                  autoFocus
                  className={`flex-1 px-3 py-2 pl-10 pr-12 border rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-slate-700 to-purple-700 border-purple-600 text-white placeholder-purple-300' 
                      : 'bg-gradient-to-r from-white to-indigo-50 border-indigo-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-r-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm"
                >
                  Search
                </button>
              </form>
              
              {/* Search Icon */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`w-4 h-4 ${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Close Button */}
              <button
                onClick={handleSearchClose}
                className="absolute inset-y-0 right-0 pr-2 flex items-center z-10"
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-purple-300 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Filters */}
      {isFiltersOpen && (
        <div className="mt-4 pt-4 border-t border-purple-600/30 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort Dropdown */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-purple-200' : 'text-indigo-700'}`}>
                Sort By
              </label>
              <select
                value={filters.sort_by || 'newest'}
                onChange={(e) => handleSortChange(e.target.value as PostsFilters['sort_by'])}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-slate-700 to-purple-700 border-purple-600 text-white' 
                    : 'bg-gradient-to-r from-white to-indigo-50 border-indigo-300 text-gray-900'
                }`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_liked">Most Liked</option>
                <option value="most_commented">Most Commented</option>
              </select>
            </div>

            {/* Filter Dropdown */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-purple-200' : 'text-indigo-700'}`}>
                Filter By
              </label>
              <select
                value={filters.filter_by || 'all'}
                onChange={(e) => handleFilterChange(e.target.value as PostsFilters['filter_by'])}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-slate-700 to-purple-700 border-purple-600 text-white' 
                    : 'bg-gradient-to-r from-white to-indigo-50 border-indigo-300 text-gray-900'
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
            <div className="mt-4 pt-4 border-t border-purple-600/30">
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                  }`}>
                    Search: "{filters.search}"
                    <button
                      onClick={() => onFiltersChange({ ...filters, search: undefined })}
                      className="ml-2 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.sort_by && filters.sort_by !== 'newest' && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    isDarkMode ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'
                  }`}>
                    Sort: {filters.sort_by.replace('_', ' ')}
                    <button
                      onClick={() => handleSortChange('newest')}
                      className="ml-2 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.filter_by && filters.filter_by !== 'all' && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    Filter: {filters.filter_by}
                    <button
                      onClick={() => handleFilterChange('all')}
                      className="ml-2 hover:text-red-400 transition-colors"
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
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-all duration-200 hover:scale-105 ${
                    isDarkMode ? 'bg-gradient-to-r from-slate-700 to-purple-700 text-purple-200 hover:from-slate-600 hover:to-purple-600' : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200'
                  }`}
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostFilters; 