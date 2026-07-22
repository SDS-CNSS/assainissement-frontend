import { useMemo, useState } from 'react'
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
  useFlashFeedback,
} from '@/components/domain/FlashFeedback'
import { DemandeDetailPanel } from '@/components/domain/DemandeDetailPanel'
import { DemandeTable } from '@/components/domain/DemandeTable'
import { RejetModal } from '@/components/domain/RejetModal'
import { TablePagination } from '@/components/domain/TablePagination'
import { getApiErrorMessage } from '@/api/types'
import { useAuthStore } from '@/features/auth/authStore'
import {
  useDemandesList,
  useRejeterN2,
  useValiderN2,
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

export function ChefN2DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const showModuleTabs = user?.moduleAffecte === 'LES_DEUX'

  const [moduleTab, setModuleTab] = useState<ModuleFilterTab>('TOUS')
  const [selectedDemande, setSelectedDemande] = useState<DemandeListItem | null>(
    null,
  )
  const [detailOpen, setDetailOpen] = useState(false)
  const [rejetTarget, setRejetTarget] = useState<DemandeListItem | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<DemandeListItem | null>(
    null,
  )
  const [page, setPage] = useState(DEFAULT_PAGE)
  const { feedback, setFeedback, clearFeedback } = useFlashFeedback()

  const listParams = useMemo(
    () => ({
      niveau: 'N2' as const,
      ...(moduleTab !== 'TOUS' ? { module: moduleTab } : {}),
      page,
      limit: PAGE_SIZE,
    }),
    [moduleTab, page],
  )

  const demandesQuery = useDemandesList(listParams)
  const validerN2 = useValiderN2()
  const rejeterN2 = useRejeterN2()

  const isActionPending = validerN2.isPending || rejeterN2.isPending

  const openDetail = (demande: DemandeListItem) => {
    setSelectedDemande(demande)
    setDetailOpen(true)
  }

  const closeDetail = () => {
    setDetailOpen(false)
  }

  const handleValiderConfirm = async () => {
    if (!confirmTarget) return

    try {
      const result = await validerN2.mutateAsync(confirmTarget.id)
      setFeedback({ variant: 'success', message: result.message })
      setConfirmTarget(null)
      if (selectedDemande?.id === confirmTarget.id) {
        closeDetail()
        setSelectedDemande(null)
      }
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'La validation définitive N2 a échoué. Veuillez réessayer.',
        ),
      })
    }
  }

  const handleRejetSubmit = async (motif: string) => {
    if (!rejetTarget) return

    try {
      const result = await rejeterN2.mutateAsync({
        id: rejetTarget.id,
        motif,
      })
      setFeedback({ variant: 'success', message: result.message })
      setRejetTarget(null)
      if (selectedDemande?.id === rejetTarget.id) {
        closeDetail()
        setSelectedDemande(null)
      }
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'Le rejet N2 a échoué. Veuillez réessayer.',
        ),
      })
    }
  }

  const listError =
    demandesQuery.isError
      ? getApiErrorMessage(
          demandesQuery.error,
          'Impossible de charger la file d\'attente N2.',
        )
      : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cnss-900">
          Validations
        </h2>
        <p className="mt-1 text-slate-600">
          Décision définitive et historique du cycle de vie.
        </p>
      </div>

      <FlashFeedback feedback={feedback} onDismiss={clearFeedback} />

      {listError ? <Alert variant="error">{listError}</Alert> : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Demandes à valider</CardTitle>

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
              selectedId={selectedDemande?.id}
              isActionPending={isActionPending}
              onViewDetail={openDetail}
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

      <DemandeDetailPanel
        demandeId={selectedDemande?.id ?? null}
        open={detailOpen}
        onClose={closeDetail}
        historiqueHref={
          selectedDemande
            ? `/backoffice/chef/historique/${selectedDemande.id}`
            : undefined
        }
      />

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title="Confirmer la validation définitive"
        message={
          confirmTarget
            ? `Valider définitivement la demande ${confirmTarget.numeroDemande} ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Valider définitivement"
        isLoading={validerN2.isPending}
        onConfirm={handleValiderConfirm}
        onCancel={() => setConfirmTarget(null)}
      />

      <RejetModal
        open={Boolean(rejetTarget)}
        title="Rejeter la demande (N2)"
        description={
          rejetTarget
            ? `Indiquez le motif de rejet pour ${rejetTarget.numeroDemande}. La demande sera renvoyée à l'agent N1.`
            : undefined
        }
        isLoading={rejeterN2.isPending}
        onClose={() => setRejetTarget(null)}
        onSubmit={handleRejetSubmit}
      />
    </div>
  )
}
