import { useState, type ClipboardEvent, type DragEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
} from "@/components/ui";
import { getApiErrorMessage } from "@/api/types";
import { Eye, EyeOff } from "lucide-react";
import { useChangePassword, useLogout } from "@/features/auth/hooks";
import {
  firstChangePasswordSchema,
  type FirstChangePasswordFormValues,
} from "@/features/auth/schemas";
import { cn } from "@/lib/cn";

export function ChangePasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const changePassword = useChangePassword();
  const logout = useLogout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FirstChangePasswordFormValues>({
    resolver: zodResolver(firstChangePasswordSchema),
    defaultValues: {
      nouveauMotDePasse: "",
      confirmationMotDePasse: "",
    },
  });

  const onSubmit = (values: FirstChangePasswordFormValues) => {
    changePassword.mutate({
      nouveauMotDePasse: values.nouveauMotDePasse,
      confirmationMotDePasse: values.confirmationMotDePasse,
    });
  };

  const apiError = changePassword.isError
    ? getApiErrorMessage(
        changePassword.error,
        "Impossible de modifier le mot de passe. Veuillez réessayer.",
      )
    : null;

  const blockPasswordClipboard = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const blockPasswordDrop = (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const isBusy = changePassword.isPending || logout.isPending;

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Changement de mot de passe</CardTitle>
          <CardDescription>
            Pour des raisons de sécurité, vous devez définir un nouveau mot de
            passe lors de votre première connexion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="info" className="mb-4">
            Le mot de passe doit contenir au minimum 12 caractères et au moins 3
            des 4 types suivants : majuscules, minuscules, chiffres et
            caractères spéciaux.
          </Alert>

          {apiError ? (
            <Alert variant="error" className="mb-4">
              {apiError}
            </Alert>
          ) : null}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="nouveauMotDePasse" required>
                Nouveau mot de passe
              </Label>

              <div className="w-full relative">
                <Input
                  id="nouveauMotDePasse"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  className="pr-10"
                  hasError={Boolean(errors.nouveauMotDePasse)}
                  onPaste={blockPasswordClipboard}
                  onCopy={blockPasswordClipboard}
                  onCut={blockPasswordClipboard}
                  onDrop={blockPasswordDrop}
                  onDragOver={(event) => event.preventDefault()}
                  onContextMenu={(event) => event.preventDefault()}
                  disabled={isBusy}
                  {...register("nouveauMotDePasse")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className={cn(
                    "absolute right-2 top-1/2 flex -translate-y-1/2 size-8 items-center justify-center rounded-md text-slate-400 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cnss-400",
                  )}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              {errors.nouveauMotDePasse ? (
                <p className="text-sm text-statut-rejetee" role="alert">
                  {errors.nouveauMotDePasse.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5 relative">
              <Label htmlFor="confirmationMotDePasse" required>
                Confirmer le nouveau mot de passe
              </Label>

              <div className="w-full relative">
                <Input
                  id="confirmationMotDePasse"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  className="pr-10"
                  hasError={Boolean(errors.confirmationMotDePasse)}
                  onPaste={blockPasswordClipboard}
                  onCopy={blockPasswordClipboard}
                  onCut={blockPasswordClipboard}
                  onDrop={blockPasswordDrop}
                  onDragOver={(event) => event.preventDefault()}
                  onContextMenu={(event) => event.preventDefault()}
                  disabled={isBusy}
                  {...register("confirmationMotDePasse")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className={cn(
                    "absolute right-2 top-1/2 flex -translate-y-1/2 size-8 items-center justify-center rounded-md text-slate-400 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cnss-400",
                  )}
                  aria-label={
                    showConfirmPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>

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
                {logout.isPending
                  ? "Déconnexion…"
                  : "Annuler et se déconnecter"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
