export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'Planning' | 'In Progress' | 'Near Completion' | 'Completed';
  deadline: string;
  projects: number;
  reflections: number;
  category: 'Technical' | 'Soft Skills' | 'Business';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Completed';
  missionId: string;
  progress: number;
  startDate: string;
  dueDate: string;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reflection {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  missionId: string;
  date: string;
  wordCount: number;
  mood: 'Productive' | 'Insightful' | 'Accomplished' | 'Challenging' | 'Inspired';
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  members: number;
  posts: number;
  category: 'Technical' | 'Soft Skills' | 'Business';
  isJoined: boolean;
  createdAt: string;
}

export interface UserStats {
  missionsCompleted: number;
  projectsDone: number;
  reflectionsWritten: number;
  learningStreak: number;
  totalMissions: number;
  inProgressMissions: number;
  avgProgress: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
