import { useEffect, useMemo, useState } from 'react'
import { Download, Layers } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Skeleton,
} from '@/components/ui'
import { ConfirmDialog } from '@/components/domain/ConfirmDialog'
import {
  FlashFeedback,
  useFlashFeedback,
} from '@/components/domain/FlashFeedback'
import { getApiErrorMessage } from '@/api/types'
import {
  CONFLICT_MOTIF_LABELS,
  CONSOLIDATION_MODULE_LABELS,
  downloadConsolidationFiles,
  fetchConsolidationPreview,
  runConsolidationExport,
  type ConsolidationModule,
} from '@/api/admin/consolidation'
import { listAuditLogs } from '@/api/admin/audit'
import { cn } from '@/lib/cn'

const previewKey = ['admin', 'consolidation-preview'] as const

function pickDefaultModule(
  eligibleEmployeur: number,
  eligibleTravailleur: number,
): ConsolidationModule | null {
  if (eligibleEmployeur > 0 && eligibleTravailleur > 0) return 'LES_DEUX'
  if (eligibleEmployeur > 0) return 'EMPLOYEUR'
  if (eligibleTravailleur > 0) return 'TRAVAILLEUR'
  return null
}

function selectedEligibleCount(
  module: ConsolidationModule | null,
  eligibleEmployeur: number,
  eligibleTravailleur: number,
): number {
  if (module === 'EMPLOYEUR') return eligibleEmployeur
  if (module === 'TRAVAILLEUR') return eligibleTravailleur
  if (module === 'LES_DEUX') return eligibleEmployeur + eligibleTravailleur
  return 0
}

function selectedConflictCount(
  module: ConsolidationModule | null,
  conflictEmployeur: number,
  conflictTravailleur: number,
): number {
  if (module === 'EMPLOYEUR') return conflictEmployeur
  if (module === 'TRAVAILLEUR') return conflictTravailleur
  if (module === 'LES_DEUX') return conflictEmployeur + conflictTravailleur
  return 0
}

/**
 * Consolidation Admin : écriture IFU/NPI des demandes validées dans le référentiel
 * + export Excel. Écrasement si valeur différente ; conflit si fiche absente.
 */
export function AdminConsolidationPage() {
  const queryClient = useQueryClient()
  const { feedback, setFeedback, clearFeedback } = useFlashFeedback()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedModule, setSelectedModule] =
    useState<ConsolidationModule | null>(null)

  const previewQuery = useQuery({
    queryKey: previewKey,
    queryFn: fetchConsolidationPreview,
  })

  const lastExportQuery = useQuery({
    queryKey: ['admin', 'consolidation-last-export'],
    queryFn: () => listAuditLogs({ action: 'CONSOLIDATION', page: 1, limit: 5 }),
  })

  const eligibleEmployeur = previewQuery.data?.eligibleEmployeur ?? 0
  const eligibleTravailleur = previewQuery.data?.eligibleTravailleur ?? 0
  const conflictEmployeur = previewQuery.data?.conflictEmployeur ?? 0
  const conflictTravailleur = previewQuery.data?.conflictTravailleur ?? 0

  const availableModules = useMemo(() => {
    const options: ConsolidationModule[] = []
    if (eligibleEmployeur > 0) options.push('EMPLOYEUR')
    if (eligibleTravailleur > 0) options.push('TRAVAILLEUR')
    if (eligibleEmployeur > 0 && eligibleTravailleur > 0) options.push('LES_DEUX')
    return options
  }, [eligibleEmployeur, eligibleTravailleur])

  useEffect(() => {
    if (!previewQuery.isSuccess) return

    setSelectedModule((current) => {
      if (current && availableModules.includes(current)) return current
      return pickDefaultModule(eligibleEmployeur, eligibleTravailleur)
    })
  }, [
    previewQuery.isSuccess,
    availableModules,
    eligibleEmployeur,
    eligibleTravailleur,
  ])

  const consolidateMutation = useMutation({
    mutationFn: (module: ConsolidationModule) => runConsolidationExport(module),
    onSuccess: async (result) => {
      downloadConsolidationFiles(result.files)
      setConfirmOpen(false)
      const fileCount = result.files.length
      const fileLabel =
        fileCount > 1
          ? `${fileCount} fichiers Excel téléchargés (employeurs / travailleurs).`
          : 'Fichier Excel téléchargé.'
      setFeedback({
        variant: 'success',
        message:
          result.conflictCount > 0
            ? `${result.count} mise(s) à jour consolidée(s). ${fileLabel} ${result.conflictCount} conflit(s) non appliqué(s) (visibles ci-dessous).`
            : `${result.count} mise(s) à jour consolidée(s). ${fileLabel}`,
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: previewKey }),
        queryClient.invalidateQueries({
          queryKey: ['admin', 'consolidation-last-export'],
        }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'tableau-de-bord'] }),
      ])
    },
    onError: (error) => {
      setFeedback({
        variant: 'error',
        message:
          error instanceof Error
            ? error.message
            : getApiErrorMessage(
                error,
                'La consolidation a échoué. Aucune donnée n\'a été modifiée.',
              ),
      })
    },
  })

  const preview = previewQuery.data
  const eligibleCount = preview?.eligibleCount ?? 0
  const conflictCount = preview?.conflictCount ?? 0
  const scopedEligibleCount = selectedEligibleCount(
    selectedModule,
    eligibleEmployeur,
    eligibleTravailleur,
  )
  const scopedConflictCount = selectedConflictCount(
    selectedModule,
    conflictEmployeur,
    conflictTravailleur,
  )

  const previewError = previewQuery.isError
    ? getApiErrorMessage(
        previewQuery.error,
        'Impossible de charger l\'aperçu de consolidation.',
      )
    : null

  const canConsolidate =
    selectedModule !== null &&
    scopedEligibleCount > 0 &&
    !consolidateMutation.isPending

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cnss-900">
          Consolidation
        </h2>
        <p className="mt-1 text-slate-600">
          Appliquer les IFU / NPI des demandes validées définitivement dans le
          référentiel CNSS, puis exporter un fichier Excel par module sélectionné.
        </p>
      </div>

      <FlashFeedback feedback={feedback} onDismiss={clearFeedback} />

      {previewError ? <Alert variant="error">{previewError}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Éligibles"
          value={eligibleCount}
          hint="Seront consolidés"
          tone="success"
          loading={previewQuery.isLoading}
        />
        <MetricCard
          label="Employeur (IFU)"
          value={eligibleEmployeur}
          hint="Éligibles module Employeur"
          tone="info"
          loading={previewQuery.isLoading}
        />
        <MetricCard
          label="Travailleur (NPI)"
          value={eligibleTravailleur}
          hint="Éligibles module Travailleur"
          tone="info"
          loading={previewQuery.isLoading}
        />
        <MetricCard
          label="Conflits"
          value={conflictCount}
          hint="Signalés, non appliqués"
          tone="warning"
          loading={previewQuery.isLoading}
        />
      </div>

      <Alert variant="warning">
        <span className="inline-flex h-full items-center pt-1">
          Opération irréversible : les lignes consolidées sont figées. Les
          IFU/NPI validés sont écrits dans le référentiel.
        </span>
      </Alert>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="inline-flex items-center gap-2">
            <Layers className="size-5 text-cnss-700" aria-hidden />
            Lancer la consolidation
          </CardTitle>
          <Button
            disabled={!canConsolidate}
            onClick={() => setConfirmOpen(true)}
          >
            <Download className="size-4" aria-hidden />
            Consolider et télécharger les Excel
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          {eligibleCount === 0 ? (
            conflictCount > 0 ? (
              <p>
                Aucune ligne applicable pour le moment. Créez les fiches
                référentiel manquantes, puis réessayez.
              </p>
            ) : (
              <p>Aucune demande validée en attente de consolidation.</p>
            )
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="consolidation-module">
                  Module à consolider
                </Label>
                <select
                  id="consolidation-module"
                  className={cn(
                    'flex h-10 w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cnss-400 focus-visible:ring-offset-1',
                  )}
                  value={selectedModule ?? ''}
                  onChange={(event) =>
                    setSelectedModule(
                      event.target.value as ConsolidationModule,
                    )
                  }
                >
                  {availableModules.map((module) => (
                    <option key={module} value={module}>
                      {CONSOLIDATION_MODULE_LABELS[module]}
                      {module === 'EMPLOYEUR'
                        ? ` — ${eligibleEmployeur}`
                        : module === 'TRAVAILLEUR'
                          ? ` — ${eligibleTravailleur}`
                          : ` — ${eligibleEmployeur + eligibleTravailleur}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  Seuls les modules disposant de données éligibles sont proposés.
                </p>
              </div>
              <p>
                {scopedEligibleCount} demande(s) seront appliquée(s) au
                référentiel
                {selectedModule
                  ? ` (${CONSOLIDATION_MODULE_LABELS[selectedModule]})`
                  : ''}
                .
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {conflictCount > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Conflits signalés</CardTitle>
          </CardHeader>
          <CardContent>
            {previewQuery.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-2 py-2 font-medium">Demande</th>
                      <th className="px-2 py-2 font-medium">Module</th>
                      <th className="px-2 py-2 font-medium">N° CNSS</th>
                      <th className="px-2 py-2 font-medium">Demande</th>
                      <th className="px-2 py-2 font-medium">Référentiel</th>
                      <th className="px-2 py-2 font-medium">Motif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(preview?.conflicts ?? []).map((row) => (
                      <tr
                        key={row.numeroDemande}
                        className="border-b border-slate-100"
                      >
                        <td className="px-2 py-2 font-mono text-xs">
                          {row.numeroDemande}
                        </td>
                        <td className="px-2 py-2">{row.module}</td>
                        <td className="px-2 py-2 font-mono text-xs">
                          {row.numeroCNSS}
                        </td>
                        <td className="px-2 py-2 font-mono text-xs">
                          {row.valeurConsolidee ?? '—'}
                        </td>
                        <td className="px-2 py-2 font-mono text-xs">
                          {row.valeurReferentielAvant ?? '—'}
                        </td>
                        <td className="px-2 py-2 text-amber-800">
                          {row.motifConflit
                            ? (CONFLICT_MOTIF_LABELS[row.motifConflit] ??
                              row.motifConflit)
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {conflictCount > (preview?.conflicts.length ?? 0) ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Aperçu limité à {preview?.conflicts.length} conflit(s).
                  </p>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Dernières consolidations</CardTitle>
        </CardHeader>
        <CardContent>
          {lastExportQuery.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (lastExportQuery.data?.items.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">Aucun export pour le moment.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lastExportQuery.data?.items.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span className="text-slate-700">
                    {new Date(entry.timestamp).toLocaleString('fr-FR')}
                    {entry.utilisateur ? ` — ${entry.utilisateur}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmer la consolidation"
        message={
          selectedModule
            ? `Consolider ${scopedEligibleCount} demande(s) — ${CONSOLIDATION_MODULE_LABELS[selectedModule]} — dans le référentiel ?${
                scopedConflictCount > 0
                  ? ` ${scopedConflictCount} fiche(s) absente(s) resteront non appliquées.`
                  : ''
              } Un fichier Excel sera téléchargé par module concerné. Cette opération est irréversible.`
            : ''
        }
        confirmLabel="Consolider"
        isLoading={consolidateMutation.isPending}
        onConfirm={() => {
          if (selectedModule) consolidateMutation.mutate(selectedModule)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

function MetricCard({
  label,
  value,
  hint,
  tone,
  loading,
}: {
  label: string
  value: number
  hint: string
  tone: 'success' | 'warning' | 'info'
  loading: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <p
            className={cn(
              'mt-1 font-display text-3xl font-semibold',
              tone === 'success' && 'text-emerald-700',
              tone === 'warning' && 'text-amber-700',
              tone === 'info' && 'text-cnss-800',
            )}
          >
            {value}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      </CardContent>
    </Card>
  )
}
