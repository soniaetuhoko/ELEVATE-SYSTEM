import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../../contexts/ThemeContext'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </BrowserRouter>
)

describe('Simple Integration Tests', () => {
  it('should render basic component', () => {
    render(
      <TestWrapper>
        <div>Hello ELEVATE</div>
      </TestWrapper>
    )
    
    expect(screen.getByText('Hello ELEVATE')).toBeInTheDocument()
  })

  it('should handle MSW API calls', async () => {
    // Test using MSW handlers instead of direct mocking
    const response = await fetch('http://localhost:4000/api/profile/me')
    const data = await response.json()
    
    expect(response.ok).toBe(true)
    expect(data.success).toBe(true)
  })

  it('should verify test environment setup', () => {
    expect(window.matchMedia).toBeDefined()
    expect(window.localStorage).toBeDefined()
    expect(window.IntersectionObserver).toBeDefined()
    expect(global.fetch).toBeDefined()
  })
})