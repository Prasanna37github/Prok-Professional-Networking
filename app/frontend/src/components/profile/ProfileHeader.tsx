import React from 'react';

const ProfileHeader = ({ user }: { user: any }) => (
  <div className="flex flex-col md:flex-row items-center p-4 bg-white rounded shadow">
    <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full mb-4 md:mb-0 md:mr-6" />
    <div className="flex-1">
      <h2 className="text-2xl font-bold">{user.name}</h2>
      <p className="text-gray-600">{user.title} • {user.location}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {user.socials.map((link: any, idx: number) => (
          <a key={link.platform + idx} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm">
            <span>{link.platform}</span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default ProfileHeader;
