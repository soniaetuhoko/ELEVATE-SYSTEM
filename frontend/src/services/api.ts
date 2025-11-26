// API service layer for ELEVATE platform

import type { Mission, Project, Reflection, Circle, Mentor, UserStats, ApiResponse } from '@/types';
import type { User } from '@/types/auth';

interface HelpSection {
  id: string;
  title: string;
  content: string;
  steps: string[];
}

// Type aliases for better maintainability
type MissionData = Omit<Mission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
type ProjectData = Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
type ReflectionData = Omit<Reflection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

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

    // Remove Content-Type for FormData requests
    if (options.body instanceof FormData) {
      delete (config.headers as Record<string, string>)['Content-Type'];
    }

    // Add timeout for requests (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    config.signal = controller.signal;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorText = 'Unknown error';
        try {
          errorText = await response.text();
        } catch {
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please check your connection and try again');
        }
        console.error('API Request failed:', error.message);
        throw error;
      }
      
      console.error('API Request failed:', error);
      throw new Error('Network error - please check your connection');
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, name: string, password: string): Promise<ApiResponse<{ message: string; developmentOTP?: string }>> {
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

  // Profile endpoints
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

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateNotificationSettings(settings: Record<string, boolean>): Promise<ApiResponse<{ success: boolean }>> {
    return this.request('/profile/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async updatePreferences(preferences: Record<string, any>): Promise<ApiResponse<{ success: boolean }>> {
    return this.request('/profile/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getPreferences(): Promise<ApiResponse<any>> {
    return this.request('/profile/preferences');
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

  async createMission(data: MissionData): Promise<ApiResponse<Mission>> {
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

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request(`/projects/${id}`);
  }

  async createProject(data: ProjectData): Promise<ApiResponse<Project>> {
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

  async getReflection(id: string): Promise<ApiResponse<Reflection>> {
    return this.request(`/reflections/${id}`);
  }

  async createReflection(data: ReflectionData): Promise<ApiResponse<Reflection>> {
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

  async deleteCircle(id: string): Promise<ApiResponse<void>> {
    return this.request(`/circles/${id}`, {
      method: 'DELETE',
    });
  }

  async getCirclePosts(circleId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/circles/${circleId}/posts`);
  }

  async createCirclePost(circleId: string, content: string): Promise<ApiResponse<any>> {
    return this.request(`/circles/${circleId}/posts`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async joinCircle(id: string): Promise<ApiResponse<void>> {
    return this.request(`/circles/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveCircle(circleId: string): Promise<ApiResponse<void>> {
    return this.request(`/circles/${circleId}/leave`, {
      method: 'POST',
    });
  }

  // Collaboration endpoints
  async getCollaborations(): Promise<ApiResponse<Circle[]>> {
    return this.request('/collaborations');
  }

  async joinCollaboration(id: string): Promise<ApiResponse<void>> {
    return this.request(`/collaborations/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveCollaboration(id: string): Promise<ApiResponse<void>> {
    return this.request(`/collaborations/${id}/leave`, {
      method: 'POST',
    });
  }

  // Mentor endpoints
  async getMentors(): Promise<ApiResponse<Mentor[]>> {
    return this.request('/mentors');
  }

  async requestMentorship(mentorId: string, message: string): Promise<ApiResponse<void>> {
    return this.request(`/mentors/${mentorId}/request`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // File upload endpoints
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/upload/profile', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadProjectAttachment(file: File): Promise<ApiResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/upload/project', {
      method: 'POST',
      body: formData,
    });
  }

  // Admin endpoints
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/stats');
  }

  async getAllUsers(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/users');
  }

  async createUser(userData: { name: string; email: string; role: string }): Promise<ApiResponse<any>> {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserDetails(id: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${id}`);
  }

  async updateUser(id: string, userData: { name: string; email: string; role: string }): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async updateUserRole(id: string, role: string): Promise<ApiResponse<void>> {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async getAdminCircles(): Promise<ApiResponse<any[]>> {
    return this.request('/admin/circles');
  }

  async createAdminCircle(circleData: { name: string; description: string; isPrivate: boolean }): Promise<ApiResponse<any>> {
    return this.request('/admin/circles', {
      method: 'POST',
      body: JSON.stringify(circleData),
    });
  }

  async deleteAdminCircle(id: string): Promise<ApiResponse<void>> {
    return this.request(`/admin/circles/${id}`, {
      method: 'DELETE',
    });
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

  // Staff endpoints
  async getStudents(): Promise<ApiResponse<any[]>> {
    return this.request('/staff/students');
  }

  async getStaffStats(): Promise<ApiResponse<any>> {
    return this.request('/staff/stats');
  }

  async getMentorshipRequests(): Promise<ApiResponse<any[]>> {
    return this.request('/staff/mentorship-requests');
  }

  async acceptMentorshipRequest(id: string): Promise<ApiResponse<void>> {
    return this.request(`/staff/mentorship-requests/${id}/accept`, {
      method: 'POST',
    });
  }

  async declineMentorshipRequest(id: string): Promise<ApiResponse<void>> {
    return this.request(`/staff/mentorship-requests/${id}/decline`, {
      method: 'POST',
    });
  }

  async getStaffMissions(): Promise<ApiResponse<any[]>> {
    return this.request('/staff/missions');
  }

  async getStaffProjects(): Promise<ApiResponse<any[]>> {
    return this.request('/staff/projects');
  }

  async getStaffReflections(): Promise<ApiResponse<any[]>> {
    return this.request('/staff/reflections');
  }

  // Comment endpoints
  async addComment(type: 'mission' | 'project' | 'reflection', itemId: string, content: string): Promise<ApiResponse<any>> {
    return this.request('/staff/comments', {
      method: 'POST',
      body: JSON.stringify({ content, type, itemId }),
    });
  }

  async getComments(type: 'mission' | 'project' | 'reflection', itemId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/comments/my/${type}/${itemId}`);
  }

  async getStaffComments(type: 'mission' | 'project' | 'reflection', itemId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/staff/comments/${type}/${itemId}`);
  }

  // Achievements
  async getAchievements(): Promise<ApiResponse<any[]>> {
    return this.request('/achievements');
  }

  // Documentation
  async getHelpContent(): Promise<ApiResponse<{ sections: HelpSection[] }>> {
    return this.request('/docs/help');
  }

  async downloadManual(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/docs/manual`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download manual');
    }
    
    return response.blob();
  }

  async markOnboardingCompleted(): Promise<ApiResponse<{ success: boolean }>> {
    return this.request('/docs/onboarding', {
      method: 'POST',
    });
  }

  async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    return this.request('/docs/performance');
  }

  async getDocPreferences(): Promise<ApiResponse<any>> {
    return this.request('/docs/preferences');
  }
}

export default new ApiService();