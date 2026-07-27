import { useState, type ClipboardEvent, type DragEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, UserRound } from "lucide-react";
import { Alert, Button, Input, Label } from "@/components/ui";
import { getApiErrorMessage } from "@/api/types";
import { useLogin } from "@/features/auth/hooks";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import cnssLogo from "@/images/logo.png";
import { cn } from "@/lib/cn";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const sessionMessage = searchParams.get("message");
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifiant: "",
      motDePasse: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values);
  };

  const blockPasswordClipboard = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const blockPasswordDrop = (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const apiError = login.isError
    ? getApiErrorMessage(login.error, "Identifiant ou mot de passe incorrect.")
    : null;

  return (
    <div className="flex min-h-svh bg-white">
      <aside className="relative hidden w-[44%] overflow-hidden bg-gradient-to-br from-cnss-900 via-cnss-800 to-cnss-700 lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,163,240,0.22),transparent_55%)]"
          aria-hidden="true"
        />

        <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-12">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center bg-white p-1.5 shadow-md shadow-black/20">
              <img
                src={cnssLogo}
                alt="Logo CNSS"
                className="size-full object-contain"
              />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-white">
                CNSS — ASSAINISSEMENT
              </p>
              <p className="text-sm text-cnss-100/75">Back office</p>
            </div>
          </div>

          <div className="max-w-xl">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white xl:text-[2.75rem]">
              Mise à jour IFU &amp; NPI
            </h1>
            <p className="mt-4 text-base leading-relaxed text-cnss-100/80">
              Espace agents pour la validation et le suivi des demandes.
            </p>
          </div>

          <p className="text-xs text-cnss-100/50">
            © {new Date().getFullYear()} CNSS — Bénin
          </p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:border-none lg:px-10 lg:pt-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white p-1">
              <img
                src={cnssLogo}
                alt="Logo CNSS"
                className="size-full object-contain"
              />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-cnss-900">
                CNSS
              </p>
              <p className="text-xs text-slate-500">Back office</p>
            </div>
          </div>

          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-cnss-700"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Portail public
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-[420px]">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold tracking-tight text-cnss-900 sm:text-3xl">
                Connexion
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Identifiez-vous pour accéder à votre espace de validation et
                d&apos;administration.
              </p>
            </div>

            {sessionMessage ? (
              <Alert variant="warning" title="Session expirée" className="mb-5">
                {sessionMessage}
              </Alert>
            ) : null}

            {apiError ? (
              <Alert variant="error" className="mb-5">
                {apiError}
              </Alert>
            ) : null}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="identifiant" required>
                  Identifiant
                </Label>
                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="identifiant"
                    autoComplete="username"
                    placeholder="ex. agent.n1"
                    className="h-11 pl-10"
                    hasError={Boolean(errors.identifiant)}
                    {...register("identifiant")}
                  />
                </div>
                {errors.identifiant ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {errors.identifiant.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motDePasse" required>
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
              
                  <Input
                    id="motDePasse"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="h-11 pl-10 pr-11"
                    hasError={Boolean(errors.motDePasse)}
                    onPaste={blockPasswordClipboard}
                    onCopy={blockPasswordClipboard}
                    onCut={blockPasswordClipboard}
                    onDrop={blockPasswordDrop}
                    onDragOver={(event) => event.preventDefault()}
                    onContextMenu={(event) => event.preventDefault()}
                    {...register("motDePasse")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className={cn(
                      "absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors",
                      "hover:bg-slate-100 hover:text-slate-600",
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
                {errors.motDePasse ? (
                  <p className="text-sm text-statut-rejetee" role="alert">
                    {errors.motDePasse.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full shadow-sm shadow-cnss-700/20"
                isLoading={login.isPending}
              >
                Se connecter
              </Button>
            </form>

            <p className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Lock
                className="size-3.5 shrink-0 text-cnss-500"
                aria-hidden="true"
              />
              Connexion chiffrée — accès réservé au personnel CNSS
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
