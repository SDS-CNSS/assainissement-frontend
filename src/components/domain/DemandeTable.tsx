import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Eye,
  X,
} from 'lucide-react'
import { BadgeStatutDemande } from '@/components/domain/BadgeStatutDemande'
import { Button } from '@/components/ui'
import type { DemandeListItem } from '@/features/validation/types'
import { MODULE_LABELS } from '@/features/validation/types'
import { formatDate } from '@/lib/formatDate'
import { cn } from '@/lib/cn'

type SortColumn =
  | 'numeroDemande'
  | 'module'
  | 'numeroCNSS'
  | 'statut'
  | 'dateCreation'

type SortDirection = 'asc' | 'desc'

export interface DemandeTableProps {
  demandes: DemandeListItem[]
  onViewDetail: (demande: DemandeListItem) => void
  onValider?: (demande: DemandeListItem) => void
  onRejeter?: (demande: DemandeListItem) => void
  isActionPending?: boolean
  selectedId?: string | null
  readonly?: boolean
}

function SortIcon({
  column,
  sortColumn,
  sortDirection,
}: {
  column: SortColumn
  sortColumn: SortColumn
  sortDirection: SortDirection
}) {
  if (sortColumn !== column) {
    return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />
  }
  return sortDirection === 'asc' ? (
    <ArrowUp className="size-3.5" aria-hidden="true" />
  ) : (
    <ArrowDown className="size-3.5" aria-hidden="true" />
  )
}

function compareValues(
  a: DemandeListItem,
  b: DemandeListItem,
  column: SortColumn,
): number {
  switch (column) {
    case 'numeroDemande':
      return a.numeroDemande.localeCompare(b.numeroDemande)
    case 'module':
      return a.module.localeCompare(b.module)
    case 'numeroCNSS':
      return a.numeroCNSS.localeCompare(b.numeroCNSS)
    case 'statut':
      return a.statut.localeCompare(b.statut)
    case 'dateCreation':
      return (
        new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime()
      )
    default:
      return 0
  }
}

export function DemandeTable({
  demandes,
  onViewDetail,
  onValider,
  onRejeter,
  isActionPending = false,
  selectedId,
  readonly = false,
}: DemandeTableProps) {
  const showValidationActions = !readonly && onValider && onRejeter
  const [sortColumn, setSortColumn] = useState<SortColumn>('dateCreation')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortedDemandes = useMemo(() => {
    const copy = [...demandes]
    copy.sort((a, b) => {
      const result = compareValues(a, b, sortColumn)
      return sortDirection === 'asc' ? result : -result
    })
    return copy
  }, [demandes, sortColumn, sortDirection])

  const toggleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortColumn(column)
    setSortDirection('asc')
  }

  const headerButtonClass =
    'inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-cnss-800 transition-colors'

  if (demandes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        Aucune demande dans cette file d&apos;attente.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left">
              <button
                type="button"
                className={headerButtonClass}
                onClick={() => toggleSort('numeroDemande')}
              >
                Numéro
                <SortIcon
                  column="numeroDemande"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </button>
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              <button
                type="button"
                className={headerButtonClass}
                onClick={() => toggleSort('module')}
              >
                Module
                <SortIcon
                  column="module"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </button>
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              <button
                type="button"
                className={headerButtonClass}
                onClick={() => toggleSort('numeroCNSS')}
              >
                CNSS
                <SortIcon
                  column="numeroCNSS"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </button>
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              <button
                type="button"
                className={headerButtonClass}
                onClick={() => toggleSort('statut')}
              >
                Statut
                <SortIcon
                  column="statut"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </button>
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              <button
                type="button"
                className={headerButtonClass}
                onClick={() => toggleSort('dateCreation')}
              >
                Date dépôt
                <SortIcon
                  column="dateCreation"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </button>
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {sortedDemandes.map((demande) => (
            <tr
              key={demande.id}
              className={cn(
                'transition-colors duration-150',
                selectedId === demande.id ? 'bg-cnss-50/60' : 'hover:bg-slate-50',
              )}
            >
              <td className="whitespace-nowrap px-4 py-3 font-medium text-cnss-900">
                {demande.numeroDemande}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                {MODULE_LABELS[demande.module]}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                {demande.numeroCNSS}
              </td>
              <td className="px-4 py-3">
                <BadgeStatutDemande statut={demande.statut} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {formatDate(demande.dateCreation)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(demande)}
                    aria-label={`Voir le détail de ${demande.numeroDemande}`}
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    Détail
                  </Button>
                  {showValidationActions ? (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        disabled={isActionPending}
                        onClick={() => onValider(demande)}
                      >
                        <Check className="size-4" aria-hidden="true" />
                        Valider
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={isActionPending}
                        onClick={() => onRejeter(demande)}
                      >
                        <X className="size-4" aria-hidden="true" />
                        Rejeter
                      </Button>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
