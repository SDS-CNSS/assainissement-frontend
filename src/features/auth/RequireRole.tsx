import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { restoreSession } from '@/api/auth'
import { Spinner } from '@/components/ui'
import {
  selectIsAuthenticated,
  selectMustChangePassword,
  useAuthStore,
} from './authStore'
import type { SymfonyRole } from './types'
import { userHasRole } from './types'

function SessionBootstrapSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50">
      <Spinner
        size="lg"
        className="text-cnss-700"
        label="Restauration de la session…"
      />
    </div>
  )
}

/**
 * Tente de restaurer la session (cookie refresh) si l'access token
 * n'est pas encore en mémoire — utile après navigation SPA depuis le portail public.
 */
function useRestoreSessionIfNeeded(enabled: boolean): boolean {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const setSession = useAuthStore((state) => state.setSession)
  const [isChecking, setIsChecking] = useState(enabled && !isAuthenticated)

  useEffect(() => {
    if (!enabled || isAuthenticated) {
      setIsChecking(false)
      return
    }

    let cancelled = false
    setIsChecking(true)

    void restoreSession().then((session) => {
      if (cancelled) return
      if (session) {
        setSession(session.accessToken, session.user)
      }
      setIsChecking(false)
    })

    return () => {
      cancelled = true
    }
  }, [enabled, isAuthenticated, setSession])

  return isChecking
}

export function RequireAuth() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const location = useLocation()
  const isChecking = useRestoreSessionIfNeeded(true)

  if (isChecking) {
    return <SessionBootstrapSpinner />
  }

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
  // Depuis le portail public (SPA), le cookie peut encore être valide.
  const isChecking = useRestoreSessionIfNeeded(true)

  if (isChecking) {
    return <SessionBootstrapSpinner />
  }

  if (isAuthenticated && user) {
    if (user.isFirstConnexion) {
      return <Navigate to="/changer-mot-de-passe" replace />
    }
    return <Navigate to="/backoffice" replace />
  }

  return <Outlet />
}
