import { useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  LogIn,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from '@/components/ui'
import { getApiErrorMessage } from '@/api/types'
import { SideDrawer } from '@/components/domain/FormSideDrawer'
import {
  FlashFeedback,
  useFlashFeedback,
} from '@/components/domain/FlashFeedback'
import { TablePagination } from '@/components/domain/TablePagination'
import {
  useAuditLogSummary,
  useAuditLogs,
  useExportAuditLogs,
  useUtilisateurOptions,
} from '@/features/admin/hooks'
import type { AuditLogEntry, AuditLogListParams } from '@/features/admin/types'
import {
  AUDIT_ACTION_OPTIONS,
  formatAuditLogReference,
  getAuditActionShortLabel,
  ROLE_SHORT_LABELS,
} from '@/lib/auditAction'
import { downloadBlob } from '@/lib/downloadBlob'
import { formatDateTimeTable } from '@/lib/formatDate'
import { cn } from '@/lib/cn'
import { DEFAULT_PAGE, PAGE_SIZE } from '@/lib/pagination'

type ResultFilter = '' | 'success' | 'failure'

function buildFilterParams(input: {
  userId: string
  dateDebut: string
  dateFin: string
  actionFilter: string
  resultFilter: ResultFilter
  page?: number
  limit?: number
}): AuditLogListParams {
  return {
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.dateDebut ? { dateDebut: input.dateDebut } : {}),
    ...(input.dateFin ? { dateFin: input.dateFin } : {}),
    ...(input.actionFilter ? { action: input.actionFilter } : {}),
    ...(input.resultFilter ? { resultat: input.resultFilter } : {}),
    page: input.page ?? DEFAULT_PAGE,
    limit: input.limit ?? PAGE_SIZE,
  }
}

function formatEntiteCible(value: string | null): string {
  if (!value) return '—'

  const hashIndex = value.indexOf('#')
  return hashIndex > 0 ? value.slice(0, hashIndex) : value
}

function buildModifiedValues(entry: AuditLogEntry): Record<string, unknown> | null {
  const payload: Record<string, unknown> = {}

  if (entry.valeurAvant && Object.keys(entry.valeurAvant).length > 0) {
    payload.Avant = entry.valeurAvant
  }

  if (entry.valeurApres && Object.keys(entry.valeurApres).length > 0) {
    payload.Après = entry.valeurApres
  }

  return Object.keys(payload).length > 0 ? payload : null
}

function downloadAuditProof(entry: AuditLogEntry): void {
  const payload = {
    identifiant: formatAuditLogReference(entry.id, entry.timestamp),
    dateHeure: formatDateTimeTable(entry.timestamp),
    utilisateur: entry.userIdentifiant ?? 'Système',
    nomComplet: [entry.userPrenom, entry.userNom].filter(Boolean).join(' ') || null,
    role: entry.userRole,
    action: entry.action,
    actionLabel: entry.actionLabel,
    entiteCible: entry.entiteCible,
    resultat: entry.isSuccess ? 'Succès' : 'Échec',
    ipAddress: entry.ipAddress,
    valeursModifiees: buildModifiedValues(entry),
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })

  downloadBlob(
    blob,
    `preuve-audit-${entry.id}-${new Date(entry.timestamp).toISOString().slice(0, 10)}.json`,
  )
}

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'danger' | 'success'
}) {
  const toneClasses = {
    default: 'text-cnss-900',
    danger: 'text-statut-rejetee',
    success: 'text-statut-validee',
  } as const

  const iconClasses = {
    default: 'bg-cnss-100 text-cnss-700',
    danger: 'bg-statut-rejetee/15 text-statut-rejetee',
    success: 'bg-statut-validee/15 text-statut-validee',
  } as const

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className={cn('mt-2 font-display text-3xl font-semibold', toneClasses[tone])}>
            {value}
          </p>
          <p
            className={cn(
              'mt-1 text-sm',
              tone === 'danger' ? 'text-statut-rejetee' : 'text-slate-500',
            )}
          >
            {subtitle}
          </p>
        </div>
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full',
            iconClasses[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  )
}

function AuditLogDetailDrawer({
  entry,
  onClose,
}: {
  entry: AuditLogEntry
  onClose: () => void
}) {
  const modifiedValues = buildModifiedValues(entry)
  const displayName = [entry.userPrenom, entry.userNom].filter(Boolean).join(' ')

  return (
    <SideDrawer
      open
      title="Détails de l'action"
      onClose={onClose}
      titleId="audit-detail-title"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={() => downloadAuditProof(entry)}>
            <Download className="size-4" aria-hidden="true" />
            Télécharger preuve
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Identifiant log
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="font-mono text-sm font-semibold text-cnss-900">
              {formatAuditLogReference(entry.id, entry.timestamp)}
            </p>
            {entry.isSuccess ? (
              <CheckCircle2
                className="size-5 shrink-0 text-statut-validee"
                aria-label="Succès"
              />
            ) : (
              <XCircle
                className="size-5 shrink-0 text-statut-rejetee"
                aria-label="Échec"
              />
            )}
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Date & heure" value={formatDateTimeTable(entry.timestamp)} />
          <DetailField
            label="Action"
            value={
              <Badge variant="outline" className="rounded-md font-mono uppercase">
                {getAuditActionShortLabel(entry.action)}
              </Badge>
            }
          />
          <DetailField
            label="Utilisateur"
            value={
              displayName || entry.userIdentifiant ? (
                <div>
                  <p className="font-medium text-cnss-900">
                    {displayName || entry.userIdentifiant}
                  </p>
                  {entry.userIdentifiant ? (
                    <p className="text-sm text-slate-500">@{entry.userIdentifiant}</p>
                  ) : null}
                </div>
              ) : (
                'Système'
              )
            }
          />
          <DetailField
            label="Rôle"
            value={
              entry.userRole ? (
                <Badge className="rounded-md uppercase">{ROLE_SHORT_LABELS[entry.userRole]}</Badge>
              ) : (
                '—'
              )
            }
          />
          <DetailField
            label="Entité cible"
            value={formatEntiteCible(entry.entiteCible)}
          />
          <DetailField label="Adresse IP" value={entry.ipAddress ?? '—'} />
        </dl>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Valeurs modifiées
          </p>
          {modifiedValues ? (
            <pre className="max-h-80 overflow-auto rounded-xl bg-black p-4 text-xs leading-relaxed text-slate-100">
              {JSON.stringify(modifiedValues, null, 2)}
            </pre>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
              Aucune valeur enregistrée pour cette action.
            </p>
          )}
        </div>
      </div>
    </SideDrawer>
  )
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-cnss-900">{value}</dd>
    </div>
  )
}

/** RG-18 : journal d'audit en lecture seule (aucune modification possible). */
export function AdminAuditLogPage() {
  const [userId, setUserId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [resultFilter, setResultFilter] = useState<ResultFilter>('')
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [appliedFilters, setAppliedFilters] = useState<AuditLogListParams>({
    page: DEFAULT_PAGE,
    limit: PAGE_SIZE,
  })
  const [detailTarget, setDetailTarget] = useState<AuditLogEntry | null>(null)
  const { feedback, setFeedback, clearFeedback } = useFlashFeedback()

  const utilisateursQuery = useUtilisateurOptions()
  const auditQuery = useAuditLogs(appliedFilters)
  const summaryQuery = useAuditLogSummary({
    userId: appliedFilters.userId,
    dateDebut: appliedFilters.dateDebut,
    dateFin: appliedFilters.dateFin,
    action: appliedFilters.action,
    resultat: appliedFilters.resultat,
  })
  const exportMutation = useExportAuditLogs()

  const utilisateurs = utilisateursQuery.data ?? []

  const listError = auditQuery.isError
    ? getApiErrorMessage(
        auditQuery.error,
        'Impossible de charger le journal d\'audit.',
      )
    : null

  const applyFilters = (nextPage = DEFAULT_PAGE) => {
    setPage(nextPage)
    setDetailTarget(null)
    setAppliedFilters(
      buildFilterParams({
        userId,
        dateDebut,
        dateFin,
        actionFilter,
        resultFilter,
        page: nextPage,
      }),
    )
  }

  const handleApplyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    applyFilters(DEFAULT_PAGE)
  }

  const handleResetFilters = () => {
    setUserId('')
    setDateDebut('')
    setDateFin('')
    setActionFilter('')
    setResultFilter('')
    setPage(DEFAULT_PAGE)
    setDetailTarget(null)
    setAppliedFilters({
      page: DEFAULT_PAGE,
      limit: PAGE_SIZE,
    })
  }

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        userId: appliedFilters.userId,
        dateDebut: appliedFilters.dateDebut,
        dateFin: appliedFilters.dateFin,
        action: appliedFilters.action,
        resultat: appliedFilters.resultat,
      })
      downloadBlob(
        blob,
        `journal-audit-${new Date().toISOString().slice(0, 10)}.xlsx`,
      )
      setFeedback({
        variant: 'success',
        message: 'Export XLSX téléchargé avec succès.',
      })
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(error, 'L\'export XLSX a échoué.'),
      })
    }
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    setDetailTarget(null)
    setAppliedFilters((current) => ({
      ...current,
      page: nextPage,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cnss-900">
          Journal d&apos;audit
        </h2>
        <p className="mt-1 text-slate-600">
          Historique des actions sensibles enregistrées par le système (RG-18).
        </p>
      </div>

      <FlashFeedback feedback={feedback} onDismiss={clearFeedback} />

      {listError ? <Alert variant="error">{listError}</Alert> : null}

      <Card>
        <CardHeader className="px-4 py-3 pb-0">
          <CardTitle className="text-base">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <form onSubmit={handleApplyFilters} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="audit-user" className="text-xs uppercase tracking-wide text-slate-500">
                  Utilisateur
                </Label>
                <select
                  id="audit-user"
                  className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                >
                  <option value="">Tous les utilisateurs</option>
                  {utilisateurs.map((utilisateur) => (
                    <option key={utilisateur.id} value={utilisateur.id}>
                      {utilisateur.identifiant}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="audit-date-debut" className="text-xs uppercase tracking-wide text-slate-500">
                  Date début
                </Label>
                <Input
                  id="audit-date-debut"
                  type="date"
                  className="h-9"
                  value={dateDebut}
                  onChange={(event) => setDateDebut(event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="audit-date-fin" className="text-xs uppercase tracking-wide text-slate-500">
                  Date fin
                </Label>
                <Input
                  id="audit-date-fin"
                  type="date"
                  className="h-9"
                  value={dateFin}
                  onChange={(event) => setDateFin(event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="audit-action" className="text-xs uppercase tracking-wide text-slate-500">
                  Type d&apos;action
                </Label>
                <select
                  id="audit-action"
                  className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
                  value={actionFilter}
                  onChange={(event) => setActionFilter(event.target.value)}
                >
                  <option value="">Toutes les actions</option>
                  {AUDIT_ACTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="mr-1 text-xs uppercase tracking-wide text-slate-500">
                  Résultat
                </Label>
                {([
                  ['', 'Tous'],
                  ['success', 'Succès'],
                  ['failure', 'Échec'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value || 'all'}
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                      resultFilter === value
                        ? 'border-cnss-700 bg-cnss-50 text-cnss-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                    )}
                    onClick={() => setResultFilter(value)}
                  >
                    {value === 'success' ? (
                      <CheckCircle2 className="size-3.5 text-statut-validee" aria-hidden="true" />
                    ) : null}
                    {value === 'failure' ? (
                      <XCircle className="size-3.5 text-statut-rejetee" aria-hidden="true" />
                    ) : null}
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="secondary" size="sm">
                  <Filter className="size-3.5" aria-hidden="true" />
                  Appliquer les filtres
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={handleResetFilters}>
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Réinitialiser les filtres
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={exportMutation.isPending}
                  onClick={handleExport}
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  Exporter XLSX
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total actions"
              value={summaryQuery.data?.totalActions ?? 0}
              subtitle="Toutes périodes filtrées"
              icon={BarChart3}
            />
            <StatCard
              label="Connexions actives"
              value={summaryQuery.data?.connexionsActivesAujourdhui ?? 0}
              subtitle="Utilisateurs connectés aujourd'hui"
              icon={LogIn}
            />
            <StatCard
              label="Anomalies"
              value={summaryQuery.data?.anomalies ?? 0}
              subtitle="Nécessite attention"
              icon={AlertTriangle}
              tone={(summaryQuery.data?.anomalies ?? 0) > 0 ? 'danger' : 'default'}
            />
            <StatCard
              label="Dernier export"
              value={
                summaryQuery.data?.dernierExport
                  ? formatDateTimeTable(summaryQuery.data.dernierExport).slice(0, 10)
                  : '—'
              }
              subtitle={
                summaryQuery.data?.dernierExport
                  ? formatDateTimeTable(summaryQuery.data.dernierExport)
                  : 'Aucun export récent'
              }
              icon={Download}
              tone={summaryQuery.data?.dernierExport ? 'success' : 'default'}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Entrées d&apos;audit
            {auditQuery.data ? ` (${auditQuery.data.total})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date &amp; heure
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Utilisateur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Rôle
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Entité cible
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Résultat
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(auditQuery.data?.items ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          Aucune entrée d&apos;audit pour ces critères.
                        </td>
                      </tr>
                    ) : (
                      auditQuery.data?.items.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-slate-100 transition-colors hover:bg-slate-50/80"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                            {formatDateTimeTable(entry.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-cnss-900">
                            {entry.userIdentifiant ?? (
                              <span className="text-slate-400">Système</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {entry.userRole ? (
                              <Badge className="rounded-md uppercase">
                                {ROLE_SHORT_LABELS[entry.userRole]}
                              </Badge>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className="rounded-md font-mono uppercase"
                            >
                              {getAuditActionShortLabel(entry.action)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {formatEntiteCible(entry.entiteCible)}
                          </td>
                          <td className="px-4 py-3">
                            {entry.isSuccess ? (
                              <CheckCircle2
                                className="size-5 text-statut-validee"
                                aria-label="Succès"
                              />
                            ) : (
                              <XCircle
                                className="size-5 text-statut-rejetee"
                                aria-label="Échec"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-10 px-0 text-cnss-700 hover:text-cnss-900"
                                aria-label={`Voir les détails de l'action ${formatAuditLogReference(entry.id, entry.timestamp)}`}
                                onClick={() => setDetailTarget(entry)}
                              >
                                <Eye className="size-5" aria-hidden="true" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {auditQuery.data ? (
                <TablePagination
                  page={page}
                  total={auditQuery.data.total}
                  limit={auditQuery.data.limit}
                  itemLabel="entrée"
                  isLoading={auditQuery.isFetching}
                  onPageChange={handlePageChange}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {detailTarget ? (
        <AuditLogDetailDrawer
          entry={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      ) : null}
    </div>
  )
}
