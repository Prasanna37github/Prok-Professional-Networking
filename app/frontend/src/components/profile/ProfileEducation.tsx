import React from 'react';

const ProfileEducation = ({ education }: { education: any[] }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Education</h3>
    {education.map((edu, idx) => (
      <div key={idx} className="mb-2">
        <div className="font-bold">{edu.degree} at {edu.institution}</div>
        <div className="text-xs text-gray-500">{edu.duration}</div>
      </div>
    ))}
  </div>
);

export default ProfileEducation;
