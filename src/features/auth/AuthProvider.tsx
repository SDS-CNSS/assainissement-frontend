import { type ReactNode, useEffect, useState } from 'react'
import { restoreSession } from '@/api/auth'
import { Spinner } from '@/components/ui'
import { useAuthStore } from './authStore'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Routes où une session agent peut être restaurée via le cookie refresh.
 * Le portail public (citoyen) n'en a pas besoin.
 */
export function shouldRestoreSessionOnPath(pathname: string): boolean {
  return (
    pathname.startsWith('/backoffice') ||
    pathname === '/login' ||
    pathname.startsWith('/changer-mot-de-passe')
  )
}

/**
 * Restaure la session au chargement via le refresh token HttpOnly (section 6),
 * uniquement sur les écrans agent (back-office / login).
 * L'access token reste en mémoire uniquement, mais est réémis après un F5.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const needsRestore = shouldRestoreSessionOnPath(window.location.pathname)
  const [isBootstrapping, setIsBootstrapping] = useState(needsRestore)
  const setSession = useAuthStore((state) => state.setSession)
  const isAuthenticated = useAuthStore(
    (state) => state.accessToken !== null && state.user !== null,
  )

  useEffect(() => {
    let cancelled = false

    async function bootstrapAuth() {
      if (!needsRestore) {
        if (!cancelled) {
          setIsBootstrapping(false)
        }
        return
      }

      if (isAuthenticated) {
        if (!cancelled) {
          setIsBootstrapping(false)
        }
        return
      }

      const session = await restoreSession()

      if (!cancelled && session) {
        setSession(session.accessToken, session.user)
      }

      if (!cancelled) {
        setIsBootstrapping(false)
      }
    }

    void bootstrapAuth()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, needsRestore, setSession])

  if (isBootstrapping) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-cnss-700" label="Restauration de la session…" />
      </div>
    )
  }

  return children
}
