export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  category: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  type: string;
  capacity: number;
  registered: number;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  readTime: string;
  bookmarked: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  expertise?: string[];
  isEmailVerified?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  darkMode: boolean;
} 