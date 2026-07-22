import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  changePasswordRequest,
  fetchProfile,
  loginRequest,
  logoutRequest,
  refreshAccessToken,
} from '@/api/auth'
import { getApiErrorMessage } from '@/api/types'
import { useAuthStore } from './authStore'
import { getDefaultBackofficePath } from './types'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
      if (data.user.isFirstConnexion) {
        navigate('/changer-mot-de-passe', { replace: true })
        return
      }
      navigate(getDefaultBackofficePath(data.user), { replace: true })
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      try {
        await logoutRequest()
      } finally {
        clearSession()
      }
    },
    // Toujours revenir au login, même si l'appel API échoue (session locale déjà effacée).
    onSettled: () => {
      navigate('/login', { replace: true })
    },
  })
}

export function useRefresh() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  return useMutation({
    mutationFn: refreshAccessToken,
    onSuccess: (token) => {
      setAccessToken(token)
    },
  })
}

export function useChangePassword() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
      navigate(getDefaultBackofficePath(data.user), {
        replace: true,
      })
    },
    meta: {
      errorMessage: (error: unknown) =>
        getApiErrorMessage(
          error,
          'Impossible de modifier le mot de passe. Veuillez réessayer.',
        ),
    },
  })
}

export function useProfile() {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: fetchProfile,
  })
}

export function useUpdatePassword() {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
    },
    meta: {
      errorMessage: (error: unknown) =>
        getApiErrorMessage(
          error,
          'Impossible de modifier le mot de passe. Veuillez réessayer.',
        ),
    },
  })
}
