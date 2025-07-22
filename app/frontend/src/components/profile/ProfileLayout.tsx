import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { profileApi } from './api';
import UserPosts from './UserPosts';

const ProfileLayout: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [deletingProfile, setDeletingProfile] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const username = localStorage.getItem('username');
      if (!username) {
        setError('No username found. Please login again.');
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!confirm('Are you sure you want to delete your profile? This action cannot be undone and will remove all your data including posts, comments, and profile information.')) {
      return;
    }

    try {
      setDeletingProfile(true);
      const result = await profileApi.deleteProfile();
      if (result.success) {
        // Clear local storage and redirect to login
        localStorage.clear();
        navigate('/login');
      } else {
        alert('Failed to delete profile: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('An error occurred while deleting your profile');
    } finally {
      setDeletingProfile(false);
    }
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'about', label: 'About', icon: '👤' },
  ] as const;

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center py-12">
          <div className={`text-red-600 text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Profile Header */}
      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="relative">
                <img
                  src={user?.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile/image/${user.avatar}` : '/default-avatar.png'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'No Name'}
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user?.title || 'No Title'}
                </p>
                <div className={`flex items-center space-x-2 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="text-sm">{user?.location || 'No Location'}</span>
                  {user?.location && (
                    <>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>•</span>
                    </>
                  )}
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined 2024</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className={`p-3 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                title="Go to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <button 
                onClick={() => navigate('/profile?edit=1')}
                className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Edit Profile"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                onClick={handleDeleteProfile}
                disabled={deletingProfile}
                className="p-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete Profile"
              >
                {deletingProfile ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-b'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'posts' && (
              <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Posts</h2>
                <UserPosts isOwnProfile={true} />
              </div>
            )}

            {activeTab === 'about' && (
              <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>About</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bio</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                      {user?.bio || 'No bio available yet.'}
                    </p>
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user?.skills && user.skills.length > 0 ? (
                        user.skills.map((skill: any, index: number) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isDarkMode 
                                ? 'bg-purple-900 text-purple-200' 
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {skill.name || skill}
                          </span>
                        ))
                      ) : (
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No skills added yet.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Experience</h3>
                    <div className="space-y-4">
                      {user?.experience && user.experience.length > 0 ? (
                        user.experience.map((exp: any, index: number) => (
                          <div key={index} className={`border-l-4 border-purple-500 pl-4 ${isDarkMode ? 'border-purple-400' : 'border-purple-500'}`}>
                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {exp.title || exp.role}
                            </h4>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {exp.company} • {exp.start_date || exp.duration}
                            </p>
                            {exp.description && (
                              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No experience added yet.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Education</h3>
                    <div className="space-y-4">
                      {user?.education && user.education.length > 0 ? (
                        user.education.map((edu: any, index: number) => (
                          <div key={index} className={`border-l-4 border-green-500 pl-4 ${isDarkMode ? 'border-green-400' : 'border-green-500'}`}>
                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {edu.degree || edu.school}
                            </h4>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {edu.school || edu.institution} • {edu.start_date || edu.duration}
                            </p>
                            {edu.description && (
                              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                {edu.description}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No education added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileLayout; 