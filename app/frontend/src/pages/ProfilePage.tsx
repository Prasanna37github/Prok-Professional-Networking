import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileBio from '../components/profile/ProfileBio';
import ProfileSkills from '../components/profile/ProfileSkills';
import ProfileExperience from '../components/profile/ProfileExperience';
import ProfileEducation from '../components/profile/ProfileEducation';
import ProfileContact from '../components/profile/ProfileContact';
import ProfileActivity from '../components/profile/ProfileActivity';
import ProfileTimeline from '../components/profile/ProfileTimeline';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import { profileApi } from '../components/profile/api';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === '1') {
      setEditing(true);
    }
  }, [location.search]);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        // Get username from localStorage (set after login)
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
    }
    fetchProfile();
  }, []);

  const handleSave = (updatedUser: any) => {
    setUser(updatedUser);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  if (!user) return <div className="text-center p-8 text-red-600">Profile not found.</div>;

  // Ensure all arrays exist and are arrays
  const safeSkills = Array.isArray(user.skills) ? user.skills : [];
  const safeExperience = Array.isArray(user.experience) ? user.experience : [];
  const safeEducation = Array.isArray(user.education) ? user.education : [];
  const safeSocials = Array.isArray(user.socials) ? user.socials : [];

  return (
    <div className="max-w-4xl mx-auto p-4 text-black">
      {editing ? (
        <ProfileEditForm 
          user={user} 
          onSave={handleSave} 
          onCancel={handleCancel}
        />
      ) : (
        <>
          <ProfileHeader user={user} />
          <ProfileBio bio={user.bio || ''} />
          <ProfileSkills skills={safeSkills} />
          <ProfileExperience experience={safeExperience} />
          <ProfileEducation education={safeEducation} />
          <ProfileContact contact={{
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || ''
          }} />
          {/* You can add activity/timeline if you fetch them from backend */}
        </>
      )}
      
      {!editing && (
        <div className="mt-6 text-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
