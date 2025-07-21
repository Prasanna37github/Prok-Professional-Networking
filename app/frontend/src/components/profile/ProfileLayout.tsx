import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { profileApi } from './api';
import UserPosts from './UserPosts';

const ProfileLayout: React.FC = () => {
  const { user: authUser } = useAuth();
  const { isDarkMode } = useTheme();
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
        window.location.href = '/login';
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-purple-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Profile Header */}
      <div className={`${isDarkMode ? 'bg-slate-800 shadow-lg border-slate-700' : 'bg-white shadow-sm border-b'}`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={`http://localhost:5000/api/profile/image/${user.avatar}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg ${
                  user?.avatar ? 'hidden' : ''
                }`}
                style={{
                  backgroundColor: `hsl(${Math.abs((user?.name || authUser?.name || 'U').charCodeAt(0)) % 360}, 70%, 50%)`
                }}
              >
                {(user?.name || authUser?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            <div className="flex-1">
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || authUser?.name || 'Your Profile'}
              </h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{user?.title || 'Professional Network Member'}</p>
              <div className="flex items-center space-x-4 mt-3">
                {user?.location && (
                  <>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>📍 {user.location}</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>•</span>
                  </>
                )}
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined 2024</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => window.location.href = '/dashboard'}
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
                onClick={() => window.location.href = '/profile?edit=1'}
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
                  
                  {user?.skills && Array.isArray(user.skills) && user.skills.length > 0 && (
                    <div>
                      <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill: any, index: number) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isDarkMode 
                                ? 'bg-purple-900 text-purple-200' 
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {typeof skill === 'string' ? skill : skill.name || skill.skill || 'Unknown Skill'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {user?.experience && Array.isArray(user.experience) && user.experience.length > 0 && (
                    <div>
                      <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Experience</h3>
                      <div className="space-y-4">
                        {user.experience.map((exp: any, index: number) => (
                          <div key={index} className="border-l-4 border-purple-600 pl-4">
                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{exp.role || exp.title || 'Position'}</h4>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {exp.company || 'Company'} • {exp.duration || exp.start_date || 'Duration'}
                            </p>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-1`}>{exp.description || 'No description available'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user?.education && Array.isArray(user.education) && user.education.length > 0 && (
                    <div>
                      <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Education</h3>
                      <div className="space-y-4">
                        {user.education.map((edu: any, index: number) => (
                          <div key={index} className="border-l-4 border-purple-600 pl-4">
                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{edu.degree || edu.field || 'Degree'}</h4>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {edu.school || edu.institution || 'Institution'} • {edu.duration || edu.start_date || 'Duration'}
                            </p>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-1`}>{edu.description || 'No description available'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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