import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui'
import { DemandeTable } from '@/components/domain/DemandeTable'
import { TablePagination } from '@/components/domain/TablePagination'
import { getApiErrorMessage } from '@/api/types'
import { useAuthStore } from '@/features/auth/authStore'
import { useMesTraitements } from '@/features/validation/hooks'
import type { ModuleFilterTab } from '@/features/validation/types'
import { cn } from '@/lib/cn'
import { DEFAULT_PAGE, PAGE_SIZE } from '@/lib/pagination'

const MODULE_TABS: { value: ModuleFilterTab; label: string }[] = [
  { value: 'TOUS', label: 'Tous' },
  { value: 'EMPLOYEUR', label: 'Employeur' },
  { value: 'TRAVAILLEUR', label: 'Travailleur' },
]

/**
 * Historique personnel des demandes validées ou rejetées
 * (Agent 1, Agent 2, Superviseur) — consultation seule, sans action.
 */
export function HistoriqueTraitementsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const showModuleTabs = user?.moduleAffecte === 'LES_DEUX'

  const [moduleTab, setModuleTab] = useState<ModuleFilterTab>('TOUS')
  const [page, setPage] = useState(DEFAULT_PAGE)

  const listParams = useMemo(
    () => ({
      ...(moduleTab !== 'TOUS' ? { module: moduleTab } : {}),
      page,
      limit: PAGE_SIZE,
    }),
    [moduleTab, page],
  )

  const tableModuleFilter: ModuleFilterTab | undefined = showModuleTabs
    ? moduleTab
    : user?.moduleAffecte === 'TRAVAILLEUR'
      ? 'TRAVAILLEUR'
      : user?.moduleAffecte === 'EMPLOYEUR'
        ? 'EMPLOYEUR'
        : undefined

  const traitementsQuery = useMesTraitements(listParams)

  const listError = traitementsQuery.isError
    ? getApiErrorMessage(
        traitementsQuery.error,
        'Impossible de charger votre historique de traitements.',
      )
    : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cnss-900">
          Historique
        </h2>
        <p className="mt-1 text-slate-600">
          Demandes que vous avez déjà validées ou rejetées.
        </p>
      </div>

      {listError ? <Alert variant="error">{listError}</Alert> : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Mes traitements</CardTitle>

          {showModuleTabs ? (
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
          ) : null}
        </CardHeader>

        <CardContent>
          {traitementsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DemandeTable
              demandes={traitementsQuery.data?.demandes ?? []}
              readonly
              moduleFilter={tableModuleFilter}
              emptyMessage="Vous n'avez encore validé ni rejeté aucune demande."
              onViewDetail={(demande) =>
                navigate(
                  `/backoffice/demandes/${demande.id}?from=historique`,
                )
              }
            />
          )}

          {traitementsQuery.data && traitementsQuery.data.total > 0 ? (
            <TablePagination
              page={traitementsQuery.data.page}
              limit={traitementsQuery.data.limit}
              total={traitementsQuery.data.total}
              onPageChange={setPage}
              itemLabel="demande"
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
