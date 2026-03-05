import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '../app/store'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

/**
 * Normalize role for safe comparison (case-insensitive)
 * Backend may return 'Admin', 'Sales', etc.
 */
function normalizeRole(role: string | undefined): string {
  return (role || '').toLowerCase().trim()
}

/**
 * Check if user's role is in the list of allowed roles
 * Comparison is case-insensitive for safety
 */
function isRoleAllowed(userRole: string | undefined, allowedRoles: string[] | undefined): boolean {
  // If no role restrictions specified, all authenticated users can access
  if (!allowedRoles || allowedRoles.length === 0) {
    return true
  }

  if (!userRole) {
    return false
  }

  const normalizedUserRole = normalizeRole(userRole)
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole)

  return normalizedAllowedRoles.includes(normalizedUserRole)
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading, initialized } = useSelector((state: RootState) => state.auth)
  const hasToken = Boolean(localStorage.getItem('auth_token'))

  // Avoid redirect flicker while validating an existing session token.
  if (hasToken && (!initialized || loading) && !isAuthenticated) {
    return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>Loading...</div>
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If allowedRoles is specified, check if user's role is in the list
  if (!isRoleAllowed(user?.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
