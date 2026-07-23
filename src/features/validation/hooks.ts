import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDemandeDetail,
  getHistorique,
  listDemandes,
  listMesTraitements,
  rejeterN1,
  rejeterN2,
  rejeterSuperviseur,
  validerN1,
  validerN2,
  validerSuperviseur,
} from '@/api/validation'
import type { ListDemandesParams } from './types'

export const validationQueryKeys = {
  all: ['validation'] as const,
  list: (params?: ListDemandesParams) =>
    [...validationQueryKeys.all, 'list', params] as const,
  mesTraitements: (params?: ListDemandesParams) =>
    [...validationQueryKeys.all, 'mes-traitements', params] as const,
  detail: (id: string) => [...validationQueryKeys.all, 'detail', id] as const,
  historique: (id: string) =>
    [...validationQueryKeys.all, 'historique', id] as const,
}

export function useDemandesList(
  params?: ListDemandesParams,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: validationQueryKeys.list(params),
    queryFn: () => listDemandes(params),
    refetchInterval: options?.refetchInterval,
  })
}

export function useMesTraitements(params?: ListDemandesParams) {
  return useQuery({
    queryKey: validationQueryKeys.mesTraitements(params),
    queryFn: () => listMesTraitements(params),
  })
}

export function useDemandeDetail(id: string | null) {
  return useQuery({
    queryKey: validationQueryKeys.detail(id ?? ''),
    queryFn: () => getDemandeDetail(id!),
    enabled: Boolean(id),
  })
}

export function useHistoriqueDemande(id: string | null) {
  return useQuery({
    queryKey: validationQueryKeys.historique(id ?? ''),
    queryFn: () => getHistorique(id!),
    enabled: Boolean(id),
  })
}

function invalidateValidationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  demandeId?: string,
) {
  queryClient.invalidateQueries({ queryKey: validationQueryKeys.all })
  if (demandeId) {
    queryClient.invalidateQueries({
      queryKey: validationQueryKeys.detail(demandeId),
    })
    queryClient.invalidateQueries({
      queryKey: validationQueryKeys.historique(demandeId),
    })
  }
}

export function useValiderN1() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: validerN1,
    onSuccess: (_data, id) => {
      invalidateValidationQueries(queryClient, id)
    },
  })
}

export function useRejeterN1() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      rejeterN1(id, motif),
    onSuccess: (_data, { id }) => {
      invalidateValidationQueries(queryClient, id)
    },
  })
}

export function useValiderN2() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: validerN2,
    onSuccess: (_data, id) => {
      invalidateValidationQueries(queryClient, id)
    },
  })
}

export function useRejeterN2() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      rejeterN2(id, motif),
    onSuccess: (_data, { id }) => {
      invalidateValidationQueries(queryClient, id)
    },
  })
}

export function useValiderSuperviseur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: validerSuperviseur,
    onSuccess: (_data, id) => {
      invalidateValidationQueries(queryClient, id)
    },
  })
}

export function useRejeterSuperviseur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      rejeterSuperviseur(id, motif),
    onSuccess: (_data, { id }) => {
      invalidateValidationQueries(queryClient, id)
    },
  })
}
