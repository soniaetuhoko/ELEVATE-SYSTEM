import { describe, it, expect, beforeEach } from 'vitest'

describe('Fixed API Integration', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock-jwt-token')
  })

  it('should test fetch without mocking issues', async () => {
    // Test basic fetch functionality
    const response = await fetch('http://localhost:4000/api/profile/me')
    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)
    expect(data.data.email).toBe('test@alustudent.com')
  })

  it('should test missions endpoint', async () => {
    const response = await fetch('http://localhost:4000/api/missions')
    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('should test notifications endpoint', async () => {
    const response = await fetch('http://localhost:4000/api/notifications')
    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('should test production API endpoints', async () => {
    const response = await fetch('https://elevate-system.onrender.com/api/notifications')
    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)
  })
})