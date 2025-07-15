export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  title?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  socials?: any[];
  skills?: any[];
  experience?: any[];
  education?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: number;
  user_id: number;
  bio: string;
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  media_url?: string;
  media_type?: string;
  allow_comments: boolean;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
  user?: User;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  read: boolean;
} 