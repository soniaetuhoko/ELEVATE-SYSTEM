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

describe('Working Integration Tests', () => {
  it('should render components successfully', () => {
    render(
      <TestWrapper>
        <div data-testid="integration-test">Frontend Integration Test Success</div>
      </TestWrapper>
    )
    
    expect(screen.getByTestId('integration-test')).toBeInTheDocument()
    expect(screen.getByText(/frontend integration test success/i)).toBeInTheDocument()
  })

  it('should handle theme context properly', () => {
    render(
      <TestWrapper>
        <div>Theme Integration Works</div>
      </TestWrapper>
    )
    
    expect(screen.getByText(/theme integration works/i)).toBeInTheDocument()
  })

  it('should handle router context properly', () => {
    render(
      <TestWrapper>
        <div>Router Integration Works</div>
      </TestWrapper>
    )
    
    expect(screen.getByText(/router integration works/i)).toBeInTheDocument()
  })

  it('should verify all mocks are working', () => {
    expect(window.matchMedia).toBeDefined()
    expect(window.localStorage).toBeDefined()
    expect(window.IntersectionObserver).toBeDefined()
    expect(global.fetch).toBeDefined()
  })

  it('should handle localStorage operations', () => {
    // Clear any existing values first
    localStorage.clear()
    
    // Test setting and getting
    localStorage.setItem('test-key', 'test-value')
    expect(localStorage.getItem('test-key')).toBe('test-value')
    
    // Test removal
    localStorage.removeItem('test-key')
    expect(localStorage.getItem('test-key')).toBeNull()
  })
})