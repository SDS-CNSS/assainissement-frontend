import {
  Building2,
  CalendarDays,
  Hash,
  IdCard,
  Phone,
  UserRound,
} from 'lucide-react'
import { FormSection } from '@/components/domain/FormSideDrawer'
import { Skeleton } from '@/components/ui'
import type { DemandeDetail } from '@/features/validation/types'
import { formatDate } from '@/lib/formatDate'
import { cn } from '@/lib/cn'

/** Contenu détaillé d'une demande (UC-05–14) — réutilisé hors drawer. */
export function DemandeDetailContent({ demande }: { demande: DemandeDetail }) {
  const isEmployeur = demande.module === 'EMPLOYEUR'
  const isTravailleur = demande.module === 'TRAVAILLEUR'
  const identiteAnip =
    demande.prenomAnip || demande.nomAnip
      ? [demande.prenomAnip, demande.nomAnip].filter(Boolean).join(' ')
      : null

  return (
    <div className="space-y-6">
      <FormSection
        title="Identification CNSS"
        description="Références liées au compte assuré ou employeur"
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Numéro CNSS"
            value={demande.numeroCNSS}
            icon={Hash}
          />
          {demande.numeroApiex ? (
            <DetailItem
              label="Numéro APIEX"
              value={demande.numeroApiex}
              icon={Hash}
            />
          ) : null}
          {demande.raisonSocialeCNSS ? (
            <DetailItem
              label="Raison sociale CNSS"
              value={demande.raisonSocialeCNSS}
              icon={Building2}
              className="sm:col-span-2"
            />
          ) : null}
        </dl>
      </FormSection>

      {isEmployeur ? (
        <FormSection
          title="Données DGI (IFU)"
          description="Informations issues de la vérification DGI"
        >
          <dl className="grid gap-3 sm:grid-cols-2">
            {demande.ifu ? (
              <DetailItem label="IFU" value={demande.ifu} icon={IdCard} />
            ) : null}
            {demande.raisonSocialeDGI ? (
              <DetailItem
                label="Raison sociale DGI"
                value={demande.raisonSocialeDGI}
                icon={Building2}
                className={demande.ifu ? undefined : 'sm:col-span-2'}
              />
            ) : null}
            {!demande.ifu && !demande.raisonSocialeDGI ? (
              <EmptySectionHint message="Aucune donnée DGI disponible pour cette demande." />
            ) : null}
          </dl>
        </FormSection>
      ) : null}

      {isTravailleur ? (
        <FormSection
          title="Données ANIP (NPI)"
          description="Identité et coordonnées issues de la vérification ANIP"
        >
          <dl className="grid gap-3 sm:grid-cols-2">
            {demande.npi ? (
              <DetailItem label="NPI" value={demande.npi} icon={IdCard} />
            ) : null}
            {identiteAnip ? (
              <DetailItem
                label="Identité ANIP"
                value={identiteAnip}
                icon={UserRound}
              />
            ) : null}
            {demande.telephoneAnip ? (
              <DetailItem
                label="Téléphone ANIP"
                value={demande.telephoneAnip}
                icon={Phone}
                className="sm:col-span-2"
              />
            ) : null}
            {!demande.npi && !identiteAnip && !demande.telephoneAnip ? (
              <EmptySectionHint message="Aucune donnée ANIP disponible pour cette demande." />
            ) : null}
          </dl>
        </FormSection>
      ) : null}

      <FormSection title="Dates" description="Suivi temporel de la demande">
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Date de dépôt"
            value={formatDate(demande.dateCreation)}
            icon={CalendarDays}
          />
          <DetailItem
            label="Dernière mise à jour"
            value={formatDate(demande.dateMajStatut)}
            icon={CalendarDays}
          />
        </dl>
      </FormSection>
    </div>
  )
}

export function DemandeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  )
}

function DetailItem({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string
  value: string
  icon?: typeof Hash
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200/70 bg-white px-3 py-2.5',
        className,
      )}
    >
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden="true" /> : null}
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-cnss-900">
        {value}
      </dd>
    </div>
  )
}

function EmptySectionHint({ message }: { message: string }) {
  return (
    <p className="sm:col-span-2 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-4 text-sm text-slate-500">
      {message}
    </p>
  )
}
