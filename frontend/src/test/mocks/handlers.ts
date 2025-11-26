import { http, HttpResponse } from 'msw'

const API_BASE_LOCAL = 'http://localhost:4000/api'
const API_BASE_PROD = 'https://elevate-system.onrender.com/api'

// Create handlers for both environments
const createHandlers = (apiBase: string) => [
  // Auth endpoints
  http.post(`${apiBase}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@alustudent.com',
          role: 'student'
        }
      }
    })
  }),

  http.post(`${apiBase}/auth/register`, () => {
    return HttpResponse.json({
      success: true,
      message: 'OTP sent to email'
    })
  }),

  // Profile endpoints
  http.get(`${apiBase}/profile/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        name: 'Test User',
        email: 'test@alustudent.com',
        role: 'student'
      }
    })
  }),

  // Missions endpoints
  http.get(`${apiBase}/missions`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          title: 'Test Mission',
          description: 'Test Description',
          status: 'active',
          category: 'technical'
        }
      ]
    })
  }),

  http.post(`${apiBase}/missions`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '2',
        title: 'New Mission',
        description: 'New Description',
        status: 'active'
      }
    })
  }),

  // Notifications endpoints
  http.get(`${apiBase}/notifications`, () => {
    return HttpResponse.json({
      success: true,
      data: []
    })
  }),

  // Missions with pagination
  http.get(`${apiBase}/missions`, ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '10'
    
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          title: 'Test Mission',
          description: 'Test Description',
          status: 'active',
          category: 'technical'
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 1
      }
    })
  })
]

export const handlers = [
  ...createHandlers(API_BASE_LOCAL),
  ...createHandlers(API_BASE_PROD)
]