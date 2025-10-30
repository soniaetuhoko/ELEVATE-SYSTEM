// API service layer for ELEVATE platform

import type { Mission, Project, Reflection, Circle, Mentor, UserStats, ApiResponse } from '@/types';
import type { User } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://elevate-system.onrender.com/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, name: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/profile/me');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return this.request('/profile/stats');
  }

  // Platform stats
  async getPlatformStats(): Promise<ApiResponse<any>> {
    return this.request('/stats');
  }

  // Mission endpoints
  async getMissions(page = 1, limit = 10): Promise<ApiResponse<Mission[]>> {
    return this.request(`/missions?page=${page}&limit=${limit}`);
  }

  async getMission(id: string): Promise<ApiResponse<Mission>> {
    return this.request(`/missions/${id}`);
  }

  async createMission(data: Omit<Mission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Mission>> {
    return this.request('/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMission(id: string, data: Partial<Mission>): Promise<ApiResponse<Mission>> {
    return this.request(`/missions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMission(id: string): Promise<ApiResponse<void>> {
    return this.request(`/missions/${id}`, {
      method: 'DELETE',
    });
  }

  // Project endpoints
  async getProjects(page = 1, limit = 10): Promise<ApiResponse<Project[]>> {
    return this.request(`/projects?page=${page}&limit=${limit}`);
  }

  async createProject(data: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Reflection endpoints
  async getReflections(page = 1, limit = 10): Promise<ApiResponse<Reflection[]>> {
    return this.request(`/reflections?page=${page}&limit=${limit}`);
  }

  async createReflection(data: Omit<Reflection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Reflection>> {
    return this.request('/reflections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReflection(id: string, data: Partial<Reflection>): Promise<ApiResponse<Reflection>> {
    return this.request(`/reflections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReflection(id: string): Promise<ApiResponse<void>> {
    return this.request(`/reflections/${id}`, {
      method: 'DELETE',
    });
  }

  // Collaboration endpoints
  async joinCircle(id: string): Promise<ApiResponse<void>> {
    return this.request(`/collaborations/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveCircle(id: string): Promise<ApiResponse<void>> {
    return this.request(`/collaborations/${id}/leave`, {
      method: 'POST',
    });
  }

  async getMentors(): Promise<ApiResponse<Mentor[]>> {
    return this.request('/mentors');
  }

  // Search endpoints
  async search(query: string): Promise<ApiResponse<any>> {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  // Notification endpoints
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Circle endpoints
  async getCircles(): Promise<ApiResponse<Circle[]>> {
    return this.request('/circles');
  }

  async createCircle(data: { name: string; description: string; category?: string }): Promise<ApiResponse<Circle>> {
    return this.request('/circles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCircle(id: string): Promise<ApiResponse<Circle>> {
    return this.request(`/circles/${id}`);
  }

  // File upload endpoints
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/upload/profile', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async uploadProjectAttachment(file: File): Promise<ApiResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/upload/project', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  // Admin endpoints
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/stats');
  }

  async getAllUsers(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/users');
  }

  async exportDataAsPDF(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/export/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.blob();
  }

  async exportDataAsCSV(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/export/csv`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.blob();
  }
}

export const apiService = new ApiService();