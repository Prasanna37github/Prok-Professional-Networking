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
import { mockUser, mockActivity, mockTimeline } from '../mock/mockProfile';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState(mockUser);
  const [editing, setEditing] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === '1') {
      setEditing(true);
    }
  }, [location.search]);

  return (
    <div className="max-w-2xl mx-auto p-4 text-black">
      <ProfileHeader user={user} />
      {editing ? (
        <ProfileEditForm user={user} onSave={setUser} />
      ) : (
        <>
          <ProfileBio bio={user.bio} />
          <ProfileSkills skills={user.skills} />
          <ProfileExperience experience={user.experience} />
          <ProfileEducation education={user.education} />
          <ProfileContact contact={user.contact} />
          <ProfileActivity activity={mockActivity} />
          <ProfileTimeline timeline={mockTimeline} />
        </>
      )}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setEditing(e => !e)}
      >
        {editing ? 'Cancel' : 'Edit Profile'}
      </button>
    </div>
  );
};

export default ProfilePage;
