import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  LoginCredentials,
  ProfileUpdateData,
  RegisterData,
  User,
} from '@/types/auth'

/**
 * Map snake_case API response to camelCase User interface.
 */
function mapUserResponse(data: Record<string, unknown>): User {
  return {
    id: data.id as string,
    username: data.username as string,
    email: data.email as string,
    displayName: (data.display_name as string) ?? '',
    avatarUrl: (data.avatar_url as string) ?? '',
    dateJoined: data.date_joined as string,
  }
}

export const AUTH_USER_KEY = ['auth', 'me'] as const

/**
 * Query hook to get the current authenticated user.
 * Returns null if not authenticated (401/403).
 */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: AUTH_USER_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me/')
        return mapUserResponse(response.data)
      } catch {
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

/**
 * Mutation hook for user login.
 * On success, sets the current user in the query cache.
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/auth/login/', credentials)
      return mapUserResponse(response.data)
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_USER_KEY, user)
    },
  })
}

/**
 * Mutation hook for user logout.
 * Clears all cached data on success.
 */
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout/')
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_USER_KEY, null)
      queryClient.clear()
    },
  })
}

/**
 * Mutation hook for user registration.
 * On success, sets the current user in the query cache (auto-logged-in).
 */
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post('/auth/register/', {
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.passwordConfirm,
      })
      return mapUserResponse(response.data)
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_USER_KEY, user)
    },
  })
}

/**
 * Mutation hook for updating the current user's profile.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const payload: Record<string, unknown> = {}
      if (data.email !== undefined) payload.email = data.email
      if (data.displayName !== undefined) payload.display_name = data.displayName
      if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl
      if (data.preferences !== undefined) payload.preferences = data.preferences
      const response = await api.patch('/auth/me/', payload)
      return mapUserResponse(response.data)
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_USER_KEY, user)
    },
  })
}
