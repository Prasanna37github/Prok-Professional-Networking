export const mockUser = {
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  name: 'John Doe',
  username: 'johndoe',
  title: 'Software Engineer',
  location: 'San Francisco, CA',
  socials: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe', icon: '/linkedin.svg' },
    { platform: 'GitHub', url: 'https://github.com/johndoe', icon: '/github.svg' }
  ],
  bio: 'Passionate developer with 5+ years of experience in web and mobile applications.',
  skills: ['React', 'Node.js', 'TypeScript', 'Python'],
  experience: [
    { role: 'Senior Developer', company: 'TechCorp', duration: '2022-Present', description: 'Leading a team of frontend engineers.' },
    { role: 'Developer', company: 'Webify', duration: '2019-2022', description: 'Built scalable web apps.' }
  ],
  education: [
    { degree: 'B.Sc. Computer Science', institution: 'Stanford University', duration: '2015-2019' }
  ],
  contact: { email: 'john@example.com', phone: '123-456-7890', location: 'San Francisco, CA' }
};

export const mockActivity = [
  { type: 'Post', content: 'Shared a new project!', date: '2025-07-01' },
  { type: 'Comment', content: 'Commented on a post.', date: '2025-06-28' }
];

export const mockTimeline = [
  { event: 'Joined TechCorp', date: '2022-01-10' },
  { event: 'Graduated from Stanford', date: '2019-06-15' }
];
