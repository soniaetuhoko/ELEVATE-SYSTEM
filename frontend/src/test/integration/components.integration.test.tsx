import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

describe('Component Integration', () => {
  it('should render basic components', () => {
    render(
      <TestWrapper>
        <div data-testid="test-component">ELEVATE Test</div>
      </TestWrapper>
    )

    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText(/elevate test/i)).toBeInTheDocument()
  })

  it('should handle theme context', () => {
    render(
      <TestWrapper>
        <div>Theme Test</div>
      </TestWrapper>
    )

    expect(screen.getByText(/theme test/i)).toBeInTheDocument()
  })

  it('should handle router context', () => {
    render(
      <TestWrapper>
        <div>Router Test</div>
      </TestWrapper>
    )

    expect(screen.getByText(/router test/i)).toBeInTheDocument()
  })
})