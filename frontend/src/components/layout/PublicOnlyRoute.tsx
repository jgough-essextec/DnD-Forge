import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/AuthContext'
import { Loading } from './Loading'
import type { ReactNode } from 'react'

interface PublicOnlyRouteProps {
  children: ReactNode
}

/**
 * Route wrapper that only allows unauthenticated users.
 * Authenticated users are redirected to the home page.
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <Loading />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
