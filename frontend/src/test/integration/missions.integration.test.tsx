import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import MissionsPage from '../../pages/MissionsPage'
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



describe('Missions Integration', () => {
  it('should render missions page', async () => {
    render(
      <TestWrapper>
        <MissionsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/elevate/i)).toBeInTheDocument()
    })
  })

  it('should show page header', async () => {
    render(
      <TestWrapper>
        <MissionsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })
})