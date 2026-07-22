import type {
  CreateDirectionPayload,
  Direction,
  UpdateDirectionPayload,
} from '@/features/admin/types'
import type { ListQueryParams, PaginatedResponse } from '@/lib/pagination'
import { SELECT_OPTIONS_LIMIT } from '@/lib/pagination'
import { apiClient } from '../client'

interface DirectionRaw {
  id: number | string
  nom: string
  abreviation: string
  nbUtilisateurs?: number
  nombreUtilisateurs?: number
}

function mapDirection(raw: DirectionRaw): Direction {
  return {
    id: String(raw.id),
    nom: raw.nom,
    abreviation: raw.abreviation,
    nbUtilisateurs: raw.nbUtilisateurs ?? raw.nombreUtilisateurs,
  }
}

export async function listDirections(
  params?: ListQueryParams,
): Promise<PaginatedResponse<Direction>> {
  const { data } = await apiClient.get<{
    items: DirectionRaw[]
    total: number
    page: number
    limit: number
  }>('/directions', {
    params: {
      page: params?.page,
      limit: params?.limit,
    },
  })

  return {
    items: data.items.map(mapDirection),
    total: data.total,
    page: data.page,
    limit: data.limit,
  }
}

export async function listDirectionOptions(): Promise<Direction[]> {
  const result = await listDirections({ page: 1, limit: SELECT_OPTIONS_LIMIT })
  return result.items
}

export async function createDirection(
  payload: CreateDirectionPayload,
): Promise<Direction> {
  const { data } = await apiClient.post<DirectionRaw>('/directions', payload)
  return mapDirection(data)
}

export async function updateDirection(
  id: string,
  payload: UpdateDirectionPayload,
): Promise<Direction> {
  const { data } = await apiClient.put<DirectionRaw>(
    `/directions/${encodeURIComponent(id)}`,
    payload,
  )
  return mapDirection(data)
}

export async function deleteDirection(id: string): Promise<void> {
  await apiClient.delete(`/directions/${encodeURIComponent(id)}`)
}
