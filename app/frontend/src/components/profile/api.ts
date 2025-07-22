const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const profileApi = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getProfileByUsername: async (username: string) => {
    const response = await fetch(`${API_URL}/api/profile?username=${username}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/api/profile/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    return response.json();
  },

  updateSkills: async (skills: any[]) => {
    const response = await fetch(`${API_URL}/api/profile/skills`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ skills }),
    });
    return response.json();
  },

  updateExperience: async (experience: any[]) => {
    const response = await fetch(`${API_URL}/api/profile/experience`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ experience }),
    });
    return response.json();
  },

  updateEducation: async (education: any[]) => {
    const response = await fetch(`${API_URL}/api/profile/education`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ education }),
    });
    return response.json();
  },

  updateSocials: async (socials: any[]) => {
    const response = await fetch(`${API_URL}/api/profile/socials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ socials }),
    });
    return response.json();
  },

  deleteProfile: async () => {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },
}; 