import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Building2, CheckCircle2 } from 'lucide-react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui'
import { getApiErrorMessage } from '@/api/types'
import { Stepper } from '@/components/domain/Stepper'
import {
  cnssEmployeurStepSchema,
  ifuEmailStepSchema,
  ifuStepSchema,
  type CnssEmployeurStepValues,
  type IfuEmailStepValues,
  type IfuStepValues,
} from '@/features/demandes/schemas'
import {
  useDepotIfu,
  useVerifierIfuDgi,
  useVerifyEmployeurCnss,
} from '@/features/demandes/hooks'
import { maskEmail } from '@/lib/maskEmail'

const STEPS = [
  { id: 'cnss', label: 'CNSS' },
  { id: 'ifu', label: 'IFU' },
  { id: 'email', label: 'Courriel' },
  { id: 'confirmation', label: 'Confirmation' },
] as const

export function FormulaireDepotIfu() {
  const [currentStep, setCurrentStep] = useState(0)
  const [numeroCNSS, setNumeroCNSS] = useState('')
  const [raisonSocialeCnss, setRaisonSocialeCnss] = useState('')
  const [ifu, setIfu] = useState('')
  const [raisonSocialeDgi, setRaisonSocialeDgi] = useState('')
  const [numeroDemande, setNumeroDemande] = useState('')
  const [emailDepot, setEmailDepot] = useState('')

  const verifyCnss = useVerifyEmployeurCnss()
  const verifierIfu = useVerifierIfuDgi()
  const depotIfuMutation = useDepotIfu()

  const cnssForm = useForm<CnssEmployeurStepValues>({
    resolver: zodResolver(cnssEmployeurStepSchema),
    defaultValues: { numeroCNSS: '' },
  })

  const ifuForm = useForm<IfuStepValues>({
    resolver: zodResolver(ifuStepSchema),
    defaultValues: { ifu: '' },
  })

  const emailForm = useForm<IfuEmailStepValues>({
    resolver: zodResolver(ifuEmailStepSchema),
    defaultValues: { email: '', emailConfirmation: '' },
  })

  const onCnssSubmit = (values: CnssEmployeurStepValues) => {
    verifyCnss.mutate(values.numeroCNSS, {
      onSuccess: (data) => {
        setNumeroCNSS(values.numeroCNSS)
        setRaisonSocialeCnss(data.raisonSociale ?? '')
        setCurrentStep(1)
      },
    })
  }

  const onIfuSubmit = (values: IfuStepValues) => {
    verifierIfu.mutate(values.ifu, {
      onSuccess: (data) => {
        setIfu(data.ifu)
        setRaisonSocialeDgi(data.raisonSociale)
        setCurrentStep(2)
      },
    })
  }

  const onEmailSubmit = (values: IfuEmailStepValues) => {
    depotIfuMutation.mutate(
      {
        numeroCNSS,
        ifu,
        email: values.email,
        emailConfirmation: values.emailConfirmation,
      },
      {
        onSuccess: (data) => {
          setNumeroDemande(data.numeroDemande)
          setEmailDepot(values.email)
          setCurrentStep(3)
        },
      },
    )
  }

  const cnssError = verifyCnss.isError
    ? getApiErrorMessage(
        verifyCnss.error,
        'Impossible de vérifier le numéro CNSS. Veuillez réessayer.',
      )
    : null

  const ifuError = verifierIfu.isError
    ? getApiErrorMessage(
        verifierIfu.error,
        'Impossible de vérifier l\'IFU auprès de la DGI. Veuillez réessayer.',
      )
    : null

  const depotError = depotIfuMutation.isError
    ? getApiErrorMessage(
        depotIfuMutation.error,
        'Impossible d\'enregistrer votre demande. Veuillez réessayer.',
      )
    : null

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <Stepper steps={[...STEPS]} currentStep={currentStep} />

      {currentStep === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-cnss-700" aria-hidden="true" />
              Vérification CNSS
            </CardTitle>
            <CardDescription>
              Saisissez votre numéro CNSS employeur pour confirmer votre inscription
              au référentiel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cnssError ? (
              <Alert variant="error" className="mb-4">
                {cnssError}
              </Alert>
            ) : null}

            <form
              onSubmit={cnssForm.handleSubmit(onCnssSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="numeroCNSS" required>
                  Numéro CNSS
                </Label>
                <Input
                  id="numeroCNSS"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Ex. 1000123456"
                  hasError={Boolean(cnssForm.formState.errors.numeroCNSS)}
                  {...cnssForm.register('numeroCNSS')}
                />
                {cnssForm.formState.errors.numeroCNSS ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {cnssForm.formState.errors.numeroCNSS.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-full sm:w-auto"
                isLoading={verifyCnss.isPending}
              >
                Vérifier mon numéro
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Identifiant IFU</CardTitle>
            <CardDescription>
              Employeur identifié :{' '}
              <span className="font-medium text-cnss-800">{raisonSocialeCnss}</span>{' '}
              (CNSS {numeroCNSS})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ifuError ? (
              <Alert variant="error" className="mb-4">
                {ifuError}
              </Alert>
            ) : null}

            <form
              onSubmit={ifuForm.handleSubmit(onIfuSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="ifu" required>
                  Numéro IFU (13 chiffres)
                </Label>
                <Input
                  id="ifu"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="3202512345678"
                  maxLength={13}
                  hasError={Boolean(ifuForm.formState.errors.ifu)}
                  {...ifuForm.register('ifu')}
                />
                {ifuForm.formState.errors.ifu ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {ifuForm.formState.errors.ifu.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setCurrentStep(0)}
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  isLoading={verifierIfu.isPending}
                >
                  Vérifier l&apos;IFU
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Adresse courriel</CardTitle>
            <CardDescription>
              IFU validé — raison sociale DGI :{' '}
              <span className="font-medium text-cnss-800">{raisonSocialeDgi}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="info" className="mb-4">
              IFU <strong>{ifu}</strong> reconnu par la DGI.
            </Alert>

            {depotError ? (
              <Alert variant="error" className="mb-4">
                {depotError}
              </Alert>
            ) : null}

            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="email" required>
                  Adresse courriel
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  hasError={Boolean(emailForm.formState.errors.email)}
                  {...emailForm.register('email')}
                />
                {emailForm.formState.errors.email ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {emailForm.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emailConfirmation" required>
                  Confirmation du courriel
                </Label>
                <Input
                  id="emailConfirmation"
                  type="email"
                  autoComplete="email"
                  hasError={Boolean(emailForm.formState.errors.emailConfirmation)}
                  {...emailForm.register('emailConfirmation')}
                />
                {emailForm.formState.errors.emailConfirmation ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {emailForm.formState.errors.emailConfirmation.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setCurrentStep(1)}
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  isLoading={depotIfuMutation.isPending}
                >
                  Déposer ma demande
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 3 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center py-4 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-statut-validee/15 text-statut-validee">
                <CheckCircle2 className="size-8" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-cnss-900">
                Demande enregistrée
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                Votre demande de mise à jour IFU a été déposée avec succès.
                Conservez votre numéro de dossier pour le suivi.
              </p>

              <Alert variant="info" className="mt-4 max-w-md text-left">
                Un courriel de confirmation a été envoyé à l&apos;adresse{' '}
                <strong>{maskEmail(emailDepot)}</strong>.
              </Alert>

              <div className="mt-6 w-full max-w-sm rounded-lg border border-cnss-300/40 bg-cnss-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Numéro de demande
                </p>
                <p className="mt-1 break-all font-display text-base font-bold text-cnss-800 sm:text-lg">
                  {numeroDemande}
                </p>
              </div>

              <dl className="mt-6 w-full max-w-sm space-y-3 text-left text-sm">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                  <dt className="shrink-0 text-slate-500">Raison sociale DGI</dt>
                  <dd className="break-words font-medium text-cnss-900 sm:text-right">
                    {raisonSocialeDgi}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                  <dt className="shrink-0 text-slate-500">IFU</dt>
                  <dd className="break-all font-medium text-cnss-900 sm:text-right">
                    {ifu}
                  </dd>
                </div>
              </dl>

              <Link
                to={`/suivi?numero=${encodeURIComponent(numeroDemande)}`}
                className="mt-6 inline-flex h-11 w-full max-w-sm items-center justify-center rounded-lg bg-cnss-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cnss-800 sm:h-10 sm:w-auto"
              >
                Suivre ma demande
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
