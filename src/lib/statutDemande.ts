import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'

/** Statuts de demande — alignés sur l'enum backend (section 7 du cahier des charges). */
export type StatutDemande =
  | 'EN_ATTENTE_N1'
  | 'REJETEE_N1_EN_ATTENTE_N2'
  | 'EN_ATTENTE_N2'
  | 'REJETEE_N2_RETOUR_N1'
  | 'VALIDEE_DEFINITIVEMENT'

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
    label: 'En attente de validation N1',
    variant: 'enAttente',
    ...VARIANT_META.enAttente,
  },
  REJETEE_N1_EN_ATTENTE_N2: {
    label: 'Rejetée N1 — en attente N2',
    variant: 'enAttente',
    ...VARIANT_META.enAttente,
  },
  EN_ATTENTE_N2: {
    label: 'En attente de validation N2',
    variant: 'enAttente',
    ...VARIANT_META.enAttente,
  },
  REJETEE_N2_RETOUR_N1: {
    label: 'Rejetée N2 — retour N1',
    variant: 'rejetee',
    icon: ArrowLeftRight,
    badgeClassName: 'bg-statut-rejetee/15 text-red-800 border-statut-rejetee/30',
  },
  VALIDEE_DEFINITIVEMENT: {
    label: 'Validée définitivement',
    variant: 'validee',
    ...VARIANT_META.validee,
  },
}

export function getStatutDemandeMeta(statut: StatutDemande): StatutDemandeMeta {
  return STATUT_DEMANDE_MAP[statut]
}

export function isStatutDemande(value: string): value is StatutDemande {
  return value in STATUT_DEMANDE_MAP
}

/**
 * Index de progression pour le suivi public (Stepper).
 * 0 = Dépôt, 1 = En cours, 2 = Décision ; ≥ 3 = terminé.
 */
export function getSuiviProgressStep(statut: StatutDemande): number {
  switch (statut) {
    case 'VALIDEE_DEFINITIVEMENT':
      return 3
    case 'EN_ATTENTE_N1':
    case 'REJETEE_N2_RETOUR_N1':
    case 'EN_ATTENTE_N2':
    case 'REJETEE_N1_EN_ATTENTE_N2':
      return 1
  }
}
