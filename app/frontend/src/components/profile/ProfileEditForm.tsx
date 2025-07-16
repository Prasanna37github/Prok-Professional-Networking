import React, { useState, useEffect } from 'react';
import { profileApi } from './api';

interface ProfileEditFormProps {
  user: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: user.name || '',
    title: user.title || '',
    location: user.location || '',
    bio: user.bio || '',
    phone: user.phone || '',
    skills: user.skills || [],
    experience: user.experience || [],
    education: user.education || [],
    socials: user.socials || []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user.avatar ? `http://localhost:5000/api/profile/image/${user.avatar}` : null);

  // Initialize form with user data
  useEffect(() => {
    setForm({
      name: user.name || '',
      title: user.title || '',
      location: user.location || '',
      bio: user.bio || '',
      phone: user.phone || '',
      skills: user.skills || [],
      experience: user.experience || [],
      education: user.education || [],
      socials: user.socials || []
    });
    setImagePreview(user.avatar ? `http://localhost:5000/api/profile/image/${user.avatar}` : null);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Skills management
  const addSkill = () => {
    setForm({
      ...form,
      skills: [...form.skills, { name: '', level: 'Beginner' }]
    });
  };

  const updateSkill = (index: number, field: string, value: string) => {
    const updatedSkills = [...form.skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setForm({ ...form, skills: updatedSkills });
  };

  const removeSkill = (index: number) => {
    setForm({
      ...form,
      skills: form.skills.filter((_: any, i: number) => i !== index)
    });
  };

  // Experience management
  const addExperience = () => {
    setForm({
      ...form,
      experience: [...form.experience, { 
        title: '', 
        company: '', 
        start_date: '', 
        end_date: '', 
        description: '' 
      }]
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updatedExperience = [...form.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setForm({ ...form, experience: updatedExperience });
  };

  const removeExperience = (index: number) => {
    setForm({
      ...form,
      experience: form.experience.filter((_: any, i: number) => i !== index)
    });
  };

  // Education management
  const addEducation = () => {
    setForm({
      ...form,
      education: [...form.education, { 
        degree: '', 
        field: '', 
        school: '', 
        start_date: '', 
        end_date: '', 
        description: '' 
      }]
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...form.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setForm({ ...form, education: updatedEducation });
  };

  const removeEducation = (index: number) => {
    setForm({
      ...form,
      education: form.education.filter((_: any, i: number) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!form.name || !form.title || !form.location || !form.bio) {
        setError('Name, Title, Location, and Bio are required.');
        setLoading(false);
        return;
      }

      // Upload image if selected
      let avatarFilename = user.avatar;
      if (selectedImage) {
        const imageResult = await profileApi.uploadImage(selectedImage);
        if (!imageResult.success) {
          setError('Failed to upload image: ' + imageResult.message);
          setLoading(false);
          return;
        }
        avatarFilename = imageResult.avatar_url?.split('/').pop() || selectedImage.name;
      }

      // Update profile
      const result = await profileApi.updateProfile(form);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        
        // Update the user data with the new profile
        const updatedUser = { 
          ...user, 
          ...form,
          avatar: avatarFilename
        };
        onSave(updatedUser);
        
        // Refetch profile to get updated data
        const username = localStorage.getItem('username');
        if (username) {
          const profileResult = await profileApi.getProfileByUsername(username);
          if (profileResult.success) {
            onSave(profileResult.profile);
          }
        }
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg space-y-6 max-h-screen overflow-y-auto">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={imagePreview || '/default-avatar.png'}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </label>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <p className="text-gray-600">Update your professional information</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Software Engineer"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., San Francisco, CA"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about yourself..."
          required
        />
      </div>

      {/* Skills Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Skills</h3>
          <button
            type="button"
            onClick={addSkill}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add Skill
          </button>
        </div>
        {form.skills.map((skill: any, index: number) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              value={skill.name || ''}
              onChange={(e) => updateSkill(index, 'name', e.target.value)}
              placeholder="Skill name"
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={skill.level || 'Beginner'}
              onChange={(e) => updateSkill(index, 'level', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Experience Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
          <button
            type="button"
            onClick={addExperience}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add Experience
          </button>
        </div>
        {form.experience.map((exp: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={exp.title || ''}
                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                placeholder="Job Title"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={exp.company || ''}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                placeholder="Company"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="month"
                value={exp.start_date || ''}
                onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                placeholder="Start Date"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="month"
                value={exp.end_date || ''}
                onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                placeholder="End Date"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <textarea
              value={exp.description || ''}
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              placeholder="Job Description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove Experience
            </button>
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Education</h3>
          <button
            type="button"
            onClick={addEducation}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add Education
          </button>
        </div>
        {form.education.map((edu: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={edu.degree || ''}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                placeholder="Degree"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={edu.field || ''}
                onChange={(e) => updateEducation(index, 'field', e.target.value)}
                placeholder="Field of Study"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={edu.school || ''}
                onChange={(e) => updateEducation(index, 'school', e.target.value)}
                placeholder="School/University"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="month"
                value={edu.start_date || ''}
                onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                placeholder="Start Date"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="month"
                value={edu.end_date || ''}
                onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                placeholder="End Date"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <textarea
              value={edu.description || ''}
              onChange={(e) => updateEducation(index, 'description', e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <button
              type="button"
              onClick={() => removeEducation(index)}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove Education
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => window.location.href = '/dashboard'}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Go to Dashboard
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
