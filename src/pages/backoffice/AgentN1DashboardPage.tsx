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
import { ConfirmDialog } from '@/components/domain/ConfirmDialog'
import {
  FlashFeedback,
  useFlashFromNavigation,
} from '@/components/domain/FlashFeedback'
import { DemandeTable } from '@/components/domain/DemandeTable'
import { RejetModal } from '@/components/domain/RejetModal'
import { TablePagination } from '@/components/domain/TablePagination'
import { getApiErrorMessage } from '@/api/types'
import { useAuthStore } from '@/features/auth/authStore'
import {
  useDemandesList,
  useRejeterN1,
  useValiderN1,
} from '@/features/validation/hooks'
import type {
  DemandeListItem,
  ModuleFilterTab,
} from '@/features/validation/types'
import { cn } from '@/lib/cn'
import { DEFAULT_PAGE, PAGE_SIZE } from '@/lib/pagination'

const MODULE_TABS: { value: ModuleFilterTab; label: string }[] = [
  { value: 'TOUS', label: 'Tous' },
  { value: 'EMPLOYEUR', label: 'Employeur' },
  { value: 'TRAVAILLEUR', label: 'Travailleur' },
]

export function AgentN1DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const showModuleTabs = user?.moduleAffecte === 'LES_DEUX'

  const [moduleTab, setModuleTab] = useState<ModuleFilterTab>('TOUS')
  const [rejetTarget, setRejetTarget] = useState<DemandeListItem | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<DemandeListItem | null>(
    null,
  )
  const [page, setPage] = useState(DEFAULT_PAGE)
  const { feedback, setFeedback, clearFeedback } = useFlashFromNavigation()

  const listParams = useMemo(
    () => ({
      niveau: 'N1' as const,
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

  const demandesQuery = useDemandesList(listParams, { refetchInterval: 30_000 })
  const validerN1 = useValiderN1()
  const rejeterN1 = useRejeterN1()

  const isActionPending = validerN1.isPending || rejeterN1.isPending

  const handleValiderConfirm = async () => {
    if (!confirmTarget) return

    try {
      const result = await validerN1.mutateAsync(confirmTarget.id)
      setFeedback({ variant: 'success', message: result.message })
      setConfirmTarget(null)
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'La validation Agent 1 a échoué. Veuillez réessayer.',
        ),
      })
    }
  }

  const handleRejetSubmit = async (motif: string) => {
    if (!rejetTarget) return

    try {
      const result = await rejeterN1.mutateAsync({
        id: rejetTarget.id,
        motif,
      })
      setFeedback({ variant: 'success', message: result.message })
      setRejetTarget(null)
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'Le rejet Agent 1 a échoué. Veuillez réessayer.',
        ),
      })
    }
  }

  const listError =
    demandesQuery.isError
      ? getApiErrorMessage(
          demandesQuery.error,
          'Impossible de charger la file d\'attente Agent 1.',
        )
      : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cnss-900">
          File d&apos;attente
        </h2>
        <p className="mt-1 text-slate-600">
          Validation et rejet des demandes en attente de traitement.
        </p>
      </div>

      <FlashFeedback feedback={feedback} onDismiss={clearFeedback} />

      {listError ? <Alert variant="error">{listError}</Alert> : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Demandes en attente</CardTitle>

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
          {demandesQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DemandeTable
              demandes={demandesQuery.data?.demandes ?? []}
              isActionPending={isActionPending}
              compactStatut
              moduleFilter={tableModuleFilter}
              onViewDetail={(demande) =>
                navigate(`/backoffice/demandes/${demande.id}`)
              }
              onValider={setConfirmTarget}
              onRejeter={setRejetTarget}
            />
          )}

          {demandesQuery.data ? (
            <TablePagination
              page={page}
              total={demandesQuery.data.total}
              limit={demandesQuery.data.limit}
              itemLabel="demande"
              isLoading={demandesQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title="Confirmer la validation"
        message={
          confirmTarget
            ? `Valider la demande ${confirmTarget.numeroDemande} ?`
            : ''
        }
        confirmLabel="Oui"
        cancelLabel="Non"
        isLoading={validerN1.isPending}
        onConfirm={handleValiderConfirm}
        onCancel={() => setConfirmTarget(null)}
      />

      <RejetModal
        open={Boolean(rejetTarget)}
        title="Rejeter la demande"
        description={
          rejetTarget
            ? `Rejeter la demande ${rejetTarget.numeroDemande} ?`
            : undefined
        }
        confirmLabel="Oui"
        cancelLabel="Non"
        isLoading={rejeterN1.isPending}
        onClose={() => setRejetTarget(null)}
        onSubmit={handleRejetSubmit}
      />
    </div>
  )
}
