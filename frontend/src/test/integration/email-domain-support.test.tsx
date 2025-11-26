import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'
import LoginPage from '../../pages/LoginPage'
import { apiService } from '../../services/api'

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    login: vi.fn(),
    register: vi.fn(),
    verifyOTP: vi.fn()
  }
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

describe('Email Domain Support', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login Form', () => {
    it('should accept Gmail addresses', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'user@gmail.com' } })
      
      expect(emailInput).toHaveValue('user@gmail.com')
    })

    it('should accept Yahoo addresses', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'user@yahoo.com' } })
      
      expect(emailInput).toHaveValue('user@yahoo.com')
    })

    it('should accept Outlook addresses', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'user@outlook.com' } })
      
      expect(emailInput).toHaveValue('user@outlook.com')
    })

    it('should accept custom domain addresses', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'user@company.co.uk' } })
      
      expect(emailInput).toHaveValue('user@company.co.uk')
    })

    it('should accept ALU student addresses', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'student@alustudent.com' } })
      
      expect(emailInput).toHaveValue('student@alustudent.com')
    })

    it('should accept ALU education addresses', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'mentor@alueducation.com' } })
      
      expect(emailInput).toHaveValue('mentor@alueducation.com')
    })
  })

  describe('Registration Form', () => {
    it('should show helpful message about email domain support', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Switch to register mode
      const registerLink = screen.getByText(/don't have an account/i)
      fireEvent.click(registerLink)

      // Check for the helpful message
      expect(screen.getByText(/any email domain is supported/i)).toBeInTheDocument()
    })

    it('should accept any email domain for registration', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Switch to register mode
      const registerLink = screen.getByText(/don't have an account/i)
      fireEvent.click(registerLink)

      const emailInput = screen.getByLabelText(/email/i)
      
      // Test various email domains
      const testEmails = [
        'test@gmail.com',
        'user@yahoo.com', 
        'person@outlook.com',
        'employee@company.org',
        'student@university.edu',
        'contact@startup.io'
      ]

      testEmails.forEach(email => {
        fireEvent.change(emailInput, { target: { value: email } })
        expect(emailInput).toHaveValue(email)
      })
    })

    it('should not restrict email domains during registration', async () => {
      vi.mocked(apiService.register).mockResolvedValueOnce({
        success: true,
        message: 'OTP sent',
        data: { developmentOTP: '123456' }
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Switch to register mode
      const registerLink = screen.getByText(/don't have an account/i)
      fireEvent.click(registerLink)

      // Fill form with non-ALU email
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const registerButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(registerButton)

      // Should call API with any email domain
      expect(apiService.register).toHaveBeenCalledWith('test@gmail.com', 'Test User', 'password123')
    })
  })

  describe('Email Input Validation', () => {
    it('should use HTML5 email validation only', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      
      // Check that it's using HTML5 email type
      expect(emailInput.type).toBe('email')
      expect(emailInput.required).toBe(true)
      
      // HTML5 email validation should handle basic format checking
      // No custom domain restrictions should be applied
    })

    it('should show generic placeholder text', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('placeholder', 'your.email@example.com')
    })
  })

  describe('API Integration', () => {
    it('should send any email domain to login API', async () => {
      vi.mocked(apiService.login).mockResolvedValueOnce({
        success: true,
        data: {
          token: 'mock-token',
          user: { id: '1', email: 'test@gmail.com', name: 'Test User', role: 'student' }
        }
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(loginButton)

      expect(apiService.login).toHaveBeenCalledWith('test@gmail.com', 'password123')
    })

    it('should send any email domain to register API', async () => {
      vi.mocked(apiService.register).mockResolvedValueOnce({
        success: true,
        message: 'OTP sent',
        data: {}
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Switch to register mode
      const registerLink = screen.getByText(/don't have an account/i)
      fireEvent.click(registerLink)

      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const registerButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(emailInput, { target: { value: 'user@company.org' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(registerButton)

      expect(apiService.register).toHaveBeenCalledWith('user@company.org', 'Test User', 'password123')
    })
  })
})