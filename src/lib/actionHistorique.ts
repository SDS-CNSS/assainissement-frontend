import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
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
      label: 'Validation N1',
      icon: CheckCircle2,
      tone: 'success',
    },
    REJET_N1: {
      label: 'Rejet N1',
      icon: XCircle,
      tone: 'danger',
    },
    VALIDATION_N2: {
      label: 'Validation définitive N2',
      icon: CheckCircle2,
      tone: 'success',
    },
    REJET_N2: {
      label: 'Rejet N2 — retour N1',
      icon: ArrowLeftRight,
      tone: 'warning',
    },
  }

export function getActionHistoriqueMeta(
  action: ActionHistorique,
): ActionHistoriqueMeta {
  return ACTION_HISTORIQUE_MAP[action]
}
