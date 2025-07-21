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
    email: user.email || '',
    skills: user.skills || [],
    experience: user.experience || [],
    education: user.education || []
  });

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

  // Skills management
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm({
        ...form,
        skills: [...form.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setForm({
      ...form,
      skills: form.skills.filter((skill: any) => skill !== skillToRemove)
    });
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    user.avatar ? `http://localhost:5000/api/profile/image/${user.avatar}` : '/default-avatar.png'
  );

  // Initialize form with user data
  useEffect(() => {
    setForm({
      name: user.name || '',
      title: user.title || '',
      location: user.location || '',
      bio: user.bio || '',
      phone: user.phone || '',
      email: user.email || '',
      skills: user.skills || [],
      experience: user.experience || [],
      education: user.education || []
    });
    setImagePreview(user.avatar ? `http://localhost:5000/api/profile/image/${user.avatar}` : '/default-avatar.png');
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      setError(''); // Clear any previous errors
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        setImageUploading(true);
        try {
          const imageResult = await profileApi.uploadImage(selectedImage);
          if (!imageResult.success) {
            setError('Failed to upload image: ' + (imageResult.message || 'Unknown error'));
            setLoading(false);
            setImageUploading(false);
            return;
          }
          // Extract filename from the avatar_url
          avatarFilename = imageResult.avatar_url?.split('/').pop() || null;
          if (!avatarFilename) {
            setError('Failed to get uploaded image filename');
            setLoading(false);
            setImageUploading(false);
            return;
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          setImageUploading(false);
          return;
        } finally {
          setImageUploading(false);
        }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                  }}
                />
                <label className={`absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 cursor-pointer hover:bg-purple-700 transition-colors shadow-lg ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={imageUploading}
                  />
                  {imageUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  )}
                </label>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-gray-600 mt-1">Update your professional information</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}

          {imageUploading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-2"></div>
              Uploading image...
            </div>
          )}

                      {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g., Software Engineer, Product Manager"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Skills Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      placeholder="Add a skill (e.g., JavaScript, Project Management)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                      >
                        <span>{typeof skill === 'string' ? skill : skill.name || skill.skill || 'Unknown Skill'}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(typeof skill === 'string' ? skill : skill.name || skill.skill || '')}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
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
                  <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
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
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm;
