

interface Experience {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
}

const ProfileExperience = ({ experience }: { experience: Experience[] }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Work Experience</h3>
    {experience && experience.length > 0 ? (
      experience.map((exp, idx) => (
        <div key={idx} className="mb-4 p-3 border-l-4 border-blue-500 bg-gray-50">
          <div className="font-bold text-lg">{exp.title}</div>
          <div className="text-blue-600 font-medium">{exp.company}</div>
          <div className="text-xs text-gray-500 mb-2">
            {exp.start_date} - {exp.end_date || 'Present'}
          </div>
          <div className="text-gray-700">{exp.description}</div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-sm">No work experience added yet.</p>
    )}
  </div>
);

export default ProfileExperience;
