import { apiClient } from '../client'

export interface ConsolidationConflict {
  numeroDemande: string
  module: string
  numeroCNSS: string
  typeValeur: string
  valeurConsolidee: string | null
  valeurReferentielAvant: string | null
  motifConflit: string | null
}

export interface ConsolidationPreview {
  eligibleCount: number
  conflictCount: number
  eligibleEmployeur: number
  eligibleTravailleur: number
  conflictEmployeur: number
  conflictTravailleur: number
  conflicts: ConsolidationConflict[]
}

export const CONFLICT_MOTIF_LABELS: Record<string, string> = {
  REFERENTIEL_ABSENT: 'Fiche référentiel introuvable pour ce N° CNSS',
}

export async function fetchConsolidationPreview(): Promise<ConsolidationPreview> {
  const { data } = await apiClient.get<ConsolidationPreview>(
    '/consolidation/preview',
  )
  return data
}

export async function runConsolidationExport(): Promise<{
  blob: Blob
  filename: string
  count: number
  conflictCount: number
}> {
  try {
    const response = await apiClient.post<Blob>(
      '/consolidation/export',
      null,
      {
        responseType: 'blob',
        timeout: 60 * 60 * 1000,
      },
    )

    const disposition = response.headers['content-disposition'] as
      | string
      | undefined
    const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i)
    const filename =
      filenameMatch?.[1] ??
      `consolidation_assainissement_${new Date().toISOString().slice(0, 10)}.xlsx`

    const countHeader = response.headers['x-export-count']
    const conflictHeader = response.headers['x-conflict-count']

    return {
      blob: response.data,
      filename,
      count: Number(countHeader ?? 0),
      conflictCount: Number(conflictHeader ?? 0),
    }
  } catch (error) {
    await rethrowBlobApiError(error)
    throw error
  }
}

async function rethrowBlobApiError(error: unknown): Promise<never> {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as { response?: { data?: unknown } }
    ).response
    const data = response?.data

    if (data instanceof Blob) {
      const text = await data.text()
      try {
        const parsed: unknown = JSON.parse(text)
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'error' in parsed
        ) {
          const message =
            (parsed as { error?: { message?: string } }).error?.message ??
            'La consolidation a échoué.'
          throw new Error(message)
        }
      } catch (parseError) {
        if (parseError instanceof Error && parseError.name === 'Error') {
          // Message métier extrait du JSON d'erreur API.
          if (!parseError.message.includes('JSON')) {
            throw parseError
          }
        }
      }
    }
  }

  throw error instanceof Error
    ? error
    : new Error('La consolidation a échoué.')
}

export async function redownloadConsolidationExport(
  auditLogId: string | number,
): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(
    `/consolidation/export/${encodeURIComponent(String(auditLogId))}`,
    { responseType: 'blob' },
  )
  return data
}
