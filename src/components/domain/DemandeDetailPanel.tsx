import {
  Building2,
  CalendarDays,
  Hash,
  History,
  IdCard,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BadgeStatutDemande } from '@/components/domain/BadgeStatutDemande'
import { FormSection, SideDrawer } from '@/components/domain/FormSideDrawer'
import { Button, Skeleton } from '@/components/ui'
import { useDemandeDetail } from '@/features/validation/hooks'
import {
  MODULE_LABELS,
  type DemandeDetail,
} from '@/features/validation/types'
import { formatDate } from '@/lib/formatDate'
import { cn } from '@/lib/cn'

export interface DemandeDetailPanelProps {
  demandeId: string | null
  open: boolean
  onClose: () => void
  historiqueHref?: string
}

export function DemandeDetailPanel({
  demandeId,
  open,
  onClose,
  historiqueHref,
}: DemandeDetailPanelProps) {
  const detailQuery = useDemandeDetail(open ? demandeId : null)
  const demande = detailQuery.data

  return (
    <SideDrawer
      open={open}
      title="Détail de la demande"
      description={
        demande?.numeroDemande
          ? `Référence ${demande.numeroDemande}`
          : detailQuery.isLoading
            ? 'Chargement des informations…'
            : undefined
      }
      titleId="demande-detail-title"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {historiqueHref ? (
            <Link
              to={historiqueHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-cnss-700 bg-white px-4 text-sm font-medium text-cnss-700 transition-colors duration-200 hover:bg-cnss-50"
            >
              <History className="size-4" aria-hidden="true" />
              Voir l&apos;historique
            </Link>
          ) : null}
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      }
    >
      {detailQuery.isLoading ? <DetailSkeleton /> : null}

      {detailQuery.isError ? (
        <p className="rounded-xl border border-statut-rejetee/30 bg-red-50 px-4 py-3 text-sm text-statut-rejetee" role="alert">
          Impossible de charger le détail de cette demande.
        </p>
      ) : null}

      {demande ? <DemandeDetailContent demande={demande} /> : null}
    </SideDrawer>
  )
}

function DemandeDetailContent({ demande }: { demande: DemandeDetail }) {
  const isEmployeur = demande.module === 'EMPLOYEUR'
  const isTravailleur = demande.module === 'TRAVAILLEUR'
  const identiteAnip =
    demande.prenomAnip || demande.nomAnip
      ? [demande.prenomAnip, demande.nomAnip].filter(Boolean).join(' ')
      : null

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cnss-100 bg-gradient-to-br from-cnss-50 via-white to-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-lg font-semibold tracking-tight text-cnss-900">
              {demande.numeroDemande}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {MODULE_LABELS[demande.module]}
            </p>
          </div>
          <BadgeStatutDemande statut={demande.statut} />
        </div>
      </div>

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
          <DetailItem
            label="E-mail de contact"
            value={demande.email}
            icon={Mail}
            className="sm:col-span-2"
          />
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

function DetailSkeleton() {
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
