import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Building2, CheckCircle2, Mail } from 'lucide-react'
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
import { ConfirmDialog } from '@/components/domain/ConfirmDialog'
import { Stepper } from '@/components/domain/Stepper'
import { noClipboardInputProps } from '@/lib/blockFieldClipboard'
import {
  cnssEmployeurStepSchema,
  ifuEmailStepSchema,
  ifuStepSchema,
  otpStepSchema,
  type CnssEmployeurStepValues,
  type IfuEmailStepValues,
  type IfuStepValues,
  type OtpStepValues,
} from '@/features/demandes/schemas'
import {
  useDemanderOtpIfu,
  useDepotIfu,
  useVerifierIfuDgi,
  useVerifierOtp,
  useVerifyEmployeurCnss,
} from '@/features/demandes/hooks'
import { maskEmail } from '@/lib/maskEmail'

const STEPS = [
  { id: 'cnss', label: 'CNSS' },
  { id: 'ifu', label: 'IFU' },
  { id: 'email', label: 'Courriel' },
  { id: 'otp', label: 'OTP' },
  { id: 'confirmation', label: 'Confirmation' },
] as const

export function FormulaireDepotIfu() {
  const [currentStep, setCurrentStep] = useState(0)
  const [numeroCNSS, setNumeroCNSS] = useState('')
  const [raisonSocialeCnss, setRaisonSocialeCnss] = useState('')
  const [ifu, setIfu] = useState('')
  const [raisonSocialeDgi, setRaisonSocialeDgi] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpEmailConfirmation, setOtpEmailConfirmation] = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [emailMasque, setEmailMasque] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [numeroDemande, setNumeroDemande] = useState('')
  const [emailDepot, setEmailDepot] = useState('')
  const [confirmDepotOpen, setConfirmDepotOpen] = useState(false)

  const verifyCnss = useVerifyEmployeurCnss()
  const verifierIfu = useVerifierIfuDgi()
  const demanderOtp = useDemanderOtpIfu()
  const verifierOtpMutation = useVerifierOtp()
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

  const otpForm = useForm<OtpStepValues>({
    resolver: zodResolver(otpStepSchema),
    defaultValues: { code: '' },
  })

  const onCnssSubmit = (values: CnssEmployeurStepValues) => {
    verifyCnss.mutate(values.numeroCNSS, {
      onSuccess: (data) => {
        // Conserver la saisie d'origine (CNSS ou APIEX) pour le dépôt / suivi.
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

  const sendOtp = (values: IfuEmailStepValues, goNext: boolean) => {
    demanderOtp.mutate(
      {
        numeroCNSS,
        ifu,
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

  const onEmailSubmit = (values: IfuEmailStepValues) => {
    sendOtp(values, true)
  }

  const onResendOtp = () => {
    sendOtp({ email: otpEmail, emailConfirmation: otpEmailConfirmation }, false)
  }

  const onOtpSubmit = (values: OtpStepValues) => {
    verifierOtpMutation.mutate(
      { sessionToken, code: values.code },
      {
        onSuccess: () => {
          setOtpCode(values.code)
          setConfirmDepotOpen(true)
        },
      },
    )
  }

  const confirmDepot = () => {
    depotIfuMutation.mutate(
      {
        sessionToken,
        otpCode,
      },
      {
        onSuccess: (data) => {
          setConfirmDepotOpen(false)
          setNumeroDemande(data.numeroDemande)
          setEmailDepot(otpEmail)
          setCurrentStep(4)
        },
        onError: () => {
          setConfirmDepotOpen(false)
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
        'Numéro IFU incorrect',
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
              Veuillez saisir votre numéro CNSS employeur.
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
              <span className="font-medium text-cnss-800">{raisonSocialeCnss}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={ifuForm.handleSubmit(onIfuSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="ifu" required>
                  Numéro IFU
                </Label>
                <Input
                  id="ifu"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="3202512345678"
                  maxLength={13}
                  hasError={Boolean(ifuForm.formState.errors.ifu || ifuError)}
                  {...ifuForm.register('ifu')}
                />
                {ifuForm.formState.errors.ifu ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {ifuForm.formState.errors.ifu.message}
                  </p>
                ) : ifuError ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {ifuError}
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
            <CardTitle>Courriel</CardTitle>
            <CardDescription>
              IFU validé — raison sociale DGI :{' '}
              <span className="font-medium text-cnss-800">{raisonSocialeDgi}</span>
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
                  Adresse électronique
                </Label>
                <Input
                  id="email"
                  type="email"
                  hasError={Boolean(emailForm.formState.errors.email)}
                  {...emailForm.register('email')}
                  {...noClipboardInputProps}
                />
                {emailForm.formState.errors.email ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {emailForm.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emailConfirmation" required>
                  Confirmation de l&apos;adresse électronique
                </Label>
                <Input
                  id="emailConfirmation"
                  type="email"
                  hasError={Boolean(emailForm.formState.errors.emailConfirmation)}
                  {...emailForm.register('emailConfirmation')}
                  {...noClipboardInputProps}
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
                  disabled={demanderOtp.isPending}
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  isLoading={demanderOtp.isPending}
                >
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
              Un code OTP a été envoyé à{' '}
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

            {depotError ? (
              <Alert variant="error" className="mb-4">
                {depotError}
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
                  inputMode="text"
                  autoComplete="one-time-code"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="A1B2C3"
                  maxLength={6}
                  className="uppercase tracking-widest"
                  hasError={Boolean(otpForm.formState.errors.code)}
                  {...otpForm.register('code', {
                    setValueAs: (value: string) => value.toUpperCase(),
                  })}
                />
                {otpForm.formState.errors.code ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {otpForm.formState.errors.code.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setCurrentStep(2)}
                  disabled={verifierOtpMutation.isPending}
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  isLoading={verifierOtpMutation.isPending}
                >
                  Vérifier le code
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={onResendOtp}
                  disabled={
                    demanderOtp.isPending ||
                    verifierOtpMutation.isPending ||
                    !otpEmail
                  }
                  isLoading={demanderOtp.isPending}
                >
                  Renvoyer le code
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 4 ? (
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

      <ConfirmDialog
        open={confirmDepotOpen}
        title="Confirmer le dépôt"
        message="Confirmez-vous le dépôt de votre demande de mise à jour IFU ? Un e-mail de confirmation vous sera envoyé à l'adresse vérifiée."
        confirmLabel="Déposer"
        cancelLabel="Annuler"
        isLoading={depotIfuMutation.isPending}
        onConfirm={confirmDepot}
        onCancel={() => {
          if (depotIfuMutation.isPending) return
          setConfirmDepotOpen(false)
        }}
      />
    </div>
  )
}
