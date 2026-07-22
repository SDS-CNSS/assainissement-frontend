import { create } from 'zustand'
import type { AuthUser } from './types'

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  setSession: (accessToken: string, user: AuthUser) => void
  setAccessToken: (accessToken: string) => void
  setUser: (user: AuthUser) => void
  clearSession: () => void
  isAuthenticated: () => boolean
}

/** Access token et utilisateur en mémoire uniquement — jamais localStorage (section 6). */
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  clearSession: () => set({ accessToken: null, user: null }),
  isAuthenticated: () => get().accessToken !== null && get().user !== null,
}))

export function selectIsAuthenticated(state: AuthState): boolean {
  return state.accessToken !== null && state.user !== null
}

export function selectMustChangePassword(state: AuthState): boolean {
  return state.user?.isFirstConnexion === true
}
