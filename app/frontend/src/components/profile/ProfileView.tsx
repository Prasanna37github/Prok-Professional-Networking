import React, { useState, useRef } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileBio from './ProfileBio';
import ProfileSkills from './ProfileSkills';
import ProfileExperience from './ProfileExperience';
import ProfileEducation from './ProfileEducation';
import ProfileContact from './ProfileContact';
import ProfileActivity from './ProfileActivity';
import ProfileTimeline from './ProfileTimeline';
import UserPosts from './UserPosts';
import { mockUser, mockActivity, mockTimeline } from '../../mock/mockProfile';

const initialUser = { ...mockUser };

const ProfileView: React.FC = () => {
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initialUser);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setForm(user);
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setAvatarPreview(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, avatar: URL.createObjectURL(file) });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (!form.name || !form.email) {
      setError('Name and Email are required.');
      return;
    }
    setUser(form);
    setEditing(false);
    setAvatarPreview(null);
    setSuccess('Profile updated!');
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto py-8 px-2 md:px-0 flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <ProfileHeader user={user} />
          </div>
          {editing ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex flex-col items-center">
                  <img
                    src={avatarPreview || form.avatar}
                    alt="avatar"
                    className="w-24 h-24 rounded-full mb-2 object-cover"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    className="text-blue-600 underline text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </button>
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    name="email"
                    value={form.contact.email}
                    onChange={e => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })}
                    placeholder="Email"
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    name="phone"
                    value={form.contact.phone}
                    onChange={e => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })}
                    placeholder="Phone"
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Bio"
                className="w-full px-2 py-1 border rounded"
              />
              <input
                name="skills"
                value={form.skills.join(', ')}
                onChange={e => setForm({ ...form, skills: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="Skills (comma separated)"
                className="w-full px-2 py-1 border rounded"
              />
              {/* Add more fields for experience, education, etc. as needed */}
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" className="bg-gray-300 text-black px-4 py-2 rounded" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6"><ProfileBio bio={user.bio} /></div>
              <div className="bg-white rounded-lg shadow p-6"><ProfileSkills skills={user.skills} /></div>
              <div className="bg-white rounded-lg shadow p-6"><ProfileExperience experience={user.experience} /></div>
              <div className="bg-white rounded-lg shadow p-6"><ProfileEducation education={user.education} /></div>
              <div className="bg-white rounded-lg shadow p-6"><UserPosts isOwnProfile={true} /></div>
              <div className="bg-white rounded-lg shadow p-6"><ProfileActivity activity={mockActivity} /></div>
              <div className="bg-white rounded-lg shadow p-6"><ProfileTimeline timeline={mockTimeline} /></div>
            </>
          )}
        </div>
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <ProfileContact contact={user.contact} />
            {/* Add Languages, Connections, etc. as needed */}
          </div>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={editing ? handleCancel : handleEdit}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;