import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { CheckCircle2, IdCard, Mail, Users } from 'lucide-react'
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
  cnssTravailleurStepSchema,
  npiEmailStepSchema,
  npiStepSchema,
  otpStepSchema,
  type CnssTravailleurStepValues,
  type NpiEmailStepValues,
  type NpiStepValues,
  type OtpStepValues,
} from '@/features/demandes/schemas'
import {
  useDemanderOtpNpi,
  useDeposerNpi,
  useVerifierNpiAnip,
  useVerifierOtp,
  useVerifyTravailleurCnss,
} from '@/features/demandes/hooks'

const STEPS = [
  { id: 'cnss', label: 'CNSS' },
  { id: 'npi', label: 'NPI' },
  { id: 'email', label: 'E-mail' },
  { id: 'otp', label: 'OTP' },
  { id: 'recap', label: 'Récapitulatif' },
  { id: 'confirmation', label: 'Confirmation' },
] as const

interface AnipIdentite {
  npi: string
  nom: string
  prenom: string
  telephoneMasque?: string
}

export function FormulaireDepotNpi() {
  const [currentStep, setCurrentStep] = useState(0)
  const [cnssVerified, setCnssVerified] = useState(false)
  const [numeroCNSS, setNumeroCNSS] = useState('')
  const [npi, setNpi] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpEmailConfirmation, setOtpEmailConfirmation] = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [emailMasque, setEmailMasque] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [anipIdentite, setAnipIdentite] = useState<AnipIdentite | null>(null)
  const [useSameEmail, setUseSameEmail] = useState<boolean | null>(null)
  const [numeroDemande, setNumeroDemande] = useState('')

  const verifyCnss = useVerifyTravailleurCnss()
  const verifierNpi = useVerifierNpiAnip()
  const demanderOtp = useDemanderOtpNpi()
  const verifierOtpMutation = useVerifierOtp()
  const deposerNpiMutation = useDeposerNpi()

  const cnssForm = useForm<CnssTravailleurStepValues>({
    resolver: zodResolver(cnssTravailleurStepSchema),
    defaultValues: { numeroCNSS: '' },
  })

  const npiForm = useForm<NpiStepValues>({
    resolver: zodResolver(npiStepSchema),
    defaultValues: { npi: '' },
  })

  const emailForm = useForm<NpiEmailStepValues>({
    resolver: zodResolver(npiEmailStepSchema),
    defaultValues: { email: '', emailConfirmation: '' },
  })

  const otpForm = useForm<OtpStepValues>({
    resolver: zodResolver(otpStepSchema),
    defaultValues: { code: '' },
  })

  const finalEmailForm = useForm<NpiEmailStepValues>({
    resolver: zodResolver(npiEmailStepSchema),
    defaultValues: { email: '', emailConfirmation: '' },
  })

  const finishDepot = (email: string, emailConfirmation: string) => {
    deposerNpiMutation.mutate(
      {
        sessionToken,
        otpCode,
        email,
        emailConfirmation,
      },
      {
        onSuccess: (data) => {
          setNumeroDemande(data.numeroDemande)
          setCurrentStep(5)
        },
      },
    )
  }

  const onCnssSubmit = (values: CnssTravailleurStepValues) => {
    verifyCnss.mutate(values.numeroCNSS, {
      onSuccess: () => {
        setNumeroCNSS(values.numeroCNSS)
        setCnssVerified(true)
      },
    })
  }

  const onNpiSubmit = (values: NpiStepValues) => {
    verifierNpi.mutate(
      { numeroCNSS, npi: values.npi },
      {
        onSuccess: () => {
          setNpi(values.npi)
          setCurrentStep(2)
        },
      },
    )
  }

  const sendOtp = (values: NpiEmailStepValues, goNext: boolean) => {
    demanderOtp.mutate(
      {
        numeroCNSS,
        npi,
        email: values.email,
        emailConfirmation: values.emailConfirmation,
      },
      {
        onSuccess: (data) => {
          setOtpEmail(values.email)
          setOtpEmailConfirmation(values.emailConfirmation)
          setSessionToken(data.sessionToken)
          setEmailMasque(data.emailMasque)
          otpForm.reset({ code: '' })
          if (goNext) {
            setCurrentStep(3)
          }
        },
      },
    )
  }

  const onEmailSubmit = (values: NpiEmailStepValues) => {
    sendOtp(values, true)
  }

  const onResendOtp = () => {
    sendOtp({ email: otpEmail, emailConfirmation: otpEmailConfirmation }, false)
  }

  const onOtpSubmit = (values: OtpStepValues) => {
    verifierOtpMutation.mutate(
      { sessionToken, code: values.code },
      {
        onSuccess: (data) => {
          setOtpCode(values.code)
          setAnipIdentite({
            npi: data.npi ?? npi,
            nom: data.nom ?? '',
            prenom: data.prenom ?? '',
            telephoneMasque: data.telephoneMasque,
          })
          setUseSameEmail(null)
          finalEmailForm.reset({ email: '', emailConfirmation: '' })
          setCurrentStep(4)
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

  const npiError = verifierNpi.isError
    ? getApiErrorMessage(
        verifierNpi.error,
        'Impossible de vérifier le NPI auprès de l\'ANIP. Veuillez réessayer.',
      )
    : null

  const otpRequestError = demanderOtp.isError
    ? getApiErrorMessage(
        demanderOtp.error,
        'Impossible d\'envoyer le code OTP. Veuillez réessayer.',
      )
    : null

  const otpVerifyError = verifierOtpMutation.isError
    ? getApiErrorMessage(
        verifierOtpMutation.error,
        'Code OTP incorrect ou expiré. Veuillez réessayer.',
      )
    : null

  const depotError = deposerNpiMutation.isError
    ? getApiErrorMessage(
        deposerNpiMutation.error,
        'Impossible d\'enregistrer votre demande. Veuillez réessayer.',
      )
    : null

  return (
    <div className="space-y-8">
      <Stepper steps={[...STEPS]} currentStep={currentStep} />

      {currentStep === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-cnss-700" aria-hidden="true" />
              Vérification CNSS
            </CardTitle>
            <CardDescription>
              Saisissez votre numéro CNSS travailleur pour confirmer votre inscription
              au référentiel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cnssError ? (
              <Alert variant="error" className="mb-4">
                {cnssError}
              </Alert>
            ) : null}

            {cnssVerified ? (
              <div className="space-y-4">
                <Alert variant="success">
                  Votre numéro CNSS est correct. Vous pouvez poursuivre.
                </Alert>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCnssVerified(false)
                      setNumeroCNSS('')
                      cnssForm.reset({ numeroCNSS: '' })
                    }}
                  >
                    Modifier
                  </Button>
                  <Button type="button" onClick={() => setCurrentStep(1)}>
                    Continuer
                  </Button>
                </div>
              </div>
            ) : (
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
                    placeholder="Ex. 2000111222"
                    hasError={Boolean(cnssForm.formState.errors.numeroCNSS)}
                    {...cnssForm.register('numeroCNSS')}
                  />
                  {cnssForm.formState.errors.numeroCNSS ? (
                    <p className="text-sm text-statut-rejetee" role="alert">
                      {cnssForm.formState.errors.numeroCNSS.message}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" isLoading={verifyCnss.isPending}>
                  Vérifier mon numéro
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Numéro NPI</CardTitle>
            <CardDescription>
              Saisissez votre NPI pour vérification auprès de l&apos;ANIP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {npiError ? (
              <Alert variant="error" className="mb-4">
                {npiError}
              </Alert>
            ) : null}

            <form
              onSubmit={npiForm.handleSubmit(onNpiSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="npi" required>
                  Numéro NPI (16 chiffres)
                </Label>
                <Input
                  id="npi"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1234567890123456"
                  maxLength={16}
                  hasError={Boolean(npiForm.formState.errors.npi)}
                  {...npiForm.register('npi')}
                />
                {npiForm.formState.errors.npi ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {npiForm.formState.errors.npi.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                >
                  Retour
                </Button>
                <Button type="submit" isLoading={verifierNpi.isPending}>
                  Vérifier le NPI
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5 text-cnss-700" aria-hidden="true" />
              Adresse e-mail
            </CardTitle>
            <CardDescription>
              Un code de vérification sera envoyé à cette adresse.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {otpRequestError ? (
              <Alert variant="error" className="mb-4">
                {otpRequestError}
              </Alert>
            ) : null}

            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="email" required>
                  Adresse e-mail
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
                  Confirmation de l&apos;e-mail
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

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Retour
                </Button>
                <Button type="submit" isLoading={demanderOtp.isPending}>
                  Envoyer le code
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5 text-cnss-700" aria-hidden="true" />
              Vérification OTP
            </CardTitle>
            <CardDescription>
              Un code à 6 chiffres a été envoyé à{' '}
              <span className="font-medium text-cnss-800">{emailMasque}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="info" className="mb-4">
              Le code est valable 5 minutes. Après 3 tentatives incorrectes, vous
              devrez relancer la demande.
            </Alert>

            {otpRequestError ? (
              <Alert variant="error" className="mb-4">
                {otpRequestError}
              </Alert>
            ) : null}

            {otpVerifyError ? (
              <Alert variant="error" className="mb-4">
                {otpVerifyError}
              </Alert>
            ) : null}

            <form
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="code" required>
                  Code OTP
                </Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  hasError={Boolean(otpForm.formState.errors.code)}
                  {...otpForm.register('code')}
                />
                {otpForm.formState.errors.code ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {otpForm.formState.errors.code.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  disabled={verifierOtpMutation.isPending}
                >
                  Retour
                </Button>
                <Button type="submit" isLoading={verifierOtpMutation.isPending}>
                  Vérifier le code
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onResendOtp}
                  disabled={demanderOtp.isPending || verifierOtpMutation.isPending || !otpEmail}
                  isLoading={demanderOtp.isPending}
                >
                  Renvoyer le code
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 4 && anipIdentite ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="size-5 text-cnss-700" aria-hidden="true" />
              Identité ANIP
            </CardTitle>
            <CardDescription>
              Vos informations ont été récupérées auprès de l&apos;ANIP. Confirmez
              l&apos;adresse e-mail de la demande.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid gap-3 rounded-xl border border-cnss-100 bg-cnss-50/60 p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nom
                </dt>
                <dd className="mt-1 text-sm font-medium text-cnss-900">
                  {anipIdentite.nom}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Prénom
                </dt>
                <dd className="mt-1 text-sm font-medium text-cnss-900">
                  {anipIdentite.prenom}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  NPI
                </dt>
                <dd className="mt-1 font-mono text-sm font-medium text-cnss-900">
                  {anipIdentite.npi}
                </dd>
              </div>
              {anipIdentite.telephoneMasque ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Téléphone
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-cnss-900">
                    {anipIdentite.telephoneMasque}
                  </dd>
                </div>
              ) : null}
            </dl>

            {depotError ? <Alert variant="error">{depotError}</Alert> : null}

            {useSameEmail === null ? (
              <div className="space-y-4">
                <Alert variant="info">
                  Souhaitez-vous utiliser l&apos;adresse{' '}
                  <strong>{emailMasque}</strong> (celle du code OTP) pour recevoir
                  les notifications de cette demande ?
                </Alert>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => finishDepot(otpEmail, otpEmailConfirmation)}
                    isLoading={deposerNpiMutation.isPending}
                  >
                    Oui, utiliser cette adresse
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUseSameEmail(false)}
                    disabled={deposerNpiMutation.isPending}
                  >
                    Non, en saisir une autre
                  </Button>
                </div>
              </div>
            ) : null}

            {useSameEmail === false ? (
              <form
                onSubmit={finalEmailForm.handleSubmit((values) =>
                  finishDepot(values.email, values.emailConfirmation),
                )}
                className="space-y-4"
                noValidate
              >
                <p className="text-sm text-slate-600">
                  Saisissez l&apos;adresse e-mail à utiliser pour les notifications
                  de dépôt et de décision.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="finalEmail" required>
                    Adresse e-mail
                  </Label>
                  <Input
                    id="finalEmail"
                    type="email"
                    autoComplete="email"
                    hasError={Boolean(finalEmailForm.formState.errors.email)}
                    {...finalEmailForm.register('email')}
                  />
                  {finalEmailForm.formState.errors.email ? (
                    <p className="text-sm text-statut-rejetee" role="alert">
                      {finalEmailForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="finalEmailConfirmation" required>
                    Confirmation de l&apos;e-mail
                  </Label>
                  <Input
                    id="finalEmailConfirmation"
                    type="email"
                    autoComplete="email"
                    hasError={Boolean(
                      finalEmailForm.formState.errors.emailConfirmation,
                    )}
                    {...finalEmailForm.register('emailConfirmation')}
                  />
                  {finalEmailForm.formState.errors.emailConfirmation ? (
                    <p className="text-sm text-statut-rejetee" role="alert">
                      {finalEmailForm.formState.errors.emailConfirmation.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUseSameEmail(null)}
                    disabled={deposerNpiMutation.isPending}
                  >
                    Retour
                  </Button>
                  <Button type="submit" isLoading={deposerNpiMutation.isPending}>
                    Déposer ma demande
                  </Button>
                </div>
              </form>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 5 ? (
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
                Votre demande d&apos;assainissement NPI a été déposée avec succès.
                Conservez votre numéro de dossier pour le suivi.
              </p>

              <div className="mt-6 w-full max-w-sm rounded-lg border border-cnss-300/40 bg-cnss-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Numéro de demande
                </p>
                <p className="mt-1 font-display text-lg font-bold text-cnss-800">
                  {numeroDemande}
                </p>
              </div>

              {anipIdentite ? (
                <dl className="mt-6 w-full max-w-sm space-y-2 text-left text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Identité</dt>
                    <dd className="font-medium text-cnss-900">
                      {anipIdentite.prenom} {anipIdentite.nom}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">NPI</dt>
                    <dd className="font-medium text-cnss-900">{anipIdentite.npi}</dd>
                  </div>
                </dl>
              ) : null}

              <Link
                to={`/suivi?numero=${encodeURIComponent(numeroDemande)}`}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-cnss-700 px-4 text-sm font-medium text-white transition-colors hover:bg-cnss-800"
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
