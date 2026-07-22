import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { getDefaultBackofficePath } from '@/features/auth/types'

/** Redirige vers le tableau de bord adapté au rôle de l'utilisateur connecté. */
export function BackofficeHomeRedirect() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getDefaultBackofficePath(user)} replace />
}
