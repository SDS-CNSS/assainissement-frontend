import { Badge } from '@/components/ui'
import {
  getStatutDemandeMeta,
  getStatutSuiviPublicMeta,
  type StatutDemande,
} from '@/lib/statutDemande'
import { cn } from '@/lib/cn'

export interface BadgeStatutDemandeProps {
  statut: StatutDemande
  /** Portail suivi public : libellés simplifiés En attente / Terminée. */
  publicSuivi?: boolean
  /** Files Agent 1 / Agent 2 / Superviseur : « En attente » sans précision de niveau. */
  compact?: boolean
  className?: string
}

export function BadgeStatutDemande({
  statut,
  publicSuivi = false,
  compact = false,
  className,
}: BadgeStatutDemandeProps) {
  const meta = publicSuivi
    ? getStatutSuiviPublicMeta(statut)
    : getStatutDemandeMeta(statut, { compact })
  const Icon = meta.icon

  return (
    <Badge
      className={cn(
        'gap-1.5 px-3 py-1 text-sm font-medium',
        meta.badgeClassName,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </Badge>
  )
}
