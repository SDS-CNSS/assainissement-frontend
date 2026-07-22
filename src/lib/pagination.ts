export const PAGE_SIZE = 10
export const DEFAULT_PAGE = 1
export const SELECT_OPTIONS_LIMIT = 100

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export function getTotalPages(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit))
}

export type PaginationItem = number | 'ellipsis'

/** Génère la liste de numéros visibles avec ellipses si nécessaire. */
export function getVisiblePages(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: PaginationItem[] = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    pages.push('ellipsis')
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (end < totalPages - 1) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)

  return pages
}

export interface ListQueryParams {
  page?: number
  limit?: number
}
