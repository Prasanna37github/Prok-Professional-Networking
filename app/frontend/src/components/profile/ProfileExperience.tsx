import React from 'react';

const ProfileExperience = ({ experience }: { experience: any[] }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Work Experience</h3>
    {experience.map((exp, idx) => (
      <div key={idx} className="mb-2">
        <div className="font-bold">{exp.role} at {exp.company}</div>
        <div className="text-xs text-gray-500">{exp.duration}</div>
        <div>{exp.description}</div>
      </div>
    ))}
  </div>
);

export default ProfileExperience;
