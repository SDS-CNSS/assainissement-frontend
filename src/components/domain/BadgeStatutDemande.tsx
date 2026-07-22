import { Badge } from '@/components/ui'
import {
  getStatutDemandeMeta,
  type StatutDemande,
} from '@/lib/statutDemande'
import { cn } from '@/lib/cn'

export interface BadgeStatutDemandeProps {
  statut: StatutDemande
  className?: string
}

export function BadgeStatutDemande({
  statut,
  className,
}: BadgeStatutDemandeProps) {
  const meta = getStatutDemandeMeta(statut)
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
