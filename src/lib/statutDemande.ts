import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'

/** Statuts de demande — alignés sur l'enum backend. */
export type StatutDemande =
  | 'EN_ATTENTE_N1'
  | 'REJETEE_N1_EN_ATTENTE_N2'
  | 'EN_ATTENTE_N2'
  | 'EN_ATTENTE_SUPERVISEUR'
  | 'VALIDEE_DEFINITIVEMENT'
  | 'REJETEE_DEFINITIVEMENT'

export type StatutVariant = 'enAttente' | 'rejetee' | 'validee'

export interface StatutDemandeMeta {
  label: string
  variant: StatutVariant
  /** Classes Tailwind pour le badge (fond + texte). */
  badgeClassName: string
  icon: LucideIcon
}

const VARIANT_META: Record<
  StatutVariant,
  Pick<StatutDemandeMeta, 'badgeClassName' | 'icon'>
> = {
  enAttente: {
    badgeClassName: 'bg-statut-enAttente/15 text-amber-800 border-statut-enAttente/30',
    icon: Clock,
  },
  rejetee: {
    badgeClassName: 'bg-statut-rejetee/15 text-red-800 border-statut-rejetee/30',
    icon: XCircle,
  },
  validee: {
    badgeClassName: 'bg-statut-validee/15 text-emerald-800 border-statut-validee/30',
    icon: CheckCircle2,
  },
}

/** Mapping unique statut → libellé / couleur / icône (RG portail + back office). */
export const STATUT_DEMANDE_MAP: Record<StatutDemande, StatutDemandeMeta> = {
  EN_ATTENTE_N1: {
    label: 'En attente Agent 1',
    variant: 'enAttente',
    ...VARIANT_META.enAttente,
  },
  REJETEE_N1_EN_ATTENTE_N2: {
    label: 'Rejetée Agent 1 — en attente Agent 2',
    variant: 'enAttente',
    ...VARIANT_META.enAttente,
  },
  EN_ATTENTE_N2: {
    label: 'En attente Agent 2',
    variant: 'enAttente',
    ...VARIANT_META.enAttente,
  },
  EN_ATTENTE_SUPERVISEUR: {
    label: 'En attente Contrôleur',
    variant: 'enAttente',
    ...VARIANT_META.enAttente,
  },
  VALIDEE_DEFINITIVEMENT: {
    label: 'Validée définitivement',
    variant: 'validee',
    ...VARIANT_META.validee,
  },
  REJETEE_DEFINITIVEMENT: {
    label: 'Rejetée définitivement',
    variant: 'rejetee',
    ...VARIANT_META.rejetee,
  },
}

export function getStatutDemandeMeta(
  statut: StatutDemande,
  options?: { compact?: boolean },
): StatutDemandeMeta {
  const meta = STATUT_DEMANDE_MAP[statut]
  // Files Agent 1 / Agent 2 / Superviseur : libellé court « En attente ».
  if (options?.compact && meta.variant === 'enAttente') {
    return { ...meta, label: 'En attente' }
  }
  return meta
}

export function isStatutDemande(value: string): value is StatutDemande {
  return value in STATUT_DEMANDE_MAP
}

export function isStatutFinal(statut: StatutDemande): boolean {
  return (
    statut === 'VALIDEE_DEFINITIVEMENT' || statut === 'REJETEE_DEFINITIVEMENT'
  )
}

/**
 * Libellés usager pour le portail de suivi public :
 * « En attente » → « En cours » (dès décision Agent 1) → « Validée » / « Rejetée ».
 */
export function getStatutSuiviPublicMeta(statut: StatutDemande): StatutDemandeMeta {
  if (statut === 'VALIDEE_DEFINITIVEMENT') {
    return {
      label: 'Validée',
      variant: 'validee',
      ...VARIANT_META.validee,
    }
  }
  if (statut === 'REJETEE_DEFINITIVEMENT') {
    return {
      label: 'Rejetée',
      variant: 'rejetee',
      ...VARIANT_META.rejetee,
    }
  }
  // Dès validation ou rejet Agent 1, le dossier est en instruction.
  if (statut !== 'EN_ATTENTE_N1') {
    return {
      label: 'En cours',
      variant: 'enAttente',
      ...VARIANT_META.enAttente,
    }
  }
  return {
    label: 'En attente',
    variant: 'enAttente',
    ...VARIANT_META.enAttente,
  }
}

/**
 * Index de progression pour le suivi public (Stepper).
 * 0 = Dépôt, 1 = En cours, 2 = Décision ; ≥ 3 = terminé.
 */
export function getSuiviProgressStep(statut: StatutDemande): number {
  switch (statut) {
    case 'VALIDEE_DEFINITIVEMENT':
    case 'REJETEE_DEFINITIVEMENT':
      return 3
    case 'EN_ATTENTE_N2':
    case 'REJETEE_N1_EN_ATTENTE_N2':
    case 'EN_ATTENTE_SUPERVISEUR':
      return 1
    case 'EN_ATTENTE_N1':
      return 0
  }
}
