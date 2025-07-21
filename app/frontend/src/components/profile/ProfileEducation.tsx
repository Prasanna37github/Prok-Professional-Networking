

interface Education {
  degree: string;
  field: string;
  school: string;
  start_date: string;
  end_date: string;
  description: string;
}

const ProfileEducation = ({ education }: { education: Education[] }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Education</h3>
    {education && education.length > 0 ? (
      education.map((edu, idx) => (
        <div key={idx} className="mb-4 p-3 border-l-4 border-green-500 bg-gray-50">
          <div className="font-bold text-lg">{edu.degree}</div>
          <div className="text-green-600 font-medium">{edu.field}</div>
          <div className="text-blue-600">{edu.school}</div>
          <div className="text-xs text-gray-500 mb-2">
            {edu.start_date} - {edu.end_date || 'Present'}
          </div>
          {edu.description && (
            <div className="text-gray-700">{edu.description}</div>
          )}
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-sm">No education added yet.</p>
    )}
  </div>
);

export default ProfileEducation;
