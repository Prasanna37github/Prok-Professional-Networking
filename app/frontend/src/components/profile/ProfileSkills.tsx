import React from 'react';

const ProfileSkills = ({ skills }: { skills: string[] }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Skills</h3>
    <div className="flex flex-wrap gap-2">
      {skills.map(skill => (
        <span key={skill} className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">{skill}</span>
      ))}
    </div>
  </div>
);

export default ProfileSkills;
