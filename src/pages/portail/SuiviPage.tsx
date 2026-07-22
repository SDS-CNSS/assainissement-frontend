import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'react-router-dom'
import {
  Building2,
  CalendarClock,
  FileSearch,
  Hash,
  IdCard,
  Mail,
  Search,
  UserRound,
} from 'lucide-react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Skeleton,
} from '@/components/ui'
import { getApiErrorMessage } from '@/api/types'
import { BadgeStatutDemande } from '@/components/domain/BadgeStatutDemande'
import { Stepper } from '@/components/domain/Stepper'
import { useSuiviDemande } from '@/features/demandes/hooks'
import {
  suiviSchema,
  type SuiviFormValues,
} from '@/features/demandes/schemas'
import { MODULE_LABELS } from '@/features/validation/types'
import {
  getStatutDemandeMeta,
  getSuiviProgressStep,
} from '@/lib/statutDemande'
import { cn } from '@/lib/cn'

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(isoDate))
}

const SUIVI_STEPS = [
  { id: 'depot', label: 'Dépôt' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'decision', label: 'Décision' },
] as const

function InfoTile({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Hash
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-100 bg-slate-50/80 p-4',
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <dt className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </dt>
      </div>
      <dd className="text-sm font-medium text-cnss-900">{value}</dd>
    </div>
  )
}

export function SuiviPage() {
  const [searchParams] = useSearchParams()
  const [submittedNumero, setSubmittedNumero] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SuiviFormValues>({
    resolver: zodResolver(suiviSchema),
    defaultValues: { numeroDemande: '' },
  })

  const suiviQuery = useSuiviDemande(submittedNumero)

  useEffect(() => {
    const numeroFromUrl = searchParams.get('numero')
    if (numeroFromUrl) {
      setValue('numeroDemande', numeroFromUrl)
      setSubmittedNumero(numeroFromUrl)
    }
  }, [searchParams, setValue])

  const onSubmit = (values: SuiviFormValues) => {
    setSubmittedNumero(values.numeroDemande)
  }

  const apiError =
    suiviQuery.isError && submittedNumero
      ? getApiErrorMessage(
          suiviQuery.error,
          'Aucune demande trouvée pour ce numéro.',
        )
      : null

  const result = suiviQuery.data
  const statutMeta = result ? getStatutDemandeMeta(result.statut) : null
  const StatutIcon = statutMeta?.icon

  return (
    <div className="bg-gradient-to-b from-cnss-50/80 via-slate-50 to-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-cnss-900 via-cnss-800 to-cnss-700 text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,163,240,0.28),transparent_55%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-cnss-400/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
            <FileSearch className="size-4 text-cnss-300" aria-hidden="true" />
            Portail public
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Suivi de demande
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-cnss-100/90">
            Entrez le numéro reçu lors du dépôt pour consulter l&apos;avancement
            de votre dossier auprès de la CNSS.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-14 max-w-2xl px-4 pb-14 sm:-mt-16 sm:px-6 sm:pb-20">
        <Card className="mb-8 border-cnss-100/80 shadow-lg shadow-cnss-900/5">
          <CardContent className="p-6 sm:p-7">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="numeroDemande" required>
                  Numéro de demande
                </Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="numeroDemande"
                      placeholder="DEM-2026-000001"
                      autoComplete="off"
                      hasError={Boolean(errors.numeroDemande)}
                      className="h-12 pl-10 font-mono text-[15px] tracking-wide"
                      {...register('numeroDemande')}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full shrink-0 sm:w-auto"
                    isLoading={suiviQuery.isFetching}
                  >
                    Rechercher
                  </Button>
                </div>
                {errors.numeroDemande ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {errors.numeroDemande.message}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Format attendu&nbsp;: DEM-AAAA-NNNNNN
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {!submittedNumero ? (
          <div className="rounded-2xl border border-dashed border-cnss-200 bg-white/60 px-6 py-10 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-cnss-100 text-cnss-700">
              <Hash className="size-5" aria-hidden="true" />
            </div>
            <p className="font-display text-base font-semibold text-cnss-900">
              Aucune recherche en cours
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-600">
              Votre numéro figure sur l&apos;e-mail de confirmation envoyé après
              le dépôt de la demande.
            </p>
          </div>
        ) : null}

        {submittedNumero && suiviQuery.isFetching ? (
          <Card className="overflow-hidden">
            <div className="h-1.5 animate-pulse bg-gradient-to-r from-cnss-700 via-cnss-400 to-cnss-700" />
            <CardContent className="space-y-5 pt-6">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-40" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {apiError ? <Alert variant="error">{apiError}</Alert> : null}

        {result && statutMeta && StatutIcon ? (
          <div className="animate-fade-up space-y-5">
            <Card className="overflow-hidden border-cnss-100/80">
              <div
                className={cn(
                  'border-b px-6 py-5 sm:px-7',
                  statutMeta.variant === 'validee' &&
                    'border-statut-validee/20 bg-statut-validee/10',
                  statutMeta.variant === 'rejetee' &&
                    'border-statut-rejetee/20 bg-statut-rejetee/10',
                  statutMeta.variant === 'enAttente' &&
                    'border-statut-enAttente/20 bg-statut-enAttente/10',
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Numéro de suivi
                    </p>
                    <p className="mt-1 font-mono text-xl font-bold tracking-wide text-cnss-900 sm:text-2xl">
                      {result.numeroDemande}
                    </p>
                    <p className="mt-1.5 text-sm text-slate-600">
                      {MODULE_LABELS[result.module]}
                    </p>
                  </div>
                  <BadgeStatutDemande statut={result.statut} />
                </div>
              </div>

              <CardContent className="space-y-8 p-6 sm:p-7">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <StatutIcon
                      className="size-4 text-cnss-700"
                      aria-hidden="true"
                    />
                    <h2 className="font-display text-sm font-semibold text-cnss-900">
                      Avancement du dossier
                    </h2>
                  </div>
                  <Stepper
                    steps={[...SUIVI_STEPS]}
                    currentStep={getSuiviProgressStep(result.statut)}
                    className="px-1"
                  />
                </div>

                <div>
                  <h2 className="mb-3 font-display text-sm font-semibold text-cnss-900">
                    Informations du dossier
                  </h2>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <InfoTile
                      icon={IdCard}
                      label="Numéro CNSS"
                      value={result.numeroCNSS}
                    />
                    <InfoTile
                      icon={Mail}
                      label="E-mail"
                      value={result.emailMasque}
                    />
                    <InfoTile
                      icon={CalendarClock}
                      label="Date de dépôt"
                      value={formatDate(result.dateCreation)}
                    />
                    <InfoTile
                      icon={CalendarClock}
                      label="Dernière mise à jour"
                      value={formatDate(result.dateMajStatut)}
                    />
                    {result.raisonSocialeCNSS ? (
                      <InfoTile
                        icon={Building2}
                        label="Raison sociale CNSS"
                        value={result.raisonSocialeCNSS}
                        className="sm:col-span-2"
                      />
                    ) : null}
                    {result.ifu ? (
                      <InfoTile icon={Hash} label="IFU" value={result.ifu} />
                    ) : null}
                    {result.raisonSocialeDGI ? (
                      <InfoTile
                        icon={Building2}
                        label="Raison sociale DGI"
                        value={result.raisonSocialeDGI}
                      />
                    ) : null}
                    {result.npi ? (
                      <InfoTile icon={Hash} label="NPI" value={result.npi} />
                    ) : null}
                    {result.nomAnip && result.prenomAnip ? (
                      <InfoTile
                        icon={UserRound}
                        label="Identité ANIP"
                        value={`${result.prenomAnip} ${result.nomAnip}`}
                        className="sm:col-span-2"
                      />
                    ) : null}
                  </dl>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-slate-500">
              Les informations affichées sont masquées pour protéger vos données
              personnelles.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
