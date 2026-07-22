import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/features/auth/authStore'
import { refreshAccessToken } from './auth'

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

/** Client Axios unique — access token en mémoire, refresh cookie HttpOnly (section 6). */
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((token) => token)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function redirectToLogin(message?: string): void {
  useAuthStore.getState().clearSession()
  const params = message ? `?message=${encodeURIComponent(message)}` : ''
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign(`/login${params}`)
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    // Ne pas tenter de refresh sur login / refresh eux-mêmes
    const url = originalRequest.url ?? ''
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const newToken = await refreshTokenOnce()
    if (!newToken) {
      redirectToLogin('Votre session a expiré. Veuillez vous reconnecter.')
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return apiClient(originalRequest)
  },
)
