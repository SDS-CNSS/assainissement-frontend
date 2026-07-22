import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Calendar, Fingerprint, User } from 'lucide-react'
import {
  Alert,
  Card,
  CardContent,
  Skeleton,
} from '@/components/ui'
import { BadgeStatutDemande } from '@/components/domain/BadgeStatutDemande'
import { TimelineHistorique } from '@/components/domain/TimelineHistorique'
import { getApiErrorMessage } from '@/api/types'
import { useAuthStore } from '@/features/auth/authStore'
import { useDemandeDetail } from '@/features/validation/hooks'
import { MODULE_LABELS } from '@/features/validation/types'
import { formatDate } from '@/lib/formatDate'
import {
  getStatutDemandeMeta,
} from '@/lib/statutDemande'

/** UC-11 / RG-11 : historique visible Agent N1, Chef N2 et Admin. */

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-cnss-50 text-cnss-600">
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-cnss-900">{value}</p>
      </div>
    </div>
  )
}

export function ChefHistoriquePage() {
  const { id } = useParams<{ id: string }>()
  const demandeId = id ?? null
  const userRole = useAuthStore((s) => s.user?.role)

  const detailQuery = useDemandeDetail(demandeId)

  const { backTo, backLabel } = (() => {
    switch (userRole) {
      case 'ADMINISTRATEUR':
        return {
          backTo: '/backoffice/admin/supervision',
          backLabel: 'Retour à la supervision',
        }
      case 'AGENT_VALIDATION':
        return {
          backTo: '/backoffice/agent',
          backLabel: 'Retour à la file',
        }
      default:
        return {
          backTo: '/backoffice/chef',
          backLabel: 'Retour aux validations',
        }
    }
  })()

  const detailError =
    detailQuery.isError
      ? getApiErrorMessage(
          detailQuery.error,
          'Impossible de charger les informations de la demande.',
        )
      : null

  const demande = detailQuery.data
  const statutMeta = demande ? getStatutDemandeMeta(demande.statut) : null

  return (
    <div className="space-y-5">
      <div>
        <Link
          to={backTo}
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-cnss-700 hover:text-cnss-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Link>
        <h2 className="font-display text-xl font-semibold text-cnss-900 sm:text-2xl">
          Cycle de vie
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Chronologie des décisions sur la demande
        </p>
      </div>

      {detailError ? <Alert variant="error">{detailError}</Alert> : null}

      {/* En-tête demande */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <div className="p-4 sm:p-5">
          {detailQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : demande ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-bold tracking-wide text-cnss-900 sm:text-xl">
                    {demande.numeroDemande}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {MODULE_LABELS[demande.module]}
                  </p>
                </div>
                {statutMeta ? (
                  <BadgeStatutDemande statut={demande.statut} />
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <MetaChip
                  icon={Fingerprint}
                  label="N° CNSS"
                  value={demande.numeroCNSS}
                />
                <MetaChip
                  icon={Building2}
                  label="Module"
                  value={
                    demande.module === 'EMPLOYEUR' ? 'IFU' : 'NPI'
                  }
                />
                <MetaChip
                  icon={Calendar}
                  label="Dépôt"
                  value={formatDate(demande.dateCreation)}
                />
                <MetaChip
                  icon={User}
                  label="Dernière MAJ"
                  value={formatDate(demande.dateMajStatut)}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Demande introuvable</p>
          )}
        </div>
      </section>

      {/* Timeline */}
      <Card className="overflow-hidden border-slate-200/80">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <div>
            <h3 className="font-display text-sm font-semibold text-cnss-900">
              Journal des actions
            </h3>
            <p className="text-xs text-slate-500">
              Du plus ancien au plus récent
            </p>
          </div>
        </div>
        <CardContent className="p-4 sm:p-5">
          {demandeId ? (
            <TimelineHistorique demandeId={demandeId} />
          ) : (
            <Alert variant="warning">
              Identifiant de demande manquant dans l&apos;URL.
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
