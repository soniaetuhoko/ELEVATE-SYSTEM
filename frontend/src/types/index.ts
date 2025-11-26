// Core data types for the ELEVATE platform

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'Not Started' | 'Planning' | 'In Progress' | 'Near Completion' | 'Completed';
  deadline: string;
  projects: number;
  reflections: number;
  category: string;
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
  repositoryUrl?: string;
  liveUrl?: string;
  technologies?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reflection {
  id: string;
  title: string;
  content: string;
  missionId?: string;
  projectId?: string;
  weekNumber?: number;
  keyLearnings?: string[];
  challenges?: string[];
  improvements?: string[];
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
  isMember: boolean;
  createdAt: string;
  updatedAt: string;
  membersList?: {
    id: string;
    name: string;
    avatar?: string;
    joinedAt: string;
    role: string;
  }[];
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  students: number;
  rating: number;
  available: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}