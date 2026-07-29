import { apiClient } from '../client'
import { downloadBlob } from '@/lib/downloadBlob'

export type ConsolidationModule = 'EMPLOYEUR' | 'TRAVAILLEUR' | 'LES_DEUX'

export interface ConsolidationConflict {
  numeroDemande: string
  module: string
  numeroCNSS: string
  raisonSocialeCNSS?: string | null
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

export interface ConsolidationExportFile {
  filename: string
  contentBase64: string
}

export interface ConsolidationExportResult {
  count: number
  conflictCount: number
  files: ConsolidationExportFile[]
}

export const CONFLICT_MOTIF_LABELS: Record<string, string> = {
  REFERENTIEL_ABSENT: 'Fiche référentiel introuvable pour ce N° CNSS',
}

export const CONSOLIDATION_MODULE_LABELS: Record<ConsolidationModule, string> = {
  EMPLOYEUR: 'Employeurs (IFU)',
  TRAVAILLEUR: 'Travailleurs (NPI)',
  LES_DEUX: 'Employeurs et travailleurs',
}

export async function fetchConsolidationPreview(): Promise<ConsolidationPreview> {
  const { data } = await apiClient.get<ConsolidationPreview>(
    '/consolidation/preview',
  )
  return data
}

/** Déclenche le téléchargement de chaque fichier Excel (employeur / travailleur). */
export function downloadConsolidationFiles(
  files: ConsolidationExportFile[],
): void {
  for (const file of files) {
    const binary = atob(file.contentBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    downloadBlob(
      new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      file.filename,
    )
  }
}

export async function runConsolidationExport(
  module: ConsolidationModule,
): Promise<ConsolidationExportResult> {
  const { data } = await apiClient.post<ConsolidationExportResult>(
    '/consolidation/export',
    { module },
    { timeout: 60 * 60 * 1000 },
  )
  return data
}

export async function redownloadConsolidationExport(
  auditLogId: string | number,
): Promise<ConsolidationExportFile[]> {
  const { data } = await apiClient.get<{ files: ConsolidationExportFile[] }>(
    `/consolidation/export/${encodeURIComponent(String(auditLogId))}`,
  )
  return data.files
}
