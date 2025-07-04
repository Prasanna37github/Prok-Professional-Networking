import React, { useState } from 'react';

const ProfileEditForm = ({ user, onSave }: { user: any, onSave: (data: any) => void }) => {
  const [form, setForm] = useState(user);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add validation here
    if (!form.username || !form.email) {
      setError('Username and Email are required.');
      return;
    }
    setError('');
    setSuccess('Profile updated!');
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow mt-4 space-y-4">
      <div>
        <label className="block font-medium">Username</label>
        <input name="username" value={form.username} onChange={handleChange} className="w-full px-2 py-1 border rounded" />
      </div>
      <div>
        <label className="block font-medium">Email</label>
        <input name="email" value={form.email} onChange={handleChange} className="w-full px-2 py-1 border rounded" />
      </div>
      <div>
        <label className="block font-medium">Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full px-2 py-1 border rounded" />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
};

export default ProfileEditForm;
