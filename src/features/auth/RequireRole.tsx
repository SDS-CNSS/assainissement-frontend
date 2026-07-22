import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  selectIsAuthenticated,
  selectMustChangePassword,
  useAuthStore,
} from './authStore'
import type { SymfonyRole } from './types'
import { userHasRole } from './types'

export function RequireAuth() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

/** RG-19 : redirection forcée tant que isFirstConnexion est actif. */
export function RequirePasswordChanged() {
  const mustChange = useAuthStore(selectMustChangePassword)
  const location = useLocation()

  if (mustChange && location.pathname !== '/changer-mot-de-passe') {
    return <Navigate to="/changer-mot-de-passe" replace />
  }

  if (!mustChange && location.pathname === '/changer-mot-de-passe') {
    return <Navigate to="/backoffice" replace />
  }

  return <Outlet />
}

interface RequireRoleProps {
  roles: SymfonyRole | SymfonyRole[]
}

/** Garde UI — le contrôle serveur (Voter) reste obligatoire (section 6). */
export function RequireRole({ roles }: RequireRoleProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!userHasRole(user, roles)) {
    return <Navigate to="/backoffice" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function GuestOnly() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore((s) => s.user)

  if (isAuthenticated && user) {
    if (user.isFirstConnexion) {
      return <Navigate to="/changer-mot-de-passe" replace />
    }
    return <Navigate to="/backoffice" replace />
  }

  return <Outlet />
}
