import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useChangePassword, useLogout } from '@/features/auth/hooks'
import {
  firstChangePasswordSchema,
  type FirstChangePasswordFormValues,
} from '@/features/auth/schemas'

export function ChangePasswordPage() {
  const changePassword = useChangePassword()
  const logout = useLogout()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FirstChangePasswordFormValues>({
    resolver: zodResolver(firstChangePasswordSchema),
    defaultValues: {
      nouveauMotDePasse: '',
      confirmationMotDePasse: '',
    },
  })

  const onSubmit = (values: FirstChangePasswordFormValues) => {
    changePassword.mutate({
      nouveauMotDePasse: values.nouveauMotDePasse,
      confirmationMotDePasse: values.confirmationMotDePasse,
    })
  }

  const apiError = changePassword.isError
    ? getApiErrorMessage(
        changePassword.error,
        'Impossible de modifier le mot de passe. Veuillez réessayer.',
      )
    : null

  const isBusy = changePassword.isPending || logout.isPending

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Changement de mot de passe</CardTitle>
          <CardDescription>
            Pour des raisons de sécurité, vous devez définir un nouveau mot de passe
            lors de votre première connexion (RG-19).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="info" className="mb-4">
            Le mot de passe doit contenir au minimum 12 caractères et au moins 3 des
            4 types suivants : majuscules, minuscules, chiffres et caractères spéciaux.
          </Alert>

          {apiError ? (
            <Alert variant="error" className="mb-4">
              {apiError}
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="nouveauMotDePasse" required>
                Nouveau mot de passe
              </Label>
              <Input
                id="nouveauMotDePasse"
                type="password"
                autoComplete="new-password"
                hasError={Boolean(errors.nouveauMotDePasse)}
                disabled={isBusy}
                {...register('nouveauMotDePasse')}
              />
              {errors.nouveauMotDePasse ? (
                <p className="text-sm text-statut-rejetee" role="alert">
                  {errors.nouveauMotDePasse.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmationMotDePasse" required>
                Confirmer le nouveau mot de passe
              </Label>
              <Input
                id="confirmationMotDePasse"
                type="password"
                autoComplete="new-password"
                hasError={Boolean(errors.confirmationMotDePasse)}
                disabled={isBusy}
                {...register('confirmationMotDePasse')}
              />
              {errors.confirmationMotDePasse ? (
                <p className="text-sm text-statut-rejetee" role="alert">
                  {errors.confirmationMotDePasse.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <Button
                type="submit"
                className="w-full"
                isLoading={changePassword.isPending}
                disabled={isBusy}
              >
                Enregistrer le nouveau mot de passe
              </Button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => logout.mutate()}
                className="mx-auto text-sm text-slate-600 underline underline-offset-2 transition-colors hover:text-cnss-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logout.isPending ? 'Déconnexion…' : 'Annuler et se déconnecter'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
