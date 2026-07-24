import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from '@/components/ui'
import { DemandeTable } from '@/components/domain/DemandeTable'
import { TablePagination } from '@/components/domain/TablePagination'
import { getApiErrorMessage } from '@/api/types'
import { useSupervisionList } from '@/features/admin/hooks'
import type { SupervisionFilters } from '@/features/admin/types'
import type { ModuleFilterTab } from '@/features/validation/types'
import { STATUT_DEMANDE_MAP } from '@/lib/statutDemande'
import type { StatutDemande } from '@/lib/statutDemande'
import { DEFAULT_PAGE, PAGE_SIZE } from '@/lib/pagination'
import { cn } from '@/lib/cn'

const MODULE_TABS: { value: ModuleFilterTab; label: string }[] = [
  { value: 'TOUS', label: 'Tous' },
  { value: 'EMPLOYEUR', label: 'Employeur' },
  { value: 'TRAVAILLEUR', label: 'Travailleur' },
]

/** UC-14 : supervision globale de toutes les demandes. */
export function AdminSupervisionPage() {
  const navigate = useNavigate()
  const [moduleTab, setModuleTab] = useState<ModuleFilterTab>('TOUS')
  const [statutFilter, setStatutFilter] = useState<StatutDemande | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(DEFAULT_PAGE)

  const filters = useMemo<SupervisionFilters>(
    () => ({
      ...(moduleTab !== 'TOUS' ? { module: moduleTab } : {}),
      ...(statutFilter ? { statut: statutFilter } : {}),
      ...(appliedSearch ? { search: appliedSearch } : {}),
      page,
      limit: PAGE_SIZE,
    }),
    [moduleTab, statutFilter, appliedSearch, page],
  )

  const supervisionQuery = useSupervisionList(filters)

  const listError =
    supervisionQuery.isError
      ? getApiErrorMessage(
          supervisionQuery.error,
          'Impossible de charger les demandes.',
        )
      : null

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(DEFAULT_PAGE)
    setAppliedSearch(searchInput.trim())
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cnss-900">
          Supervision globale
        </h2>
        <p className="mt-1 text-slate-600">
          Recherche multi-critères sur l&apos;ensemble des demandes.
        </p>
      </div>

      {listError ? <Alert variant="error">{listError}</Alert> : null}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              Demandes
              {supervisionQuery.data
                ? ` (${supervisionQuery.data.total})`
                : ''}
            </CardTitle>

            <div
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
              role="tablist"
              aria-label="Filtrer par module"
            >
              {MODULE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={moduleTab === tab.value}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200',
                    moduleTab === tab.value
                      ? 'bg-white text-cnss-800 shadow-sm'
                      : 'text-slate-600 hover:text-cnss-800',
                  )}
                  onClick={() => {
                    setModuleTab(tab.value)
                    setPage(DEFAULT_PAGE)
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id="search"
                  className="pl-9"
                  placeholder="Numéro de demande, CNSS, IFU, NPI…"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
            </div>

            <div className="w-full space-y-1.5 sm:w-56">
              <Label htmlFor="statut">Statut</Label>
              <select
                id="statut"
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={statutFilter}
                onChange={(event) => {
                  setStatutFilter(event.target.value as StatutDemande | '')
                  setPage(DEFAULT_PAGE)
                }}
              >
                <option value="">Tous les statuts</option>
                {Object.entries(STATUT_DEMANDE_MAP).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-cnss-700 px-4 text-sm font-medium text-white hover:bg-cnss-800"
            >
              Filtrer
            </button>
          </form>
        </CardHeader>

        <CardContent>
          {supervisionQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DemandeTable
              demandes={supervisionQuery.data?.demandes ?? []}
              readonly
              moduleFilter={moduleTab}
              onViewDetail={(demande) =>
                navigate(`/backoffice/demandes/${demande.id}`)
              }
            />
          )}

          {supervisionQuery.data ? (
            <TablePagination
              page={page}
              total={supervisionQuery.data.total}
              limit={supervisionQuery.data.limit}
              itemLabel="demande"
              isLoading={supervisionQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
