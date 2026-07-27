import { useState } from 'react'
import { AlertTriangle, Download, Layers } from 'lucide-react'
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
  fetchConsolidationPreview,
  runConsolidationExport,
} from '@/api/admin/consolidation'
import { listAuditLogs } from '@/api/admin/audit'
import { downloadBlob } from '@/lib/downloadBlob'
import { cn } from '@/lib/cn'

const previewKey = ['admin', 'consolidation-preview'] as const

/**
 * Consolidation Admin : écriture IFU/NPI des demandes validées dans le référentiel
 * + export Excel. Écrasement si valeur différente ; conflit si fiche absente.
 */
export function AdminConsolidationPage() {
  const queryClient = useQueryClient()
  const { feedback, setFeedback, clearFeedback } = useFlashFeedback()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const previewQuery = useQuery({
    queryKey: previewKey,
    queryFn: fetchConsolidationPreview,
  })

  const lastExportQuery = useQuery({
    queryKey: ['admin', 'consolidation-last-export'],
    queryFn: () => listAuditLogs({ action: 'CONSOLIDATION', page: 1, limit: 5 }),
  })

  const consolidateMutation = useMutation({
    mutationFn: runConsolidationExport,
    onSuccess: async (result) => {
      downloadBlob(result.blob, result.filename)
      setConfirmOpen(false)
      setFeedback({
        variant: 'success',
        message:
          result.conflictCount > 0
            ? `${result.count} mise(s) à jour consolidée(s). ${result.conflictCount} conflit(s) signalé(s) dans l'Excel (non appliqués).`
            : `${result.count} mise(s) à jour consolidée(s). Fichier Excel téléchargé.`,
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

  const previewError = previewQuery.isError
    ? getApiErrorMessage(
        previewQuery.error,
        'Impossible de charger l\'aperçu de consolidation.',
      )
    : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cnss-900">
          Consolidation
        </h2>
        <p className="mt-1 text-slate-600">
          Appliquer les IFU / NPI des demandes validées définitivement dans le
          référentiel CNSS, puis exporter le lot.
        </p>
      </div>

      <FlashFeedback feedback={feedback} onDismiss={clearFeedback} />

      {previewError ? <Alert variant="error">{previewError}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Éligibles"
          value={eligibleCount}
          hint="Seront écrits dans le référentiel"
          tone="success"
          loading={previewQuery.isLoading}
        />
        <MetricCard
          label="Employeur (IFU)"
          value={preview?.eligibleEmployeur ?? 0}
          hint="Éligibles module Employeur"
          tone="info"
          loading={previewQuery.isLoading}
        />
        <MetricCard
          label="Travailleur (NPI)"
          value={preview?.eligibleTravailleur ?? 0}
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
            disabled={eligibleCount === 0 || consolidateMutation.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <Download className="size-4" aria-hidden />
            Consolider et télécharger l&apos;Excel
          </Button>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          {eligibleCount === 0
            ? conflictCount > 0
              ? 'Aucune ligne applicable pour le moment. Créez les fiches référentiel manquantes, puis réessayez.'
              : 'Aucune demande validée en attente de consolidation.'
            : `${eligibleCount} demande(s) seront appliquée(s) au référentiel.`}
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
                    Aperçu limité à {preview?.conflicts.length} conflit(s) — le
                    détail complet sera dans l&apos;Excel.
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
        message={`Consolider ${eligibleCount} demande(s) validée(s) dans le référentiel ?${
          conflictCount > 0
            ? ` ${conflictCount} fiche(s) absente(s) seront signalée(s) sans être appliquées.`
            : ''
        } Cette opération est irréversible.`}
        confirmLabel="Consolider"
        isLoading={consolidateMutation.isPending}
        onConfirm={() => consolidateMutation.mutate()}
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
