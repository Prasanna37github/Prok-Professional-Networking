

interface Skill {
  name: string;
  level: string;
}

const ProfileSkills = ({ skills }: { skills: Skill[] }) => (
  <div className="p-4 bg-white rounded shadow mt-4">
    <h3 className="font-semibold mb-2">Skills</h3>
    <div className="flex flex-wrap gap-2">
      {skills && skills.length > 0 ? (
        skills.map((skill, index) => (
          <span 
            key={`${skill.name}-${index}`} 
            className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs"
          >
            {skill.name} ({skill.level})
          </span>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No skills added yet.</p>
      )}
    </div>
  </div>
);

export default ProfileSkills;
