import type {
  TableauDeBordFilters,
  TableauDeBordStats,
} from '@/features/admin/types'
import { apiClient } from '../client'

interface TableauDeBordRaw {
  totalGeneral: number
  totalParStatut: Record<string, number>
  totalParModule: Record<string, number>
  evolution: Array<{ date: string; count: number }>
}

function mapTableauDeBord(raw: TableauDeBordRaw): TableauDeBordStats {
  const parStatut = raw.totalParStatut ?? {}

  const rejetees =
    (parStatut.REJETEE_N1_EN_ATTENTE_N2 ?? 0) +
    (parStatut.REJETEE_N2_RETOUR_N1 ?? 0)

  return {
    totalDemandes: raw.totalGeneral ?? 0,
    enAttenteN1:
      (parStatut.EN_ATTENTE_N1 ?? 0) + (parStatut.REJETEE_N2_RETOUR_N1 ?? 0),
    enAttenteN2:
      (parStatut.EN_ATTENTE_N2 ?? 0) +
      (parStatut.REJETEE_N1_EN_ATTENTE_N2 ?? 0),
    valideesDefinitivement: parStatut.VALIDEE_DEFINITIVEMENT ?? 0,
    rejetees,
    parModule: {
      employeur: raw.totalParModule?.EMPLOYEUR ?? 0,
      travailleur: raw.totalParModule?.TRAVAILLEUR ?? 0,
    },
  }
}

export async function fetchTableauDeBord(
  filters?: TableauDeBordFilters,
): Promise<TableauDeBordStats> {
  const { data } = await apiClient.get<TableauDeBordRaw>(
    '/statistiques/tableau-de-bord',
    {
      params: {
        dateDebut: filters?.dateDebut,
        dateFin: filters?.dateFin,
        module: filters?.module,
        statut: filters?.statut,
      },
    },
  )
  return mapTableauDeBord(data)
}

/** UC-13 : export Excel (.xlsx). */
export async function exportStatistiquesXlsx(
  filters?: TableauDeBordFilters,
): Promise<Blob> {
  const { data } = await apiClient.get<Blob>('/statistiques/export', {
    params: {
      dateDebut: filters?.dateDebut,
      dateFin: filters?.dateFin,
      module: filters?.module,
      statut: filters?.statut,
    },
    responseType: 'blob',
  })
  return data
}
