import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage with actual storage
const localStorageMock = (() => {
  let store: Record<string, string> = {
    token: 'mock-jwt-token',
    user: JSON.stringify({ id: '1', name: 'Test User', email: 'test@alustudent.com', role: 'student' })
  }

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
})

// Mock fetch properly
const mockFetch = vi.fn()
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: mockFetch,
})

// Ensure mockResolvedValueOnce exists
if (!mockFetch.mockResolvedValueOnce) {
  mockFetch.mockResolvedValueOnce = vi.fn().mockImplementation((value) => {
    mockFetch.mockResolvedValue(value)
    return mockFetch
  })
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())