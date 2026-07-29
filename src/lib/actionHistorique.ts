import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  FilePlus,
  XCircle,
} from 'lucide-react'

/** Actions historique — alignées sur l'enum backend ActionHistorique. */
export type ActionHistorique =
  | 'DEPOT'
  | 'VALIDATION_N1'
  | 'REJET_N1'
  | 'VALIDATION_N2'
  | 'REJET_N2'
  | 'VALIDATION_SUPERVISEUR'
  | 'REJET_SUPERVISEUR'

export interface ActionHistoriqueMeta {
  label: string
  icon: LucideIcon
  tone: 'neutral' | 'success' | 'danger' | 'warning'
}

export const ACTION_HISTORIQUE_MAP: Record<ActionHistorique, ActionHistoriqueMeta> =
  {
    DEPOT: {
      label: 'Dépôt de la demande',
      icon: FilePlus,
      tone: 'neutral',
    },
    VALIDATION_N1: {
      label: 'Validation Agent 1',
      icon: CheckCircle2,
      tone: 'success',
    },
    REJET_N1: {
      label: 'Rejet Agent 1',
      icon: XCircle,
      tone: 'danger',
    },
    VALIDATION_N2: {
      label: 'Validation Agent 2',
      icon: CheckCircle2,
      tone: 'success',
    },
    REJET_N2: {
      label: 'Rejet Agent 2',
      icon: XCircle,
      tone: 'danger',
    },
    VALIDATION_SUPERVISEUR: {
      label: 'Validation définitive Contrôleur',
      icon: CheckCircle2,
      tone: 'success',
    },
    REJET_SUPERVISEUR: {
      label: 'Rejet définitif Contrôleur',
      icon: XCircle,
      tone: 'danger',
    },
  }

export function getActionHistoriqueMeta(
  action: ActionHistorique,
): ActionHistoriqueMeta {
  return ACTION_HISTORIQUE_MAP[action]
}
