import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { resetMockUser, setMockUser } from '@/mocks/handlers'
import { AuthProvider, useAuth } from '@/hooks/AuthContext'
import { Routes, Route } from 'react-router-dom'

/**
 * Test component that displays auth state for assertions.
 */
function AuthDisplay() {
  const { user, isAuthenticated, isLoading } = useAuth()
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="username">{user?.username ?? 'none'}</div>
    </div>
  )
}

/**
 * Test component with login form.
 */
function LoginForm() {
  const { login, isAuthenticated, user } = useAuth()

  async function handleLogin() {
    try {
      await login({ username: 'testuser', password: 'SecurePass123!' })
    } catch {
      // ignore in test
    }
  }

  async function handleBadLogin() {
    try {
      await login({ username: 'wrong', password: 'wrong' })
    } catch {
      // ignore in test
    }
  }

  return (
    <div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="username">{user?.username ?? 'none'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleBadLogin}>Bad Login</button>
    </div>
  )
}

/**
 * Test component with register form.
 */
function RegisterForm() {
  const { register, isAuthenticated, user } = useAuth()

  async function handleRegister() {
    try {
      await register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'SecurePass123!',
        passwordConfirm: 'SecurePass123!',
      })
    } catch {
      // ignore in test
    }
  }

  return (
    <div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="username">{user?.username ?? 'none'}</div>
      <button onClick={handleRegister}>Register</button>
    </div>
  )
}

/**
 * Test component with logout.
 */
function LogoutButton() {
  const { logout, isAuthenticated, user } = useAuth()

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // ignore in test
    }
  }

  return (
    <div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="username">{user?.username ?? 'none'}</div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

function renderAuthComponent(ui: React.ReactElement, route = '/') {
  return renderWithProviders(
    <AuthProvider>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </AuthProvider>,
    { route }
  )
}

describe('Auth hooks and context', () => {
  beforeEach(() => {
    resetMockUser()
  })

  describe('useCurrentUser / AuthContext initial state', () => {
    it('should return null user when not authenticated', async () => {
      renderAuthComponent(<AuthDisplay />)
      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false')
        expect(screen.getByTestId('username').textContent).toBe('none')
      })
    })

    it('should return user data when authenticated', async () => {
      setMockUser({
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        avatar_url: '',
        date_joined: '2024-01-01T00:00:00Z',
      })

      renderAuthComponent(<AuthDisplay />)
      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true')
        expect(screen.getByTestId('username').textContent).toBe('testuser')
      })
    })
  })

  describe('useLogin', () => {
    it('should update auth context on successful login', async () => {
      const user = userEvent.setup()
      renderAuthComponent(<LoginForm />)

      // Initially not authenticated
      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false')
      })

      // Perform login
      await user.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true')
        expect(screen.getByTestId('username').textContent).toBe('testuser')
      })
    })
  })

  describe('useRegister', () => {
    it('should update auth context on successful registration', async () => {
      const user = userEvent.setup()
      renderAuthComponent(<RegisterForm />)

      // Initially not authenticated
      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false')
      })

      // Perform registration
      await user.click(screen.getByText('Register'))

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true')
        expect(screen.getByTestId('username').textContent).toBe('newuser')
      })
    })
  })

  describe('useLogout', () => {
    it('should clear auth context on logout', async () => {
      setMockUser({
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        avatar_url: '',
        date_joined: '2024-01-01T00:00:00Z',
      })

      const user = userEvent.setup()
      renderAuthComponent(<LogoutButton />)

      // Initially authenticated
      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true')
        expect(screen.getByTestId('username').textContent).toBe('testuser')
      })

      // Perform logout
      await user.click(screen.getByText('Logout'))

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false')
        expect(screen.getByTestId('username').textContent).toBe('none')
      })
    })
  })
})
