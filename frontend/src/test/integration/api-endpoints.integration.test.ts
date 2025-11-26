import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiService } from '../../services/api'

// Mock fetch for testing
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Endpoints Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.setItem('token', 'test-token')
  })

  describe('Auth Endpoints', () => {
    it('should login with email and password', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { token: 'jwt-token', user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'student' } }
        })
      })

      const result = await apiService.login('test@example.com', 'password')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ email: 'test@example.com', password: 'password' })
        })
      )
      expect(result.success).toBe(true)
    })

    it('should register new user and send OTP', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'OTP sent' })
      })

      await apiService.register('test@example.com', 'Test User', 'password')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', name: 'Test User', password: 'password' })
        })
      )
    })

    it('should verify OTP and complete registration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Registration complete' })
      })

      await apiService.verifyOTP('test@example.com', '123456')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/auth/verify-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', otp: '123456' })
        })
      )
    })
  })

  describe('Mission Endpoints', () => {
    it('should list user missions', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

      await apiService.getMissions()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/missions?page=1&limit=10',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should create a mission', async () => {
      const missionData = {
        title: 'Test Mission',
        description: 'Test Description',
        deadline: '2024-12-31',
        category: 'Technical',
        status: 'Planning' as const,
        progress: 0,
        projects: 0,
        reflections: 0
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', ...missionData } })
      })

      await apiService.createMission(missionData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/missions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(missionData)
        })
      )
    })

    it('should get mission by id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', title: 'Test Mission' } })
      })

      await apiService.getMission('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/missions/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should update a mission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', title: 'Updated Mission' } })
      })

      await apiService.updateMission('1', { title: 'Updated Mission' })
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/missions/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Mission' })
        })
      )
    })

    it('should delete a mission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await apiService.deleteMission('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/missions/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('Project Endpoints', () => {
    it('should list user projects', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

      await apiService.getProjects()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/projects?page=1&limit=10',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should create a new project', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'Test Description',
        status: 'Planning' as const,
        missionId: '1',
        progress: 0,
        startDate: '2024-01-01',
        dueDate: '2024-12-31',
        technologies: ['React', 'TypeScript']
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', ...projectData } })
      })

      await apiService.createProject(projectData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/projects',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(projectData)
        })
      )
    })

    it('should get project by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', title: 'Test Project' } })
      })

      await apiService.getProject('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/projects/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should update project', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', title: 'Updated Project' } })
      })

      await apiService.updateProject('1', { title: 'Updated Project' })
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/projects/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Project' })
        })
      )
    })

    it('should delete project', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await apiService.deleteProject('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/projects/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('Reflection Endpoints', () => {
    it('should list user reflections', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

      await apiService.getReflections()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/reflections?page=1&limit=10',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should create new reflection', async () => {
      const reflectionData = {
        title: 'Weekly Reflection',
        content: 'This week I learned...',
        missionId: '1',
        weekNumber: 1,
        keyLearnings: ['React', 'TypeScript'],
        challenges: ['State management'],
        improvements: ['Better testing']
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', ...reflectionData } })
      })

      await apiService.createReflection(reflectionData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/reflections',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(reflectionData)
        })
      )
    })

    it('should get reflection by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', title: 'Test Reflection' } })
      })

      await apiService.getReflection('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/reflections/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should update reflection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', title: 'Updated Reflection' } })
      })

      await apiService.updateReflection('1', { title: 'Updated Reflection' })
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/reflections/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Reflection' })
        })
      )
    })

    it('should delete reflection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await apiService.deleteReflection('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/reflections/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('Profile Endpoints', () => {
    it('should get current user profile', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', name: 'Test User' } })
      })

      await apiService.getProfile()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/profile/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should update user profile', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', name: 'Updated User' } })
      })

      await apiService.updateProfile({ name: 'Updated User' })
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/profile/me',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated User' })
        })
      )
    })

    it('should get user statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { missionsCompleted: 5, projectsDone: 3 } })
      })

      await apiService.getUserStats()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/profile/stats',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Platform Stats', () => {
    it('should get platform statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { activeStudents: 100, missionsCompleted: 500 } })
      })

      await apiService.getPlatformStats()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/stats',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Search', () => {
    it('should search across all content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { results: [], total: 0 } })
      })

      await apiService.search('test query')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/search?q=test%20query',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Notifications', () => {
    it('should get user notifications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

      await apiService.getNotifications()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/notifications',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should mark notification as read', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await apiService.markNotificationAsRead('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/notifications/1/read',
        expect.objectContaining({
          method: 'PUT'
        })
      )
    })
  })

  describe('Circles', () => {
    it('should list peer circles', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

      await apiService.getCircles()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/circles',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should create new circle', async () => {
      const circleData = { name: 'Test Circle', description: 'Test Description', category: 'Technical' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', ...circleData } })
      })

      await apiService.createCircle(circleData)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/circles',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(circleData)
        })
      )
    })

    it('should get circle details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', name: 'Test Circle' } })
      })

      await apiService.getCircle('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/circles/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Collaborations', () => {
    it('should list collaboration circles', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

      await apiService.getCollaborations()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/collaborations',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should join a collaboration circle', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await apiService.joinCircle('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/collaborations/1/join',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })

    it('should leave a collaboration circle', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await apiService.leaveCircle('1')
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/collaborations/1/leave',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  describe('Mentors', () => {
    it('should list available mentors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

      await apiService.getMentors()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/mentors',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Upload', () => {
    it('should upload profile picture', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { url: 'https://example.com/image.jpg', publicId: 'test' } })
      })

      await apiService.uploadProfilePicture(file)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/upload/profile',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should upload project attachment', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { url: 'https://example.com/file.pdf', publicId: 'test' } })
      })

      await apiService.uploadProjectAttachment(file)
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/upload/project',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Admin', () => {
    it('should get system statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { totalUsers: 100, totalMissions: 500 } })
      })

      await apiService.getAdminStats()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/admin/stats',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should list all users', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

      await apiService.getAllUsers()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/admin/users',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should export data as PDF', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['pdf content'], { type: 'application/pdf' })
      })

      await apiService.exportDataAsPDF()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/admin/export/pdf',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should export data as CSV', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['csv content'], { type: 'text/csv' })
      })

      await apiService.exportDataAsCSV()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/admin/export/csv',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Documentation', () => {
    it('should download user manual PDF', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['manual content'], { type: 'application/pdf' })
      })

      await apiService.downloadManual()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/docs/manual',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should get in-app help content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { sections: [] } })
      })

      await apiService.getHelpContent()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/docs/help',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should get system performance metrics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { uptime: '99.9%', responseTime: '200ms' } })
      })

      await apiService.getPerformanceMetrics()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/docs/performance',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should get user preferences for onboarding and help', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { onboardingCompleted: false, helpTooltipsEnabled: true } })
      })

      await apiService.getUserPreferences()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/docs/preferences',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('should mark onboarding as completed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await apiService.markOnboardingCompleted()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://elevate-system.onrender.com/api/docs/onboarding',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors properly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Unauthorized access'
      })

      await expect(apiService.getProfile()).rejects.toThrow('API Error: 401 Unauthorized - Unauthorized access')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(apiService.getProfile()).rejects.toThrow('Network error')
    })
  })
})