import type {
  CreateUtilisateurPayload,
  CreateUtilisateurResponse,
  SetUtilisateurStatutPayload,
  UpdateUtilisateurPayload,
  UtilisateurListItem,
} from '@/features/admin/types'
import type { ListQueryParams, PaginatedResponse } from '@/lib/pagination'
import { SELECT_OPTIONS_LIMIT } from '@/lib/pagination'
import type { UserRole } from '@/features/auth/types'
import type { ModuleAffecte } from '@/features/admin/types'
import { apiClient } from '../client'
import { isApiErrorBody } from '../types'

interface UtilisateurRaw {
  id: number | string
  nom: string
  prenom: string
  identifiant: string
  role: UserRole
  niveau: number
  moduleAffecte: ModuleAffecte
  directionId?: number | string
  directionNom?: string
  directionAbreviation?: string
  direction?: {
    id: number | string
    nom: string
    abreviation: string
  }
  isActive: boolean
  isFirstConnexion: boolean
  isVerrouille?: boolean
  dureeVerrouillage?: string | null
  dtCreation: string
  dtLastLogin?: string | null
}

interface CreateUtilisateurRaw {
  utilisateur: UtilisateurRaw
  motDePasseTemporaire: string
  documentBase64: string
  documentFilename: string
}

function mapUtilisateur(raw: UtilisateurRaw): UtilisateurListItem {
  const directionId = raw.directionId ?? raw.direction?.id ?? ''
  const directionNom = raw.directionNom ?? raw.direction?.nom ?? ''
  const directionAbreviation =
    raw.directionAbreviation ?? raw.direction?.abreviation ?? ''

  return {
    id: String(raw.id),
    nom: raw.nom,
    prenom: raw.prenom,
    identifiant: raw.identifiant,
    role: raw.role,
    niveau: raw.niveau,
    moduleAffecte: raw.moduleAffecte,
    directionId: String(directionId),
    directionNom,
    directionAbreviation,
    isActive: raw.isActive,
    isFirstConnexion: raw.isFirstConnexion,
    isVerrouille: Boolean(
      raw.isVerrouille ??
        (raw.dureeVerrouillage &&
          new Date(raw.dureeVerrouillage).getTime() > Date.now()),
    ),
    dtCreation: raw.dtCreation ?? new Date().toISOString(),
    dtLastLogin: raw.dtLastLogin,
  }
}

async function parseBlobError(blob: Blob): Promise<string> {
  const text = await blob.text()

  try {
    const json = JSON.parse(text) as unknown
    if (isApiErrorBody(json)) {
      return json.error.message
    }
  } catch {
    // Not JSON — fall through.
  }

  return 'Le document téléchargé est invalide.'
}

async function ensureWordBlob(blob: Blob): Promise<Blob> {
  if (blob.type.includes('json')) {
    throw new Error(await parseBlobError(blob))
  }

  const sample = await blob.slice(0, 256).text()
  const trimmed = sample.trimStart().toLowerCase()

  if (trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')) {
    return blob.type
      ? blob
      : new Blob([await blob.arrayBuffer()], { type: 'application/msword' })
  }

  if (sample.startsWith('PK')) {
    return blob
  }

  if (blob.size < 500) {
    throw new Error(await parseBlobError(blob))
  }

  throw new Error('Le document téléchargé est invalide.')
}

export async function listUtilisateurs(
  params?: ListQueryParams,
): Promise<PaginatedResponse<UtilisateurListItem>> {
  const { data } = await apiClient.get<{
    items: UtilisateurRaw[]
    total: number
    page: number
    limit: number
  }>('/utilisateurs', {
    params: {
      page: params?.page,
      limit: params?.limit,
    },
  })

  return {
    items: data.items.map(mapUtilisateur),
    total: data.total,
    page: data.page,
    limit: data.limit,
  }
}

export async function listUtilisateurOptions(): Promise<UtilisateurListItem[]> {
  const result = await listUtilisateurs({ page: 1, limit: SELECT_OPTIONS_LIMIT })
  return result.items
}

export async function createUtilisateur(
  payload: CreateUtilisateurPayload,
): Promise<CreateUtilisateurResponse> {
  const { data } = await apiClient.post<CreateUtilisateurRaw>(
    '/utilisateurs',
    {
      ...payload,
      directionId: Number(payload.directionId),
    },
  )

  return {
    utilisateur: mapUtilisateur(data.utilisateur),
    motDePasseTemporaire: data.motDePasseTemporaire,
    documentBase64: data.documentBase64,
    documentFilename: data.documentFilename,
  }
}

export async function updateUtilisateur(
  id: string,
  payload: UpdateUtilisateurPayload,
): Promise<UtilisateurListItem> {
  const { data } = await apiClient.put<UtilisateurRaw>(
    `/utilisateurs/${encodeURIComponent(id)}`,
    {
      ...payload,
      directionId: Number(payload.directionId),
    },
  )
  return mapUtilisateur(data)
}

export async function deverrouillerUtilisateur(
  id: string,
): Promise<UtilisateurListItem> {
  const { data } = await apiClient.post<UtilisateurRaw>(
    `/utilisateurs/${encodeURIComponent(id)}/deverrouiller`,
  )
  return mapUtilisateur(data)
}

export async function setUtilisateurStatut(
  id: string,
  payload: SetUtilisateurStatutPayload,
): Promise<UtilisateurListItem> {
  const { data } = await apiClient.patch<UtilisateurRaw>(
    `/utilisateurs/${encodeURIComponent(id)}/statut`,
    payload,
  )
  return mapUtilisateur(data)
}

/** UC-12 : téléchargement du document Word des identifiants. */
export async function downloadCredentialsDoc(id: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(
    `/utilisateurs/${encodeURIComponent(id)}/credentials-document`,
    {
      responseType: 'blob',
      headers: {
        Accept: 'application/msword, application/octet-stream, */*',
      },
    },
  )

  return ensureWordBlob(data)
}

/** Document Word généré à la création (sans regénérer le mot de passe). */
export async function downloadInitialCredentialsDoc(id: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(
    `/utilisateurs/${encodeURIComponent(id)}/credentials-document/initial`,
    {
      responseType: 'blob',
      headers: {
        Accept: 'application/msword, application/octet-stream, */*',
      },
    },
  )

  return ensureWordBlob(data)
}
