

const ProfileTimeline = ({ timeline }: { timeline: any[] }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Activity Timeline</h3>
    {timeline.map((item, idx) => (
      <div key={idx} className="mb-2">
        <div>{item.event}</div>
        <div className="text-xs text-gray-500">{item.date}</div>
      </div>
    ))}
  </div>
);

export default ProfileTimeline;
