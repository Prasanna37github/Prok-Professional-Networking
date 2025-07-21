

const ProfileActivity = ({ activity }: { activity: any[] }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Recent Activity</h3>
    {activity.map((act, idx) => (
      <div key={idx} className="mb-2">
        <div>{act.type}: {act.content}</div>
        <div className="text-xs text-gray-500">{act.date}</div>
      </div>
    ))}
  </div>
);

export default ProfileActivity;
