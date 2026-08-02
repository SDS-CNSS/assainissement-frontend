import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, FileText, History, X } from 'lucide-react'
import { Alert, Button, CardContent, Skeleton } from '@/components/ui'
import {
  DemandeDetailContent,
  DemandeDetailSkeleton,
} from '@/components/domain/DemandeDetailContent'
import { BadgeStatutDemande } from '@/components/domain/BadgeStatutDemande'
import { ConfirmDialog } from '@/components/domain/ConfirmDialog'
import {
  FlashFeedback,
  useFlashFeedback,
} from '@/components/domain/FlashFeedback'
import { RejetModal } from '@/components/domain/RejetModal'
import { TimelineHistorique } from '@/components/domain/TimelineHistorique'
import { getApiErrorMessage } from '@/api/types'
import { useAuthStore } from '@/features/auth/authStore'
import type { AuthUser } from '@/features/auth/types'
import {
  useDemandeDetail,
  useRejeterN1,
  useRejeterN2,
  useRejeterSuperviseur,
  useValiderN1,
  useValiderN2,
  useValiderSuperviseur,
} from '@/features/validation/hooks'
import {
  MODULE_LABELS,
  type DemandeDetail,
} from '@/features/validation/types'
import type { StatutDemande } from '@/lib/statutDemande'
import { cn } from '@/lib/cn'

type DetailTab = 'details' | 'historique'
type ActionNiveau = 'N1' | 'N2' | 'CONTROLEUR'

const TABS: { id: DetailTab; label: string; icon: typeof FileText }[] = [
  { id: 'details', label: 'Détails', icon: FileText },
  { id: 'historique', label: 'Historique', icon: History },
]

const N1_STATUTS: StatutDemande[] = ['EN_ATTENTE_N1']
const N2_STATUTS: StatutDemande[] = ['EN_ATTENTE_N2', 'REJETEE_N1_EN_ATTENTE_N2']
const CONTROLEUR_STATUTS: StatutDemande[] = ['EN_ATTENTE_SUPERVISEUR']

function resolveBackLink(
  role: string | undefined,
  fromHistorique: boolean,
): {
  backTo: string
  backLabel: string
} {
  if (fromHistorique) {
    return {
      backTo: '/backoffice/historique',
      backLabel: 'Retour à l\'historique',
    }
  }

  switch (role) {
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
    case 'CONTROLEUR':
      return {
        backTo: '/backoffice/controleur',
        backLabel: 'Retour à l\'arbitrage',
      }
    default:
      return {
        backTo: '/backoffice/chef',
        backLabel: 'Retour aux validations',
      }
  }
}

function parseTab(value: string | null): DetailTab {
  return value === 'historique' ? 'historique' : 'details'
}

/** Aligné sur DemandeVoter (VALIDATE/REJECT N1|N2|Contrôleur). */
function resolveActionNiveau(
  user: AuthUser | null | undefined,
  demande: DemandeDetail,
): ActionNiveau | null {
  if (!user) return null

  if (user.role === 'AGENT_VALIDATION') {
    if (!N1_STATUTS.includes(demande.statut)) return null
    if (
      user.moduleAffecte &&
      user.moduleAffecte !== 'LES_DEUX' &&
      user.moduleAffecte !== demande.module
    ) {
      return null
    }
    return 'N1'
  }

  if (user.role === 'CHEF_VALIDATION') {
    return N2_STATUTS.includes(demande.statut) ? 'N2' : null
  }

  if (user.role === 'CONTROLEUR') {
    return CONTROLEUR_STATUTS.includes(demande.statut) ? 'CONTROLEUR' : null
  }

  return null
}

/**
 * UC-11 / RG-11 : détail + historique sur une même page (onglets).
 * UC-06 à UC-10 + arbitrage Contrôleur : actions Valider / Rejeter selon rôle et statut.
 */
function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Navigateur / permissions : pas de feedback si la copie échoue.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex size-6 shrink-0 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-cnss-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cnss-500/40"
      aria-label={copied ? 'E-mail copié' : `Copier l'adresse ${email}`}
      title={copied ? 'Copié' : 'Copier l\'e-mail'}
    >
      {copied ? (
        <Check className="size-3.5 text-statut-validee" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
    </button>
  )
}

export function DemandeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const demandeId = id ?? null
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = parseTab(searchParams.get('onglet'))
  const user = useAuthStore((s) => s.user)
  const fromHistorique = searchParams.get('from') === 'historique'
  const { backTo, backLabel } = resolveBackLink(user?.role, fromHistorique)
  const { feedback, setFeedback, clearFeedback } = useFlashFeedback()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejetOpen, setRejetOpen] = useState(false)

  const detailQuery = useDemandeDetail(demandeId)
  const demande = detailQuery.data
  const actionNiveau = demande ? resolveActionNiveau(user, demande) : null

  const validerN1 = useValiderN1()
  const rejeterN1 = useRejeterN1()
  const validerN2 = useValiderN2()
  const rejeterN2 = useRejeterN2()
  const validerSuperviseur = useValiderSuperviseur()
  const rejeterSuperviseur = useRejeterSuperviseur()

  const isActionPending =
    validerN1.isPending ||
    rejeterN1.isPending ||
    validerN2.isPending ||
    rejeterN2.isPending ||
    validerSuperviseur.isPending ||
    rejeterSuperviseur.isPending

  const detailError = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        'Impossible de charger les informations de la demande.',
      )
    : null

  const setTab = (tab: DetailTab) => {
    setSearchParams(
      tab === 'details' ? {} : { onglet: tab },
      { replace: true },
    )
  }

  const redirectToQueue = (message: string) => {
    navigate(backTo, {
      replace: true,
      state: { flash: { variant: 'success' as const, message } },
    })
  }

  const handleValiderConfirm = async () => {
    if (!demandeId || !actionNiveau) return

    try {
      const result =
        actionNiveau === 'N1'
          ? await validerN1.mutateAsync(demandeId)
          : actionNiveau === 'N2'
            ? await validerN2.mutateAsync(demandeId)
            : await validerSuperviseur.mutateAsync(demandeId)
      setConfirmOpen(false)
      redirectToQueue(result.message)
    } catch (error) {
      const fallback =
        actionNiveau === 'N1'
          ? 'La validation a échoué. Veuillez réessayer.'
          : actionNiveau === 'N2'
            ? 'La validation a échoué. Veuillez réessayer.'
            : 'La validation Contrôleur a échoué. Veuillez réessayer.'
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(error, fallback),
      })
    }
  }

  const handleRejetSubmit = async (motif: string) => {
    if (!demandeId || !actionNiveau) return

    try {
      const result =
        actionNiveau === 'N1'
          ? await rejeterN1.mutateAsync({ id: demandeId, motif })
          : actionNiveau === 'N2'
            ? await rejeterN2.mutateAsync({ id: demandeId, motif })
            : await rejeterSuperviseur.mutateAsync({ id: demandeId, motif })
      setRejetOpen(false)
      redirectToQueue(result.message)
    } catch (error) {
      const fallback =
        actionNiveau === 'N1'
          ? 'Le rejet a échoué. Veuillez réessayer.'
          : actionNiveau === 'N2'
            ? 'Le rejet a échoué. Veuillez réessayer.'
            : 'Le rejet Contrôleur a échoué. Veuillez réessayer.'
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(error, fallback),
      })
    }
  }

  if (!demandeId) {
    return <Navigate to={backTo} replace />
  }

  const validerButtonLabel = 'Valider'

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to={backTo}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-cnss-700 hover:text-cnss-900"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {backLabel}
          </Link>
          <h2 className="font-display text-xl font-semibold text-cnss-900 sm:text-2xl">
            Demande
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Consultez le détail et l&apos;historique de la demande
          </p>
        </div>

        {actionNiveau && demande ? (
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:pt-7">
            <Button
              variant="danger"
              size="sm"
              disabled={isActionPending}
              onClick={() => setRejetOpen(true)}
            >
              <X className="size-4" aria-hidden="true" />
              Rejeter
            </Button>
            <Button
              variant="success"
              size="sm"
              disabled={isActionPending}
              onClick={() => setConfirmOpen(true)}
            >
              <Check className="size-4" aria-hidden="true" />
              {validerButtonLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <FlashFeedback feedback={feedback} onDismiss={clearFeedback} />

      {detailError ? <Alert variant="error">{detailError}</Alert> : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          {detailQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : demande ? (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex flex-wrap items-center gap-x-1.5 font-mono text-lg font-bold tracking-wide text-cnss-900 sm:text-xl">
                  <span>{demande.numeroDemande}</span>
                  <span className="font-sans text-sm font-normal text-slate-400">
                    -
                  </span>
                  <span className="inline-flex items-center gap-1 font-sans text-sm font-normal text-slate-600">
                    {demande.email}
                    <CopyEmailButton email={demande.email} />
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {MODULE_LABELS[demande.module]}
                </p>
              </div>
              <BadgeStatutDemande
                statut={demande.statut}
                compact={user?.role !== 'ADMINISTRATEUR'}
              />
            </div>
          ) : (
            <p className="text-sm text-slate-500">Demande introuvable</p>
          )}
        </div>

        <div
          className="flex gap-1 border-b border-slate-100 px-2 sm:px-3"
          role="tablist"
          aria-label="Sections de la demande"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`demande-tab-${tab.id}`}
                aria-controls={`demande-panel-${tab.id}`}
                className={cn(
                  'inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                  selected
                    ? 'border-cnss-700 text-cnss-800'
                    : 'border-transparent text-slate-500 hover:text-cnss-800',
                )}
                onClick={() => setTab(tab.id)}
              >
                <Icon className="size-4" aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <CardContent className="p-4 sm:p-5">
          <div
            role="tabpanel"
            id="demande-panel-details"
            aria-labelledby="demande-tab-details"
            hidden={activeTab !== 'details'}
          >
            {activeTab === 'details' ? (
              detailQuery.isLoading ? (
                <DemandeDetailSkeleton />
              ) : demande ? (
                <DemandeDetailContent demande={demande} />
              ) : null
            ) : null}
          </div>

          <div
            role="tabpanel"
            id="demande-panel-historique"
            aria-labelledby="demande-tab-historique"
            hidden={activeTab !== 'historique'}
          >
            {activeTab === 'historique' ? (
              <div>
                <div className="mb-4">
                  <h3 className="font-display text-sm font-semibold text-cnss-900">
                    Journal des actions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Du plus ancien au plus récent
                  </p>
                </div>
                <TimelineHistorique demandeId={demandeId} />
              </div>
            ) : null}
          </div>
        </CardContent>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={
          actionNiveau === 'CONTROLEUR'
            ? 'Confirmer la validation définitive'
            : 'Confirmer la validation'
        }
        message={
          demande
            ? actionNiveau === 'CONTROLEUR'
              ? `Valider définitivement la demande ${demande.numeroDemande} ? Votre décision sera notifiée au demandeur.`
              : `Valider la demande ${demande.numeroDemande} ?`
            : ''
        }
        confirmLabel={
          actionNiveau === 'CONTROLEUR' ? 'Valider définitivement' : 'Oui'
        }
        cancelLabel={actionNiveau === 'CONTROLEUR' ? 'Annuler' : 'Non'}
        isLoading={
          validerN1.isPending ||
          validerN2.isPending ||
          validerSuperviseur.isPending
        }
        onConfirm={handleValiderConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <RejetModal
        open={rejetOpen}
        title={
          actionNiveau === 'CONTROLEUR'
            ? 'Rejeter la demande (Contrôleur)'
            : 'Rejeter la demande'
        }
        description={
          demande
            ? actionNiveau === 'CONTROLEUR'
              ? `Indiquez le motif de rejet pour ${demande.numeroDemande}. Le demandeur sera notifié.`
              : `Rejeter la demande ${demande.numeroDemande} ?`
            : undefined
        }
        confirmLabel={actionNiveau === 'CONTROLEUR' ? 'Confirmer le rejet' : 'Oui'}
        cancelLabel={actionNiveau === 'CONTROLEUR' ? 'Annuler' : 'Non'}
        isLoading={
          rejeterN1.isPending ||
          rejeterN2.isPending ||
          rejeterSuperviseur.isPending
        }
        onClose={() => setRejetOpen(false)}
        onSubmit={handleRejetSubmit}
      />
    </div>
  )
}
