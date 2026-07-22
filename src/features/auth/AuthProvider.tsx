import { type ReactNode, useEffect, useState } from 'react'
import { restoreSession } from '@/api/auth'
import { Spinner } from '@/components/ui'
import { useAuthStore } from './authStore'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Restaure la session au chargement via le refresh token HttpOnly (section 6).
 * L'access token reste en mémoire uniquement, mais est réémis après un F5.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const setSession = useAuthStore((state) => state.setSession)
  const isAuthenticated = useAuthStore(
    (state) => state.accessToken !== null && state.user !== null,
  )

  useEffect(() => {
    let cancelled = false

    async function bootstrapAuth() {
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
  }, [isAuthenticated, setSession])

  if (isBootstrapping) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-cnss-700" label="Restauration de la session…" />
      </div>
    )
  }

  return children
}
