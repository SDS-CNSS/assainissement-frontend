import axios from 'axios'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/features/auth/authStore'
import type { ModuleAffecte } from '@/features/admin/types'
import type { AuthUser, UserRole } from '@/features/auth/types'
import { ROLE_TO_SYMFONY } from '@/features/auth/types'

export interface LoginPayload {
  identifiant: string
  motDePasse: string
}

interface LoginUserRaw {
  id: number
  identifiant: string
  nom: string
  prenom: string
  role: UserRole
  moduleAffecte: AuthUser['moduleAffecte']
  isFirstConnexion: boolean
}

interface ProfileRaw {
  id: number
  nom: string
  prenom: string
  identifiant: string
  role: UserRole
  niveau: number
  moduleAffecte: ModuleAffecte | null
  directionId: number
  directionNom: string
  directionAbreviation: string
  dtCreation: string
  dtLastLogin?: string | null
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface RefreshResponse {
  accessToken: string
}

export interface ChangePasswordPayload {
  /** Requis hors première connexion (RG-19). */
  motDePasseActuel?: string
  nouveauMotDePasse: string
  confirmationMotDePasse: string
}

export interface UserProfile {
  id: string
  nom: string
  prenom: string
  identifiant: string
  role: UserRole
  niveau: number
  moduleAffecte: ModuleAffecte | null
  directionId: string
  directionNom: string
  directionAbreviation: string
  dtCreation: string
  dtLastLogin?: string | null
}

/** Instance sans intercepteur pour éviter les boucles sur login/refresh. */
const authHttp = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

function mapAuthUser(raw: LoginUserRaw): AuthUser {
  return {
    id: String(raw.id),
    identifiant: raw.identifiant,
    nom: raw.nom,
    prenom: raw.prenom,
    role: raw.role,
    roles: [ROLE_TO_SYMFONY[raw.role]],
    moduleAffecte: raw.moduleAffecte ?? null,
    isFirstConnexion: raw.isFirstConnexion,
  }
}

function mapProfile(raw: ProfileRaw): UserProfile {
  return {
    id: String(raw.id),
    nom: raw.nom,
    prenom: raw.prenom,
    identifiant: raw.identifiant,
    role: raw.role,
    niveau: raw.niveau,
    moduleAffecte: raw.moduleAffecte ?? null,
    directionId: String(raw.directionId),
    directionNom: raw.directionNom,
    directionAbreviation: raw.directionAbreviation,
    dtCreation: raw.dtCreation,
    dtLastLogin: raw.dtLastLogin,
  }
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const { data } = await authHttp.post<{
    accessToken: string
    user: LoginUserRaw
  }>('/auth/login', payload)

  return {
    accessToken: data.accessToken,
    user: mapAuthUser(data.user),
  }
}

export async function refreshAccessToken(): Promise<string> {
  const session = await restoreSession()

  if (!session) {
    throw new Error('Unable to refresh session')
  }

  useAuthStore.getState().setSession(session.accessToken, session.user)

  return session.accessToken
}

export async function restoreSession(): Promise<LoginResponse | null> {
  try {
    const { data } = await authHttp.post<{
      accessToken: string
      expiresIn: number
      user: LoginUserRaw
    }>('/auth/refresh')

    return {
      accessToken: data.accessToken,
      user: mapAuthUser(data.user),
    }
  } catch {
    return null
  }
}

export async function logoutRequest(): Promise<void> {
  const token = useAuthStore.getState().accessToken
  await authHttp.post(
    '/auth/logout',
    {},
    token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined,
  )
}

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<ProfileRaw>('/auth/me')
  return mapProfile(data)
}

export async function changePasswordRequest(
  payload: ChangePasswordPayload,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<{
    accessToken: string
    user: LoginUserRaw
  }>('/auth/change-password', payload)

  return {
    accessToken: data.accessToken,
    user: mapAuthUser(data.user),
  }
}
