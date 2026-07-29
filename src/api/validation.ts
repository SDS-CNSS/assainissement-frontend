import type {
  DemandeDetail,
  DemandeListItem,
  DemandeListResponse,
  HistoriqueEntry,
  HistoriqueResponse,
  ListDemandesParams,
  ValidationActionResponse,
} from '@/features/validation/types'
import { DEFAULT_PAGE, PAGE_SIZE } from '@/lib/pagination'
import { apiClient } from './client'

interface DemandeListRawResponse {
  items: DemandeListItem[]
  total: number
  page: number
  limit: number
}

/** Backend paginé ; normalisé pour l'UI. */
export async function listDemandes(
  params?: ListDemandesParams,
): Promise<DemandeListResponse> {
  const { data } = await apiClient.get<DemandeListRawResponse>('/demandes', {
    params: {
      module: params?.module,
      page: params?.page ?? DEFAULT_PAGE,
      limit: params?.limit ?? PAGE_SIZE,
    },
  })

  return {
    demandes: data.items,
    total: data.total,
    page: data.page,
    limit: data.limit,
  }
}

/** Historique personnel des validations / rejets (Agent 1, Agent 2, Contrôleur). */
export async function listMesTraitements(
  params?: ListDemandesParams,
): Promise<DemandeListResponse> {
  const { data } = await apiClient.get<DemandeListRawResponse>(
    '/demandes/mes-traitements',
    {
      params: {
        module: params?.module,
        page: params?.page ?? DEFAULT_PAGE,
        limit: params?.limit ?? PAGE_SIZE,
      },
    },
  )

  return {
    demandes: data.items,
    total: data.total,
    page: data.page,
    limit: data.limit,
  }
}

export async function getDemandeDetail(id: string): Promise<DemandeDetail> {
  const { data } = await apiClient.get<DemandeDetail>(
    `/demandes/${encodeURIComponent(id)}`,
  )
  return data
}

export async function validerN1(id: string): Promise<ValidationActionResponse> {
  const { data } = await apiClient.post<ValidationActionResponse>(
    `/demandes/${encodeURIComponent(id)}/valider-n1`,
  )
  return data
}

export async function rejeterN1(
  id: string,
  motif: string,
): Promise<ValidationActionResponse> {
  const { data } = await apiClient.post<ValidationActionResponse>(
    `/demandes/${encodeURIComponent(id)}/rejeter-n1`,
    { motif },
  )
  return data
}

export async function validerN2(id: string): Promise<ValidationActionResponse> {
  const { data } = await apiClient.post<ValidationActionResponse>(
    `/demandes/${encodeURIComponent(id)}/valider-n2`,
  )
  return data
}

export async function rejeterN2(
  id: string,
  motif: string,
): Promise<ValidationActionResponse> {
  const { data } = await apiClient.post<ValidationActionResponse>(
    `/demandes/${encodeURIComponent(id)}/rejeter-n2`,
    { motif },
  )
  return data
}

export async function validerSuperviseur(
  id: string,
): Promise<ValidationActionResponse> {
  const { data } = await apiClient.post<ValidationActionResponse>(
    `/demandes/${encodeURIComponent(id)}/valider-superviseur`,
  )
  return data
}

export async function rejeterSuperviseur(
  id: string,
  motif: string,
): Promise<ValidationActionResponse> {
  const { data } = await apiClient.post<ValidationActionResponse>(
    `/demandes/${encodeURIComponent(id)}/rejeter-superviseur`,
    { motif },
  )
  return data
}

interface HistoriqueEntryRaw {
  id: string
  action: string
  dateAction: string
  motif?: string
  utilisateurNom?: string
  utilisateurPrenom?: string
}

function mapHistoriqueEntry(raw: HistoriqueEntryRaw): HistoriqueEntry {
  return {
    id: raw.id,
    action: raw.action as HistoriqueEntry['action'],
    dateAction: raw.dateAction,
    motif: raw.motif,
    utilisateur:
      raw.utilisateurNom && raw.utilisateurPrenom
        ? {
            nom: raw.utilisateurNom,
            prenom: raw.utilisateurPrenom,
            identifiant: '',
          }
        : undefined,
  }
}

export async function getHistorique(id: string): Promise<HistoriqueResponse> {
  const { data } = await apiClient.get<HistoriqueEntryRaw[]>(
    `/demandes/${encodeURIComponent(id)}/historique`,
  )

  return {
    numeroDemande: id,
    historique: data.map(mapHistoriqueEntry),
  }
}
