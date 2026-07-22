import type {
  AuditLogEntry,
  AuditLogListParams,
  AuditLogListResponse,
  AuditLogSummary,
} from '@/features/admin/types'
import type { UserRole } from '@/features/auth/types'
import {
  getAuditActionLabel,
  isAuditFailure,
} from '@/lib/auditAction'
import { DEFAULT_PAGE, PAGE_SIZE } from '@/lib/pagination'
import { apiClient } from '../client'

export interface AuditLogEntryRaw {
  id: number | string
  action: string
  timestamp: string
  entiteCible?: string | null
  valeurAvant?: string | null
  valeurApres?: string | null
  ipAddress?: string | null
  userId?: number | null
  userIdentifiant?: string | null
  userNom?: string | null
  userPrenom?: string | null
  userRole?: UserRole | null
}

interface AuditLogListRawResponse {
  items: AuditLogEntryRaw[]
  total: number
  page: number
  limit: number
}

function parseJsonField(
  value: string | null | undefined,
): Record<string, unknown> | null {
  if (!value) return null

  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }

    return { value: parsed }
  } catch {
    return { raw: value }
  }
}

function formatUtilisateur(raw: AuditLogEntryRaw): string | null {
  if (!raw.userIdentifiant && !raw.userNom && !raw.userPrenom) {
    return null
  }

  const name = [raw.userPrenom, raw.userNom].filter(Boolean).join(' ')

  if (raw.userIdentifiant) {
    return name ? `${name} (${raw.userIdentifiant})` : raw.userIdentifiant
  }

  return name || null
}

/** Mappe une entrée brute API vers le modèle frontend (testable). */
export function mapAuditLogEntry(raw: AuditLogEntryRaw): AuditLogEntry {
  return {
    id: String(raw.id),
    action: raw.action,
    actionLabel: getAuditActionLabel(raw.action),
    timestamp: raw.timestamp,
    entiteCible: raw.entiteCible ?? null,
    valeurAvant: parseJsonField(raw.valeurAvant),
    valeurApres: parseJsonField(raw.valeurApres),
    ipAddress: raw.ipAddress ?? null,
    utilisateur: formatUtilisateur(raw),
    userId: raw.userId != null ? String(raw.userId) : null,
    userIdentifiant: raw.userIdentifiant ?? null,
    userNom: raw.userNom ?? null,
    userPrenom: raw.userPrenom ?? null,
    userRole: raw.userRole ?? null,
    isSuccess: !isAuditFailure(raw.action),
  }
}

function buildAuditQueryParams(params?: AuditLogListParams) {
  return {
    action: params?.action || undefined,
    dateDebut: params?.dateDebut || undefined,
    dateFin: params?.dateFin || undefined,
    userId: params?.userId || undefined,
    resultat: params?.resultat || undefined,
    page: params?.page ?? DEFAULT_PAGE,
    limit: params?.limit ?? PAGE_SIZE,
  }
}

/** RG-18 : consultation en lecture seule du journal d'audit (admin). */
export async function listAuditLogs(
  params?: AuditLogListParams,
): Promise<AuditLogListResponse> {
  const { data } = await apiClient.get<AuditLogListRawResponse>('/audit-logs', {
    params: buildAuditQueryParams(params),
  })

  return {
    items: data.items.map(mapAuditLogEntry),
    total: data.total,
    page: data.page,
    limit: data.limit,
  }
}

export async function fetchAuditLogSummary(
  params?: Omit<AuditLogListParams, 'page' | 'limit'>,
): Promise<AuditLogSummary> {
  const { data } = await apiClient.get<AuditLogSummary>('/audit-logs/summary', {
    params: buildAuditQueryParams(params),
  })

  return data
}

export async function exportAuditLogsXlsx(
  params?: Omit<AuditLogListParams, 'page' | 'limit'>,
): Promise<Blob> {
  const { data } = await apiClient.get<Blob>('/audit-logs/export', {
    params: buildAuditQueryParams(params),
    responseType: 'blob',
  })

  return data
}
