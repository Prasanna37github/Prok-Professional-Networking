import React from 'react';

const ProfileHeader = ({ user }: { user: any }) => {
  // Construct the proper image URL
  const getImageUrl = () => {
    if (!user.avatar) {
      return '/default-avatar.png'; // Default avatar
    }
    // If it's already a full URL, use it
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    // Otherwise, construct the backend URL using environment variable
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${API_URL}/api/profile/image/${user.avatar}`;
  };

  return (
    <div className="flex flex-col md:flex-row items-center p-4 bg-white rounded shadow">
      <img 
        src={getImageUrl()} 
        alt="avatar" 
        className="w-24 h-24 rounded-full mb-4 md:mb-0 md:mr-6 object-cover border-2 border-gray-200"
        onError={(e) => {
          // Fallback to default avatar if image fails to load
          e.currentTarget.src = '/default-avatar.png';
        }}
      />
      <div className="flex-1">
        <h2 className="text-2xl font-bold">{user.name || 'No Name'}</h2>
        <p className="text-gray-600">
          {user.title || 'No Title'} • {user.location || 'No Location'}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {user.socials && user.socials.map((link: any, idx: number) => (
            <a 
              key={link.platform + idx} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
            >
              <span>{link.platform}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
