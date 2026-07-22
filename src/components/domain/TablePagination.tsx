import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { getTotalPages, getVisiblePages } from '@/lib/pagination'
import { cn } from '@/lib/cn'

export interface TablePaginationProps {
  page: number
  total: number
  limit: number
  itemLabel?: string
  isLoading?: boolean
  onPageChange: (page: number) => void
}

export function TablePagination({
  page,
  total,
  limit,
  itemLabel = 'élément',
  isLoading = false,
  onPageChange,
}: TablePaginationProps) {
  const totalPages = getTotalPages(total, limit)
  const visiblePages = getVisiblePages(page, totalPages)

  if (total <= limit) {
    return null
  }

  const plural = total > 1 ? 's' : ''

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        {total} {itemLabel}
        {plural} — page {page} sur {totalPages}
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-9 px-0"
          disabled={page <= 1 || isLoading}
          aria-label="Page précédente"
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>

        {visiblePages.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex size-9 items-center justify-center text-sm text-slate-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={isLoading}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                item === page
                  ? 'border-cnss-700 bg-cnss-700 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-cnss-300 hover:bg-cnss-50',
                isLoading && 'cursor-not-allowed opacity-60',
              )}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-9 px-0"
          disabled={page >= totalPages || isLoading}
          aria-label="Page suivante"
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </nav>
    </div>
  )
}
