import { useState } from 'react'
import { Download, Layers } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
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
import { getApiErrorMessage } from '@/api/types'
import {
  CONFLICT_MOTIF_LABELS,
  CONSOLIDATION_MODULE_LABELS,
  downloadConsolidationFiles,
  fetchConsolidationPreview,
  redownloadConsolidationExport,
  runConsolidationExport,
  type ConsolidationModule,
} from '@/api/admin/consolidation'
import { listAuditLogs } from '@/api/admin/audit'
import { cn } from '@/lib/cn'

const previewKey = ['admin', 'consolidation-preview'] as const

type ModuleSelection = {
  employeur: boolean
  travailleur: boolean
}

const EMPTY_SELECTION: ModuleSelection = {
  employeur: false,
  travailleur: false,
}

function defaultSelection(
  eligibleEmployeur: number,
  eligibleTravailleur: number,
): ModuleSelection {
  return {
    employeur: eligibleEmployeur > 0,
    travailleur: eligibleTravailleur > 0,
  }
}

/** Mappe les cases cochées vers le périmètre API (LES_DEUX = 2 fichiers Excel). */
function selectionToScope(
  selection: ModuleSelection,
): ConsolidationModule | null {
  if (selection.employeur && selection.travailleur) return 'LES_DEUX'
  if (selection.employeur) return 'EMPLOYEUR'
  if (selection.travailleur) return 'TRAVAILLEUR'
  return null
}

function selectedEligibleCount(
  selection: ModuleSelection,
  eligibleEmployeur: number,
  eligibleTravailleur: number,
): number {
  return (
    (selection.employeur ? eligibleEmployeur : 0) +
    (selection.travailleur ? eligibleTravailleur : 0)
  )
}

function selectedConflictCount(
  selection: ModuleSelection,
  conflictEmployeur: number,
  conflictTravailleur: number,
): number {
  return (
    (selection.employeur ? conflictEmployeur : 0) +
    (selection.travailleur ? conflictTravailleur : 0)
  )
}

function selectedFileCount(selection: ModuleSelection): number {
  return (
    (selection.employeur ? 1 : 0) + (selection.travailleur ? 1 : 0)
  )
}

/**
 * Consolidation Admin : écriture IFU/NPI des demandes validées dans le référentiel
 * + export Excel. Écrasement si valeur différente ; conflit si fiche absente.
 */
export function AdminConsolidationPage() {
  const queryClient = useQueryClient()
  const { feedback, setFeedback, clearFeedback } = useFlashFeedback()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selection, setSelection] = useState<ModuleSelection>(EMPTY_SELECTION)

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

  const selectedScope = selectionToScope(selection)

  const consolidateMutation = useMutation({
    mutationFn: (module: ConsolidationModule) => runConsolidationExport(module),
    onSuccess: async (result) => {
      downloadConsolidationFiles(result.files)
      setConfirmOpen(false)
      setSelection(EMPTY_SELECTION)
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

  const redownloadMutation = useMutation({
    mutationFn: (auditLogId: string) =>
      redownloadConsolidationExport(auditLogId),
    onSuccess: (files) => {
      downloadConsolidationFiles(files)
      const fileCount = files.length
      setFeedback({
        variant: 'success',
        message:
          fileCount > 1
            ? `${fileCount} fichiers Excel retéléchargés.`
            : 'Fichier Excel retéléchargé.',
      })
    },
    onError: (error) => {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'Impossible de retélécharger cet export.',
        ),
      })
    },
  })

  const preview = previewQuery.data
  const eligibleCount = preview?.eligibleCount ?? 0
  const conflictCount = preview?.conflictCount ?? 0
  const scopedEligibleCount = selectedEligibleCount(
    selection,
    eligibleEmployeur,
    eligibleTravailleur,
  )
  const scopedConflictCount = selectedConflictCount(
    selection,
    conflictEmployeur,
    conflictTravailleur,
  )
  const fileCountPreview = selectedFileCount(selection)

  const previewError = previewQuery.isError
    ? getApiErrorMessage(
        previewQuery.error,
        'Impossible de charger l\'aperçu de consolidation.',
      )
    : null

  const canOpenConsolidate =
    eligibleCount > 0 && !consolidateMutation.isPending

  const openConsolidateDialog = () => {
    setSelection(defaultSelection(eligibleEmployeur, eligibleTravailleur))
    setConfirmOpen(true)
  }

  const closeConsolidateDialog = () => {
    if (consolidateMutation.isPending) return
    setConfirmOpen(false)
    setSelection(EMPTY_SELECTION)
  }

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
            disabled={!canOpenConsolidate}
            onClick={openConsolidateDialog}
          >
            <Download className="size-4" aria-hidden />
            Consolider et télécharger les Excel
          </Button>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
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
            <p>
              {eligibleCount} demande(s) éligible(s) au total
              {eligibleEmployeur > 0 || eligibleTravailleur > 0
                ? ` (${eligibleEmployeur} employeur${eligibleEmployeur > 1 ? 's' : ''}, ${eligibleTravailleur} travailleur${eligibleTravailleur > 1 ? 's' : ''})`
                : ''}
              . Choisissez les modules à cocher au moment de consolider.
            </p>
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
                    {(preview?.conflicts ?? []).map((conflict) => (
                      <tr
                        key={`${conflict.numeroDemande}-${conflict.numeroCNSS}`}
                        className="border-b border-slate-100"
                      >
                        <td className="px-2 py-2 font-mono text-xs">
                          {conflict.numeroDemande}
                        </td>
                        <td className="px-2 py-2">{conflict.module}</td>
                        <td className="px-2 py-2 font-mono text-xs">
                          {conflict.numeroCNSS}
                        </td>
                        <td className="px-2 py-2">
                          {conflict.valeurConsolidee ?? '—'}
                        </td>
                        <td className="px-2 py-2">
                          {conflict.valeurReferentielAvant ?? '—'}
                        </td>
                        <td className="px-2 py-2 text-amber-800">
                          {conflict.motifConflit
                            ? (CONFLICT_MOTIF_LABELS[conflict.motifConflit] ??
                              conflict.motifConflit)
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
              {lastExportQuery.data?.items.map((entry) => {
                const isDownloading =
                  redownloadMutation.isPending &&
                  redownloadMutation.variables === entry.id
                const count =
                  typeof entry.valeurApres?.count === 'number'
                    ? entry.valeurApres.count
                    : null
                const moduleRaw = entry.valeurApres?.module
                const moduleLabel =
                  typeof moduleRaw === 'string' &&
                  moduleRaw in CONSOLIDATION_MODULE_LABELS
                    ? CONSOLIDATION_MODULE_LABELS[
                        moduleRaw as ConsolidationModule
                      ]
                    : null

                return (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div className="min-w-0 text-slate-700">
                      <p>
                        {new Date(entry.timestamp).toLocaleString('fr-FR')}
                        {entry.utilisateur ? ` — ${entry.utilisateur}` : ''}
                      </p>
                      {count !== null || moduleLabel ? (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {[
                            count !== null ? `${count} demande(s)` : null,
                            moduleLabel,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5"
                      isLoading={isDownloading}
                      disabled={redownloadMutation.isPending}
                      onClick={() => redownloadMutation.mutate(entry.id)}
                      aria-label={`Retélécharger l'export du ${new Date(entry.timestamp).toLocaleString('fr-FR')}`}
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Télécharger
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmer la consolidation"
        message="Cochez le ou les modules à consolider. Un fichier Excel sera téléchargé pour chaque module coché. Cette opération est irréversible."
        confirmLabel="Consolider"
        isLoading={consolidateMutation.isPending}
        confirmDisabled={
          selectedScope === null || scopedEligibleCount === 0
        }
        onConfirm={() => {
          if (selectedScope) consolidateMutation.mutate(selectedScope)
        }}
        onCancel={closeConsolidateDialog}
      >
        <fieldset className="space-y-3" disabled={consolidateMutation.isPending}>
          <legend className="sr-only">Modules à consolider</legend>

          {eligibleEmployeur > 0 ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-cnss-700 focus:ring-cnss-400"
                checked={selection.employeur}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    employeur: event.target.checked,
                  }))
                }
              />
              <span className="text-sm font-medium text-slate-800">
                IFU — {eligibleEmployeur}
              </span>
            </label>
          ) : null}

          {eligibleTravailleur > 0 ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-cnss-700 focus:ring-cnss-400"
                checked={selection.travailleur}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    travailleur: event.target.checked,
                  }))
                }
              />
              <span className="text-sm font-medium text-slate-800">
                NPI — {eligibleTravailleur}
              </span>
            </label>
          ) : null}

          {scopedEligibleCount > 0 ? (
            <p className="text-xs text-slate-500">
              {scopedEligibleCount} demande(s) seront appliquée(s)
              {fileCountPreview > 1
                ? ` · ${fileCountPreview} fichiers Excel`
                : fileCountPreview === 1
                  ? ' · 1 fichier Excel'
                  : ''}
              {scopedConflictCount > 0
                ? ` · ${scopedConflictCount} fiche(s) absente(s) resteront non appliquées`
                : ''}
              .
            </p>
          ) : (
            <p className="text-xs text-statut-rejetee">
              Cochez au moins un module pour continuer.
            </p>
          )}
        </fieldset>
      </ConfirmDialog>
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
