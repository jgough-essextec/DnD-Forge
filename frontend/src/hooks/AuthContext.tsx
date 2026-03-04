import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import type { LoginCredentials, RegisterData, User } from '@/types/auth'
import { useCurrentUser, useLogin, useLogout, useRegister } from './useAuth'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<User>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading: isUserLoading, isFetching } = useCurrentUser()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()
  const registerMutation = useRegister()

  const isLoading = isUserLoading || (isFetching && user === undefined)

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<User> => {
      return loginMutation.mutateAsync(credentials)
    },
    [loginMutation]
  )

  const logout = useCallback(async (): Promise<void> => {
    return logoutMutation.mutateAsync()
  }, [logoutMutation])

  const register = useCallback(
    async (data: RegisterData): Promise<User> => {
      return registerMutation.mutateAsync(data)
    },
    [registerMutation]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      register,
    }),
    [user, isLoading, login, logout, register]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access the auth context. Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
