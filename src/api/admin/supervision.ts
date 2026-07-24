import type { SupervisionFilters, SupervisionListResponse } from '@/features/admin/types'
import type { DemandeListItem } from '@/features/validation/types'
import type { ModuleDemande } from '@/features/demandes/types'
import type { StatutDemande } from '@/lib/statutDemande'
import { DEFAULT_PAGE, PAGE_SIZE } from '@/lib/pagination'
import { apiClient } from '../client'

interface DemandeListItemRaw {
  id: string
  numeroDemande: string
  module: ModuleDemande
  statut: StatutDemande
  numeroCNSS: string
  dateCreation: string
  dateMajStatut: string
  raisonSocialeCNSS?: string
  ifu?: string
  raisonSocialeDGI?: string
  npi?: string
  nomAnip?: string
  prenomAnip?: string
}

interface SupervisionRawResponse {
  items: DemandeListItemRaw[]
  total: number
  page: number
  limit: number
}

function mapDemandeItem(raw: DemandeListItemRaw): DemandeListItem {
  return {
    id: raw.id,
    numeroDemande: raw.numeroDemande,
    module: raw.module,
    statut: raw.statut,
    numeroCNSS: raw.numeroCNSS,
    dateCreation: raw.dateCreation,
    dateMajStatut: raw.dateMajStatut,
    raisonSocialeCNSS: raw.raisonSocialeCNSS,
    ifu: raw.ifu,
    raisonSocialeDGI: raw.raisonSocialeDGI,
    npi: raw.npi,
    nomAnip: raw.nomAnip,
    prenomAnip: raw.prenomAnip,
  }
}

/** UC-14 : supervision globale avec filtres multi-critères. */
export async function listDemandesSupervision(
  filters?: SupervisionFilters,
): Promise<SupervisionListResponse> {
  const { data } = await apiClient.get<SupervisionRawResponse>(
    '/demandes/supervision',
    {
      params: {
        module: filters?.module,
        statut: filters?.statut,
        search: filters?.search?.trim() || undefined,
        page: filters?.page ?? DEFAULT_PAGE,
        limit: filters?.limit ?? PAGE_SIZE,
      },
    },
  )

  return {
    demandes: data.items.map(mapDemandeItem),
    total: data.total,
    page: data.page,
    limit: data.limit,
  }
}
