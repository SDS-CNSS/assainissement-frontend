import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import {
  Alert,
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
import {
  FlashFeedback,
  useFlashFeedback,
} from '@/components/domain/FlashFeedback'
import {
  useExportStatistiques,
  useTableauDeBord,
} from '@/features/admin/hooks'
import type { TableauDeBordFilters } from '@/features/admin/types'
import type { ModuleDemande } from '@/features/demandes/types'
import { MODULE_LABELS } from '@/features/validation/types'
import { STATUT_DEMANDE_MAP } from '@/lib/statutDemande'
import type { StatutDemande } from '@/lib/statutDemande'
import { downloadBlob } from '@/lib/downloadBlob'

/** UC-13 : tableau de bord filtrable et export Excel. */
export function AdminStatistiquesPage() {
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [moduleFilter, setModuleFilter] = useState<ModuleDemande | ''>('')
  const [statutFilter, setStatutFilter] = useState<StatutDemande | ''>('')
  const [appliedFilters, setAppliedFilters] = useState<TableauDeBordFilters>({})
  const { feedback, setFeedback, clearFeedback } = useFlashFeedback()

  const statsQuery = useTableauDeBord(appliedFilters)
  const exportMutation = useExportStatistiques()

  const handleApplyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    setAppliedFilters({
      ...(dateDebut ? { dateDebut } : {}),
      ...(dateFin ? { dateFin } : {}),
      ...(moduleFilter ? { module: moduleFilter } : {}),
      ...(statutFilter ? { statut: statutFilter } : {}),
    })
  }

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(appliedFilters)
      const filename = `statistiques-assainissement-${new Date().toISOString().slice(0, 10)}.xlsx`
      downloadBlob(blob, filename)
      setFeedback({
        variant: 'success',
        message: 'Export Excel téléchargé avec succès.',
      })
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'L\'export Excel a échoué.',
        ),
      })
    }
  }

  const statsError =
    statsQuery.isError
      ? getApiErrorMessage(
          statsQuery.error,
          'Impossible de charger les statistiques.',
        )
      : null

  const statCards = useMemo(() => {
    if (!statsQuery.data) return []

    return [
      {
        label: 'Total demandes',
        value: statsQuery.data.totalDemandes,
        className: 'text-cnss-900',
      },
      {
        label: 'En attente N1',
        value: statsQuery.data.enAttenteN1,
        className: 'text-amber-700',
      },
      {
        label: 'En attente N2',
        value: statsQuery.data.enAttenteN2,
        className: 'text-cnss-700',
      },
      {
        label: 'Validées définitivement',
        value: statsQuery.data.valideesDefinitivement,
        className: 'text-emerald-700',
      },
      {
        label: 'Rejetées / en litige',
        value: statsQuery.data.rejetees,
        className: 'text-statut-rejetee',
      },
      {
        label: 'Module Employeur',
        value: statsQuery.data.parModule.employeur,
        className: 'text-cnss-800',
      },
      {
        label: 'Module Travailleur',
        value: statsQuery.data.parModule.travailleur,
        className: 'text-cnss-800',
      },
    ]
  }, [statsQuery.data])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-cnss-900">
            Statistiques
          </h2>
          <p className="mt-1 text-slate-600">
            Tableau de bord filtrable et export Excel.
          </p>
        </div>
        <Button
          variant="outline"
          isLoading={exportMutation.isPending}
          onClick={handleExport}
        >
          <Download className="size-4" aria-hidden="true" />
          Exporter Excel
        </Button>
      </div>

      <FlashFeedback feedback={feedback} onDismiss={clearFeedback} />

      {statsError ? <Alert variant="error">{statsError}</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleApplyFilters}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="dateDebut">Date début</Label>
              <Input
                id="dateDebut"
                type="date"
                value={dateDebut}
                onChange={(event) => setDateDebut(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateFin">Date fin</Label>
              <Input
                id="dateFin"
                type="date"
                value={dateFin}
                onChange={(event) => setDateFin(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="module">Module</Label>
              <select
                id="module"
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={moduleFilter}
                onChange={(event) =>
                  setModuleFilter(event.target.value as ModuleDemande | '')
                }
              >
                <option value="">Tous</option>
                {Object.entries(MODULE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="statut-filter">Statut</Label>
              <select
                id="statut-filter"
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={statutFilter}
                onChange={(event) =>
                  setStatutFilter(event.target.value as StatutDemande | '')
                }
              >
                <option value="">Tous</option>
                {Object.entries(STATUT_DEMANDE_MAP).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Appliquer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="py-6">
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card) => (
              <Card key={card.label}>
                <CardContent className="py-6">
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p
                    className={`mt-1 font-display text-2xl font-semibold ${card.className}`}
                  >
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
