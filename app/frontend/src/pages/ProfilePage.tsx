import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProfileLayout from '../components/profile/ProfileLayout';
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

  


  return (
    <div className="text-black">
      {editing ? (
        <div className="max-w-4xl mx-auto p-4">
          <ProfileEditForm 
            user={user} 
            onSave={handleSave} 
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <ProfileLayout />
      )}
    </div>
  );
};

export default ProfilePage;
