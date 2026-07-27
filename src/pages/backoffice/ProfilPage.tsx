import { useState, type ClipboardEvent, type DragEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CalendarDays,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Layers,
  Lock,
} from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from "@/components/ui";
import { getApiErrorMessage } from "@/api/types";
import {
  FlashFeedback,
  useFlashFeedback,
} from "@/components/domain/FlashFeedback";
import { MODULE_AFFECTE_LABELS, ROLE_LABELS } from "@/features/admin/types";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/auth/schemas";
import type { UserProfile } from "@/api/auth";
import { useProfile, useUpdatePassword } from "@/features/auth/hooks";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/cn";

function PasswordField({
  id,
  label,
  show,
  onToggle,
  error,
  autoComplete,
  registration,
}: {
  id: string;
  label: string;
  show: boolean;
  onToggle: () => void;
  error?: string;
  autoComplete: string;
  registration: ReturnType<
    ReturnType<typeof useForm<ChangePasswordFormValues>>["register"]
  >;
}) {
  const blockPasswordClipboard = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const blockPasswordDrop = (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} required>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className="pr-11"
          hasError={Boolean(error)}
          {...registration}
          onPaste={blockPasswordClipboard}
          onCopy={blockPasswordClipboard}
          onCut={blockPasswordClipboard}
          onDrop={blockPasswordDrop}
          onDragOver={(event) => event.preventDefault()}
          onContextMenu={(event) => event.preventDefault()}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label={
            show
              ? `Masquer ${label.toLowerCase()}`
              : `Afficher ${label.toLowerCase()}`
          }
        >
          {show ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-statut-rejetee" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ProfileHero({ profile }: { profile: UserProfile }) {
  const initials =
    `${profile.prenom.charAt(0)}${profile.nom.charAt(0)}`.toUpperCase();

  return (
    <Card className="overflow-hidden border-cnss-100">
      <div className="relative bg-gradient-to-br from-cnss-700 via-cnss-800 to-cnss-900 px-6 py-8 text-white sm:px-8">
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/3 size-48 rounded-full bg-cnss-400/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "flex size-16 shrink-0 items-center justify-center rounded-2xl",
                "border border-white/20 bg-white/10 font-display text-xl font-bold backdrop-blur-sm",
              )}
              aria-hidden="true"
            >
              {initials}
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                {profile.prenom} {profile.nom}
              </h2>
              <p className="mt-1 text-sm text-cnss-100">
                @{profile.identifiant}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="info"
              className="border-white/20 bg-white/15 text-white"
            >
              {ROLE_LABELS[profile.role]}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="grid gap-4 border-t border-cnss-100 bg-cnss-50/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <Layers
            className="size-4 shrink-0 text-cnss-600"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs text-slate-500">Module affecté</p>
            <p className="text-sm font-medium text-cnss-900">
              {MODULE_AFFECTE_LABELS[profile.moduleAffecte]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <Building2
            className="size-4 shrink-0 text-cnss-600"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Direction</p>
            <p className="truncate text-sm font-medium text-cnss-900">
              {profile.directionNom} ({profile.directionAbreviation})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm sm:col-span-2 lg:col-span-1">
          <Clock3
            className="size-4 shrink-0 text-cnss-600"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs text-slate-500">Dernière connexion</p>
            <p className="text-sm font-medium text-cnss-900">
              {profile.dtLastLogin
                ? formatDate(profile.dtLastLogin)
                : "Aucune connexion enregistrée"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm sm:col-span-2 lg:col-span-3">
          <CalendarDays
            className="size-4 shrink-0 text-cnss-600"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs text-slate-500">Compte créé le</p>
            <p className="text-sm font-medium text-cnss-900">
              {formatDate(profile.dtCreation)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    feedback: successFeedback,
    setFeedback: setSuccessFeedback,
    clearFeedback: clearSuccessFeedback,
  } = useFlashFeedback();
  const updatePassword = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      ancienMotDePasse: "",
      nouveauMotDePasse: "",
      confirmationMotDePasse: "",
    },
  });

  const apiError = updatePassword.isError
    ? getApiErrorMessage(
        updatePassword.error,
        "Impossible de modifier le mot de passe. Veuillez réessayer.",
      )
    : null;

  const onSubmit = (values: ChangePasswordFormValues) => {
    clearSuccessFeedback();
    updatePassword.mutate(
      {
        motDePasseActuel: values.ancienMotDePasse,
        nouveauMotDePasse: values.nouveauMotDePasse,
        confirmationMotDePasse: values.confirmationMotDePasse,
      },
      {
        onSuccess: () => {
          reset();
          setSuccessFeedback({
            variant: "success",
            message: "Votre mot de passe a été mis à jour avec succès.",
          });
        },
      },
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cnss-50 text-cnss-700">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Sécurité du compte</CardTitle>
            <CardDescription>
              Modifiez votre mot de passe pour protéger l&apos;accès à votre
              espace.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <Alert variant="info">
          Minimum 12 caractères et au moins 3 types parmi : majuscules,
          minuscules, chiffres et caractères spéciaux.
        </Alert>

        <FlashFeedback
          feedback={successFeedback}
          onDismiss={clearSuccessFeedback}
        />

        {apiError ? <Alert variant="error">{apiError}</Alert> : null}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <PasswordField
            id="ancienMotDePasse"
            label="Mot de passe actuel"
            show={showCurrentPassword}
            onToggle={() => setShowCurrentPassword((value) => !value)}
            error={errors.ancienMotDePasse?.message}
            autoComplete="current-password"
            registration={register("ancienMotDePasse")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField
              id="nouveauMotDePasse"
              label="Nouveau mot de passe"
              show={showNewPassword}
              onToggle={() => setShowNewPassword((value) => !value)}
              error={errors.nouveauMotDePasse?.message}
              autoComplete="new-password"
              registration={register("nouveauMotDePasse")}
            />
            <PasswordField
              id="confirmationMotDePasse"
              label="Confirmer le mot de passe"
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
              error={errors.confirmationMotDePasse?.message}
              autoComplete="new-password"
              registration={register("confirmationMotDePasse")}
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button type="submit" isLoading={updatePassword.isPending}>
              <Lock className="size-4" aria-hidden="true" />
              Mettre à jour le mot de passe
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ProfilPage() {
  const profileQuery = useProfile();

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <Alert variant="error">
        {getApiErrorMessage(
          profileQuery.error,
          "Impossible de charger votre profil. Veuillez réessayer.",
        )}
      </Alert>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cnss-900">
          Mon profil
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Consultez vos informations et gérez la sécurité de votre compte.
        </p>
      </div>

      <ProfileHero profile={profile} />

      <ChangePasswordForm />
    </div>
  );
}
