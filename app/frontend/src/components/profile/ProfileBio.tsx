

const ProfileBio = ({ bio }: { bio: string }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Bio</h3>
    {bio ? (
      <p className="text-gray-700">{bio}</p>
    ) : (
      <p className="text-gray-500 text-sm">No bio added yet.</p>
    )}
  </div>
);

export default ProfileBio;
