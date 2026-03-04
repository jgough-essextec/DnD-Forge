import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/AuthContext'
import { Loading } from './Loading'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Route wrapper that requires authentication.
 * Redirects unauthenticated users to /login, preserving the originally
 * requested URL so they can be redirected back after login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
