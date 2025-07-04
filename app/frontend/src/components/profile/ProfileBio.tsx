import React from 'react';

const ProfileBio = ({ bio }: { bio: string }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Bio</h3>
    <p>{bio}</p>
  </div>
);

export default ProfileBio;
