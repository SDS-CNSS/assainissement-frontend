import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDirection,
  deleteDirection,
  listDirectionOptions,
  listDirections,
  updateDirection,
} from '@/api/admin/directions'
import {
  createUtilisateur,
  deleteUtilisateur,
  deverrouillerUtilisateur,
  downloadCredentialsDoc,
  downloadInitialCredentialsDoc,
  listUtilisateurOptions,
  listUtilisateurs,
  resetUtilisateurPassword,
  setUtilisateurStatut,
  updateUtilisateur,
} from '@/api/admin/utilisateurs'
import {
  fetchTableauDeBord,
} from '@/api/admin/statistiques'
import { listAuditLogs, fetchAuditLogSummary, exportAuditLogsXlsx } from '@/api/admin/audit'
import { listDemandesSupervision } from '@/api/admin/supervision'
import type { ListQueryParams } from '@/lib/pagination'
import type {
  AuditLogListParams,
  CreateDirectionPayload,
  CreateUtilisateurPayload,
  SupervisionFilters,
  SetUtilisateurStatutPayload,
  TableauDeBordFilters,
  UpdateDirectionPayload,
  UpdateUtilisateurPayload,
} from './types'

export const adminQueryKeys = {
  all: ['admin'] as const,
  directions: (params?: ListQueryParams) =>
    [...adminQueryKeys.all, 'directions', params] as const,
  directionOptions: () => [...adminQueryKeys.all, 'direction-options'] as const,
  utilisateurs: (params?: ListQueryParams) =>
    [...adminQueryKeys.all, 'utilisateurs', params] as const,
  utilisateurOptions: () =>
    [...adminQueryKeys.all, 'utilisateur-options'] as const,
  tableauDeBord: (filters?: TableauDeBordFilters) =>
    [...adminQueryKeys.all, 'tableau-de-bord', filters] as const,
  supervision: (filters?: SupervisionFilters) =>
    [...adminQueryKeys.all, 'supervision', filters] as const,
  auditLogs: (params?: AuditLogListParams) =>
    [...adminQueryKeys.all, 'audit-logs', params] as const,
  auditSummary: (params?: Omit<AuditLogListParams, 'page' | 'limit'>) =>
    [...adminQueryKeys.all, 'audit-summary', params] as const,
}

export function useDirectionsList(params?: ListQueryParams) {
  return useQuery({
    queryKey: adminQueryKeys.directions(params),
    queryFn: () => listDirections(params),
  })
}

export function useDirectionOptions() {
  return useQuery({
    queryKey: adminQueryKeys.directionOptions(),
    queryFn: listDirectionOptions,
  })
}

export function useCreateDirection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDirectionPayload) => createDirection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all })
    },
  })
}

export function useUpdateDirection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateDirectionPayload
    }) => updateDirection(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all })
    },
  })
}

export function useDeleteDirection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDirection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all })
    },
  })
}

export function useUtilisateursList(params?: ListQueryParams) {
  return useQuery({
    queryKey: adminQueryKeys.utilisateurs(params),
    queryFn: () => listUtilisateurs(params),
  })
}

export function useUtilisateurOptions() {
  return useQuery({
    queryKey: adminQueryKeys.utilisateurOptions(),
    queryFn: listUtilisateurOptions,
  })
}

export function useCreateUtilisateur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateUtilisateurPayload) =>
      createUtilisateur(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all })
    },
  })
}

export function useUpdateUtilisateur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateUtilisateurPayload
    }) => updateUtilisateur(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all })
    },
  })
}

export function useDeleteUtilisateur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUtilisateur(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all })
    },
  })
}

export function useDeverrouillerUtilisateur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deverrouillerUtilisateur(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all })
    },
  })
}

export function useResetUtilisateurPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => resetUtilisateurPassword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all })
    },
  })
}

export function useSetUtilisateurStatut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: SetUtilisateurStatutPayload
    }) => setUtilisateurStatut(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all })
    },
  })
}

export function useDownloadCredentialsDoc() {
  return useMutation({
    mutationFn: (id: string) => downloadCredentialsDoc(id),
  })
}

export function useDownloadInitialCredentialsDoc() {
  return useMutation({
    mutationFn: (id: string) => downloadInitialCredentialsDoc(id),
  })
}

export function useTableauDeBord(filters?: TableauDeBordFilters) {
  return useQuery({
    queryKey: adminQueryKeys.tableauDeBord(filters),
    queryFn: () => fetchTableauDeBord(filters),
  })
}

export function useSupervisionList(filters?: SupervisionFilters) {
  return useQuery({
    queryKey: adminQueryKeys.supervision(filters),
    queryFn: () => listDemandesSupervision(filters),
  })
}

export function useAuditLogs(params?: AuditLogListParams) {
  return useQuery({
    queryKey: adminQueryKeys.auditLogs(params),
    queryFn: () => listAuditLogs(params),
  })
}

export function useAuditLogSummary(
  params?: Omit<AuditLogListParams, 'page' | 'limit'>,
) {
  return useQuery({
    queryKey: adminQueryKeys.auditSummary(params),
    queryFn: () => fetchAuditLogSummary(params),
  })
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (params?: Omit<AuditLogListParams, 'page' | 'limit'>) =>
      exportAuditLogsXlsx(params),
  })
}
