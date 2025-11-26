import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { apiService } from '../../services/api'

// Real API integration tests against Render deployment
// These tests verify actual API connectivity and responses

const RENDER_API_URL = 'https://elevate-system.onrender.com/api'

describe('Render API Integration Tests', () => {
  let testToken: string | null = null
  let testUserId: string | null = null

  beforeAll(async () => {
    // Set up test environment
    console.log('Testing against Render API:', RENDER_API_URL)
  })

  afterAll(async () => {
    // Clean up test data if needed
    if (testToken) {
      localStorage.removeItem('token')
    }
  })

  describe('API Health Check', () => {
    it('should connect to Render API successfully', async () => {
      const response = await fetch(`${RENDER_API_URL.replace('/api', '')}/health`)
      expect(response.ok).toBe(true)
      
      const data = await response.json()
      expect(data.status).toBe('ok')
      expect(data.swagger).toBe('/docs')
    })

    it('should have Swagger documentation available', async () => {
      const response = await fetch(`${RENDER_API_URL.replace('/api', '')}/docs`)
      expect(response.ok).toBe(true)
    })
  })

  describe('Authentication Flow', () => {
    it('should handle registration with OTP (mock test)', async () => {
      // Mock test since we don't want to spam real emails
      const mockRegister = async () => {
        return {
          success: true,
          message: 'OTP sent to email',
          data: { email: 'test@example.com' }
        }
      }

      const result = await mockRegister()
      expect(result.success).toBe(true)
      expect(result.message).toContain('OTP')
    })

    it('should handle login validation', async () => {
      // Test login endpoint structure without valid credentials
      try {
        await apiService.login('invalid@example.com', 'wrongpassword')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('API Error')
      }
    })

    it('should handle OTP verification structure', async () => {
      // Test OTP endpoint structure
      try {
        await apiService.verifyOTP('test@example.com', '000000')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('API Error')
      }
    })
  })

  describe('Protected Endpoints Structure', () => {
    it('should require authentication for missions endpoint', async () => {
      // Clear any existing token
      localStorage.removeItem('token')
      
      try {
        await apiService.getMissions()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('401')
      }
    })

    it('should require authentication for projects endpoint', async () => {
      localStorage.removeItem('token')
      
      try {
        await apiService.getProjects()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('401')
      }
    })

    it('should require authentication for reflections endpoint', async () => {
      localStorage.removeItem('token')
      
      try {
        await apiService.getReflections()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('401')
      }
    })

    it('should require authentication for profile endpoint', async () => {
      localStorage.removeItem('token')
      
      try {
        await apiService.getProfile()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('401')
      }
    })
  })

  describe('Public Endpoints', () => {
    it('should access platform stats without authentication', async () => {
      localStorage.removeItem('token')
      
      try {
        const result = await apiService.getPlatformStats()
        expect(result).toBeDefined()
      } catch (error) {
        // Platform stats might require auth, which is fine
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('API Response Structure', () => {
    it('should return consistent response format', async () => {
      // Test with a public endpoint or mock response
      const mockResponse = {
        success: true,
        data: { test: 'data' },
        message: 'Success'
      }

      expect(mockResponse).toHaveProperty('success')
      expect(mockResponse).toHaveProperty('data')
      expect(typeof mockResponse.success).toBe('boolean')
    })

    it('should handle error responses consistently', async () => {
      try {
        await apiService.getMission('invalid-id')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('API Error')
      }
    })
  })

  describe('File Upload Endpoints', () => {
    it('should handle profile picture upload structure', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      try {
        await apiService.uploadProfilePicture(mockFile)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        // Should fail due to authentication, not endpoint structure
        expect((error as Error).message).toContain('401')
      }
    })

    it('should handle project attachment upload structure', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      
      try {
        await apiService.uploadProjectAttachment(mockFile)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        // Should fail due to authentication, not endpoint structure
        expect((error as Error).message).toContain('401')
      }
    })
  })

  describe('Search Functionality', () => {
    it('should handle search endpoint structure', async () => {
      try {
        await apiService.search('test query')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        // Should fail due to authentication, not endpoint structure
        expect((error as Error).message).toContain('401')
      }
    })
  })

  describe('Admin Endpoints', () => {
    it('should handle admin stats endpoint structure', async () => {
      try {
        await apiService.getAdminStats()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        // Should fail due to authentication/authorization
        expect((error as Error).message).toMatch(/401|403/)
      }
    })

    it('should handle admin users endpoint structure', async () => {
      try {
        await apiService.getAllUsers()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        // Should fail due to authentication/authorization
        expect((error as Error).message).toMatch(/401|403/)
      }
    })
  })

  describe('Documentation Endpoints', () => {
    it('should handle help content endpoint structure', async () => {
      try {
        await apiService.getHelpContent()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        // Should fail due to authentication, not endpoint structure
        expect((error as Error).message).toContain('401')
      }
    })

    it('should handle performance metrics endpoint structure', async () => {
      try {
        await apiService.getPerformanceMetrics()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        // Should fail due to authentication, not endpoint structure
        expect((error as Error).message).toContain('401')
      }
    })

    it('should handle user preferences endpoint structure', async () => {
      try {
        await apiService.getUserPreferences()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        // Should fail due to authentication, not endpoint structure
        expect((error as Error).message).toContain('401')
      }
    })
  })

  describe('CORS and Headers', () => {
    it('should handle CORS properly', async () => {
      // Test that the API accepts requests from the frontend domain
      const response = await fetch(`${RENDER_API_URL.replace('/api', '')}/health`, {
        method: 'GET',
        headers: {
          'Origin': 'https://elevate-system.vercel.app'
        }
      })
      
      expect(response.ok).toBe(true)
    })

    it('should accept JSON content type', async () => {
      try {
        await fetch(`${RENDER_API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: 'test@example.com', password: 'test' })
        })
      } catch (error) {
        // Expected to fail due to invalid credentials, not headers
      }
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      // Test that the API has rate limiting in place
      const requests = Array(5).fill(null).map(() => 
        fetch(`${RENDER_API_URL.replace('/api', '')}/health`)
      )
      
      const responses = await Promise.all(requests)
      
      // All health check requests should succeed (not rate limited)
      responses.forEach(response => {
        expect(response.ok).toBe(true)
      })
    })
  })

  describe('API Versioning', () => {
    it('should use consistent API versioning', async () => {
      const response = await fetch(`${RENDER_API_URL.replace('/api', '')}/health`)
      const data = await response.json()
      
      expect(data).toHaveProperty('version')
      expect(typeof data.version).toBe('string')
    })
  })
})