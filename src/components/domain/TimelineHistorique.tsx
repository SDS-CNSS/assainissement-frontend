import { Alert, Skeleton } from '@/components/ui'
import { useHistoriqueDemande } from '@/features/validation/hooks'
import {
  getActionHistoriqueMeta,
  type ActionHistorique,
} from '@/lib/actionHistorique'
import { cn } from '@/lib/cn'

export interface TimelineHistoriqueProps {
  demandeId: string
}

const NODE = {
  neutral: 'bg-slate-500 ring-slate-200',
  success: 'bg-statut-validee ring-statut-validee/25',
  danger: 'bg-statut-rejetee ring-statut-rejetee/25',
  warning: 'bg-statut-enAttente ring-statut-enAttente/30',
} as const

const PILL = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-statut-validee/12 text-emerald-800',
  danger: 'bg-statut-rejetee/12 text-red-800',
  warning: 'bg-statut-enAttente/20 text-amber-900',
} as const

const VALID_ACTIONS: ActionHistorique[] = [
  'DEPOT',
  'VALIDATION_N1',
  'REJET_N1',
  'VALIDATION_N2',
  'REJET_N2',
  'VALIDATION_SUPERVISEUR',
  'REJET_SUPERVISEUR',
]

function isActionHistorique(value: string): value is ActionHistorique {
  return (VALID_ACTIONS as string[]).includes(value)
}

function splitDateTime(isoDate: string): { day: string; time: string } {
  const date = new Date(isoDate)
  return {
    day: new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date),
    time: new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date),
  }
}

export function TimelineHistorique({ demandeId }: TimelineHistoriqueProps) {
  const historiqueQuery = useHistoriqueDemande(demandeId)

  if (historiqueQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="hidden h-10 w-20 shrink-0 sm:block" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (historiqueQuery.isError) {
    return (
      <Alert variant="error">
        Impossible de charger l&apos;historique de cette demande.
      </Alert>
    )
  }

  const entries = historiqueQuery.data?.historique ?? []

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
        <p className="text-sm text-slate-500">
          Aucun événement enregistré pour cette demande.
        </p>
      </div>
    )
  }

  return (
    <ol className="relative">
      {/* Rail continu */}
      <span
        className="absolute bottom-3 left-[5.75rem] top-3 hidden w-px bg-gradient-to-b from-cnss-300 via-slate-200 to-slate-100 sm:block"
        aria-hidden="true"
      />
      <span
        className="absolute bottom-3 left-[0.6875rem] top-3 w-px bg-gradient-to-b from-cnss-300 via-slate-200 to-slate-100 sm:hidden"
        aria-hidden="true"
      />

      {entries.map((entry, index) => {
        const action = isActionHistorique(entry.action)
          ? entry.action
          : 'DEPOT'
        const meta = getActionHistoriqueMeta(action)
        const Icon = meta.icon
        const { day, time } = splitDateTime(entry.dateAction)
        const isFirst = index === 0
        const actor = entry.utilisateur
          ? `${entry.utilisateur.prenom} ${entry.utilisateur.nom}`
          : entry.action === 'DEPOT'
            ? 'Usager — portail public'
            : 'Système'

        return (
          <li
            key={entry.id}
            className={cn(
              'relative grid grid-cols-[1.5rem_1fr] gap-3 pb-5 sm:grid-cols-[5.5rem_1.5rem_1fr] sm:gap-4',
              index === entries.length - 1 && 'pb-0',
            )}
          >
            {/* Colonne date (desktop) */}
            <div className="hidden pt-0.5 text-right sm:block">
              <p className="text-xs font-medium capitalize text-slate-700">
                {day}
              </p>
              <p className="font-mono text-[11px] tabular-nums text-slate-400">
                {time}
              </p>
            </div>

            {/* Nœud */}
            <div className="relative z-10 flex justify-center pt-1">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-white shadow-sm ring-4',
                  NODE[meta.tone],
                  isFirst && 'size-7',
                )}
              >
                <Icon className={cn('size-3', isFirst && 'size-3.5')} aria-hidden="true" />
              </span>
            </div>

            {/* Contenu */}
            <div className="min-w-0 rounded-xl border border-slate-100 bg-white px-3.5 py-3 shadow-[0_1px_2px_rgb(10_10_120/0.04)] transition-shadow hover:shadow-[0_2px_8px_rgb(10_10_120/0.06)]">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold',
                    PILL[meta.tone],
                  )}
                >
                  {meta.label}
                </span>
                <time
                  className="font-mono text-[11px] tabular-nums text-slate-400 sm:hidden"
                  dateTime={entry.dateAction}
                >
                  {day} · {time}
                </time>
              </div>

              <p className="mt-1.5 text-sm text-slate-600">
                <span className="font-medium text-slate-800">{actor}</span>
                {entry.utilisateur?.identifiant ? (
                  <span className="text-slate-400">
                    {' '}
                    · {entry.utilisateur.identifiant}
                  </span>
                ) : null}
              </p>

              {entry.motif ? (
                <blockquote className="mt-2 border-l-2 border-statut-rejetee/40 pl-2.5 text-xs leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-800">Motif :</span>{' '}
                  {entry.motif}
                </blockquote>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
