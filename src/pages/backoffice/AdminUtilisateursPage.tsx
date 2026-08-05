import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Download,
  Eye,
  KeyRound,
  LockOpen,
  Pencil,
  Plus,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from '@/components/ui'
import { getApiErrorMessage } from '@/api/types'
import { ConfirmDialog } from '@/components/domain/ConfirmDialog'
import {
  FlashFeedback,
  useFlashFeedback,
} from '@/components/domain/FlashFeedback'
import { FormSection, FormSideDrawer, SideDrawer } from '@/components/domain/FormSideDrawer'
import { TablePagination } from '@/components/domain/TablePagination'
import {
  useCreateUtilisateur,
  useDeleteUtilisateur,
  useDeverrouillerUtilisateur,
  useDirectionOptions,
  useResetUtilisateurPassword,
  useSetUtilisateurStatut,
  useUpdateUtilisateur,
  useUtilisateursList,
} from '@/features/admin/hooks'
import { useAuthStore } from '@/features/auth/authStore'
import {
  utilisateurCreateSchema,
  utilisateurEditSchema,
  type UtilisateurCreateFormValues,
  type UtilisateurEditFormValues,
} from '@/features/admin/schemas'
import type {
  CreateUtilisateurResponse,
  Direction,
  UtilisateurListItem,
} from '@/features/admin/types'
import {
  MODULE_AFFECTE_LABELS,
  ROLE_LABELS,
} from '@/features/admin/types'
import { downloadConnectionInfoDocx } from '@/lib/downloadConnectionInfoDocx'
import { generateIdentifiantFromName } from '@/lib/generateIdentifiant'
import { formatDate } from '@/lib/formatDate'
import { DEFAULT_PAGE, PAGE_SIZE } from '@/lib/pagination'
import { cn } from '@/lib/cn'

type UtilisateurCommonFormValues = Pick<
  UtilisateurCreateFormValues,
  'nom' | 'prenom' | 'role' | 'moduleAffecte' | 'directionId'
>

function SelectField({
  id,
  label,
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cnss-400 focus-visible:ring-offset-1',
          error
            ? 'border-statut-rejetee'
            : 'border-slate-200 hover:border-slate-300',
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-statut-rejetee" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** UC-12 : gestion CRUD des utilisateurs internes. */
export function AdminUtilisateursPage() {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const utilisateursQuery = useUtilisateursList({ page, limit: PAGE_SIZE })
  const directionsQuery = useDirectionOptions()
  const createUtilisateur = useCreateUtilisateur()
  const updateUtilisateur = useUpdateUtilisateur()
  const deleteUtilisateur = useDeleteUtilisateur()
  const deverrouiller = useDeverrouillerUtilisateur()
  const resetPassword = useResetUtilisateurPassword()
  const setUtilisateurStatut = useSetUtilisateurStatut()
  const currentUser = useAuthStore((state) => state.user)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UtilisateurListItem | null>(null)
  const [detailTarget, setDetailTarget] = useState<UtilisateurListItem | null>(null)
  const [statutTarget, setStatutTarget] = useState<UtilisateurListItem | null>(null)
  const [resetTarget, setResetTarget] = useState<UtilisateurListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UtilisateurListItem | null>(null)
  const [credentialsResult, setCredentialsResult] =
    useState<CreateUtilisateurResponse | null>(null)
  const [credentialsContext, setCredentialsContext] = useState<
    'create' | 'reset' | null
  >(null)
  const [isDownloadingDoc, setIsDownloadingDoc] = useState(false)
  const { feedback, setFeedback, clearFeedback } = useFlashFeedback()

  const directions = directionsQuery.data ?? []

  const createForm = useForm<UtilisateurCreateFormValues>({
    resolver: zodResolver(utilisateurCreateSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      identifiant: '',
      role: 'AGENT_VALIDATION',
      moduleAffecte: 'EMPLOYEUR',
      directionId: '',
    },
  })

  const editForm = useForm<UtilisateurEditFormValues>({
    resolver: zodResolver(utilisateurEditSchema),
  })

  const openCreate = () => {
    createForm.reset({
      nom: '',
      prenom: '',
      identifiant: '',
      role: 'AGENT_VALIDATION',
      moduleAffecte: 'EMPLOYEUR',
      directionId: directions[0]?.id ?? '',
    })
    setCredentialsResult(null)
    setCredentialsContext(null)
    setCreateOpen(true)
  }

  const closeCreate = () => {
    setCreateOpen(false)
    setCredentialsResult(null)
    setCredentialsContext(null)
  }

  const closeCredentialsDrawer = () => {
    setCredentialsResult(null)
    setCredentialsContext(null)
    setCreateOpen(false)
  }

  const openEdit = (utilisateur: UtilisateurListItem) => {
    editForm.reset({
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      identifiant: utilisateur.identifiant,
      role: utilisateur.role,
      moduleAffecte: utilisateur.moduleAffecte,
      directionId: utilisateur.directionId,
    })
    setEditTarget(utilisateur)
  }

  const handleCreate = createForm.handleSubmit(async (values) => {
    try {
      const identifiant =
        values.identifiant.trim() ||
        generateIdentifiantFromName(values.prenom, values.nom)

      const result = await createUtilisateur.mutateAsync({
        ...values,
        nom: values.nom.trim(),
        prenom: values.prenom.trim(),
        identifiant,
        moduleAffecte:
          values.role === 'SUPERVISEUR' ? null : values.moduleAffecte ?? null,
      })
      setCredentialsResult(result)
      setCredentialsContext('create')
      setFeedback({
        variant: 'success',
        message: 'Utilisateur créé avec succès.',
      })
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'La création de l\'utilisateur a échoué.',
        ),
      })
    }
  })

  const handleDownloadCredentials = async () => {
    if (!credentialsResult) return

    setIsDownloadingDoc(true)
    try {
      await downloadConnectionInfoDocx({
        nom: credentialsResult.utilisateur.nom,
        prenom: credentialsResult.utilisateur.prenom,
        login: credentialsResult.utilisateur.identifiant,
        password: credentialsResult.motDePasseTemporaire,
        structure: credentialsResult.utilisateur.directionNom,
      })
    } catch {
      setFeedback({
        variant: 'error',
        message: 'Impossible de générer le document Word. Réessayez.',
      })
    } finally {
      setIsDownloadingDoc(false)
    }
  }
  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editTarget) return

    try {
      const identifiant =
        values.identifiant.trim() ||
        generateIdentifiantFromName(values.prenom, values.nom)

      await updateUtilisateur.mutateAsync({
        id: editTarget.id,
        payload: {
          ...values,
          nom: values.nom.trim(),
          prenom: values.prenom.trim(),
          identifiant,
          moduleAffecte:
            values.role === 'SUPERVISEUR' ? null : values.moduleAffecte ?? null,
        },
      })
      setEditTarget(null)
      setFeedback({
        variant: 'success',
        message: `Utilisateur ${identifiant} mis à jour.`,
      })
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'La mise à jour de l\'utilisateur a échoué.',
        ),
      })
    }
  })

  const handleDeverrouiller = async (utilisateur: UtilisateurListItem) => {
    try {
      await deverrouiller.mutateAsync(utilisateur.id)
      setFeedback({
        variant: 'success',
        message: `Compte ${utilisateur.identifiant} déverrouillé.`,
      })
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(error, 'Le déverrouillage a échoué.'),
      })
    }
  }

  const handleConfirmResetPassword = async () => {
    if (!resetTarget) return

    try {
      const result = await resetPassword.mutateAsync(resetTarget.id)
      setResetTarget(null)
      setCredentialsResult(result)
      setCredentialsContext('reset')
      setFeedback({
        variant: 'success',
        message: `Mot de passe de ${result.utilisateur.identifiant} réinitialisé.`,
      })
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'La réinitialisation du mot de passe a échoué.',
        ),
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteUtilisateur.mutateAsync(deleteTarget.id)
      setFeedback({
        variant: 'success',
        message: `Compte ${deleteTarget.identifiant} supprimé.`,
      })
      setDeleteTarget(null)
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'La suppression de l\'utilisateur a échoué.',
        ),
      })
    }
  }

  const handleConfirmStatut = async () => {
    if (!statutTarget) return

    const nextIsActive = !statutTarget.isActive

    try {
      await setUtilisateurStatut.mutateAsync({
        id: statutTarget.id,
        payload: { isActive: nextIsActive },
      })
      setStatutTarget(null)
      setFeedback({
        variant: 'success',
        message: nextIsActive
          ? `Compte ${statutTarget.identifiant} activé.`
          : `Compte ${statutTarget.identifiant} désactivé.`,
      })
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'La modification du statut du compte a échoué.',
        ),
      })
    }
  }

  const listError =
    utilisateursQuery.isError
      ? getApiErrorMessage(
          utilisateursQuery.error,
          'Impossible de charger la liste des utilisateurs.',
        )
      : null

  const sortedUtilisateurs = useMemo(
    () =>
      [...(utilisateursQuery.data?.items ?? [])].sort((a, b) =>
        a.identifiant.localeCompare(b.identifiant),
      ),
    [utilisateursQuery.data?.items],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-cnss-900">
            Gestion des utilisateurs
          </h2>
          <p className="mt-1 text-slate-600">
            Administrez les comptes agents CNSS, leurs rôles, directions et accès
            au back office d'assainissement.
          </p>
        </div>
        <Button onClick={openCreate} disabled={directions.length === 0}>
          <Plus className="size-4" aria-hidden="true" />
          Nouvel utilisateur
        </Button>
      </div>

      <FlashFeedback feedback={feedback} onDismiss={clearFeedback} />

      {listError ? <Alert variant="error">{listError}</Alert> : null}

      {directionsQuery.isSuccess && directions.length === 0 ? (
        <Alert variant="warning">
          Créez au moins une direction avant d&apos;ajouter un utilisateur.
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>
            Liste des utilisateurs
            {utilisateursQuery.data
              ? ` (${utilisateursQuery.data.total})`
              : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {utilisateursQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : sortedUtilisateurs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Aucun utilisateur enregistré.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Identifiant
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Rôle
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Direction
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedUtilisateurs.map((utilisateur) => (
                    <tr key={utilisateur.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-cnss-900">
                        {utilisateur.identifiant}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {utilisateur.prenom} {utilisateur.nom}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {ROLE_LABELS[utilisateur.role]}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {utilisateur.directionAbreviation}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant={utilisateur.isActive ? 'success' : 'outline'}>
                            {utilisateur.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                          {utilisateur.isVerrouille ? (
                            <Badge variant="warning">Verrouillé</Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-10 px-0"
                            aria-label={`Voir les détails de ${utilisateur.identifiant}`}
                            onClick={() => setDetailTarget(utilisateur)}
                          >
                            <Eye className="size-5" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-10 px-0"
                            aria-label={`Modifier ${utilisateur.identifiant}`}
                            onClick={() => openEdit(utilisateur)}
                          >
                            <Pencil className="size-5" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-10 px-0"
                            aria-label={`Réinitialiser le mot de passe de ${utilisateur.identifiant}`}
                            onClick={() => setResetTarget(utilisateur)}
                          >
                            <KeyRound className="size-5" aria-hidden="true" />
                          </Button>
                          {utilisateur.isActive ? (
                            currentUser?.id !== utilisateur.id ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-10 px-0 text-statut-rejetee hover:text-red-700"
                                aria-label={`Désactiver ${utilisateur.identifiant}`}
                                onClick={() => setStatutTarget(utilisateur)}
                              >
                                <UserX className="size-5" aria-hidden="true" />
                              </Button>
                            ) : null
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-10 px-0 text-statut-validee hover:text-emerald-700"
                              aria-label={`Activer ${utilisateur.identifiant}`}
                              onClick={() => setStatutTarget(utilisateur)}
                            >
                              <UserCheck className="size-5" aria-hidden="true" />
                            </Button>
                          )}
                          {utilisateur.isVerrouille ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-10 px-0 text-statut-enAttente hover:text-amber-700"
                              aria-label={`Déverrouiller ${utilisateur.identifiant}`}
                              isLoading={deverrouiller.isPending}
                              onClick={() => handleDeverrouiller(utilisateur)}
                            >
                              <LockOpen className="size-5" aria-hidden="true" />
                            </Button>
                          ) : null}
                          {currentUser?.id !== utilisateur.id ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-10 px-0 text-statut-rejetee hover:text-red-700"
                              aria-label={`Supprimer ${utilisateur.identifiant}`}
                              onClick={() => setDeleteTarget(utilisateur)}
                            >
                              <Trash2 className="size-5" aria-hidden="true" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {utilisateursQuery.data ? (
            <TablePagination
              page={page}
              total={utilisateursQuery.data.total}
              limit={utilisateursQuery.data.limit}
              itemLabel="utilisateur"
              isLoading={utilisateursQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </CardContent>
      </Card>

      {createOpen && credentialsContext !== 'create' ? (
        <FormSideDrawer
          open={createOpen}
          title="Nouvel utilisateur"
          description="Créez un compte agent CNSS avec identifiant, rôle et direction d'affectation."
          submitLabel="Créer l'utilisateur"
          isLoading={createUtilisateur.isPending}
          onClose={closeCreate}
          onSubmit={handleCreate}
        >
          <CreateFormFields form={createForm} directions={directions} />
        </FormSideDrawer>
      ) : null}

      {credentialsResult && credentialsContext ? (
        <SideDrawer
          open
          title={
            credentialsContext === 'create'
              ? 'Utilisateur créé'
              : 'Mot de passe réinitialisé'
          }
          description="Téléchargez le document d'informations de connexion pour le transmettre de manière sécurisée à l'utilisateur."
          onClose={closeCredentialsDrawer}
          footer={
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={closeCredentialsDrawer}
              >
                Fermer
              </Button>
              <Button
                type="button"
                isLoading={isDownloadingDoc}
                onClick={handleDownloadCredentials}
              >
                <Download className="size-4" aria-hidden="true" />
                Télécharger le document
              </Button>
            </div>
          }
        >
          <Alert variant="success">
            {credentialsContext === 'create'
              ? 'Le compte a été créé avec succès. Les identifiants de connexion figurent uniquement dans le document téléchargeable.'
              : 'Le mot de passe temporaire a été généré. Les nouveaux identifiants figurent uniquement dans le document téléchargeable. L\'utilisateur devra le changer à sa prochaine connexion.'}
          </Alert>
        </SideDrawer>
      ) : null}

      {editTarget ? (
        <FormSideDrawer
          open={Boolean(editTarget)}
          title={`Modifier ${editTarget.identifiant}`}
          description="Mettez à jour les informations et l'affectation du compte."
          submitLabel="Enregistrer"
          isLoading={updateUtilisateur.isPending}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        >
          <EditFormFields form={editForm} directions={directions} />
        </FormSideDrawer>
      ) : null}

      {detailTarget ? (
        <UtilisateurDetailDrawer
          utilisateur={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => {
            openEdit(detailTarget)
            setDetailTarget(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(statutTarget)}
        title={
          statutTarget?.isActive
            ? 'Désactiver le compte'
            : 'Activer le compte'
        }
        message={
          statutTarget
            ? statutTarget.isActive
              ? `Confirmez-vous la désactivation du compte ${statutTarget.identifiant} ? L'utilisateur ne pourra plus se connecter.`
              : `Confirmez-vous l'activation du compte ${statutTarget.identifiant} ?`
            : ''
        }
        confirmLabel={statutTarget?.isActive ? 'Désactiver' : 'Activer'}
        isLoading={setUtilisateurStatut.isPending}
        onCancel={() => setStatutTarget(null)}
        onConfirm={handleConfirmStatut}
      />

      <ConfirmDialog
        open={Boolean(resetTarget)}
        title="Réinitialiser le mot de passe"
        message={
          resetTarget
            ? `Confirmez-vous la réinitialisation du mot de passe de ${resetTarget.identifiant} ? Un mot de passe temporaire sera généré et l'utilisateur devra le changer à sa prochaine connexion.`
            : ''
        }
        confirmLabel="Réinitialiser"
        isLoading={resetPassword.isPending}
        onCancel={() => setResetTarget(null)}
        onConfirm={handleConfirmResetPassword}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer l'utilisateur"
        message={
          deleteTarget
            ? `Supprimer définitivement le compte ${deleteTarget.identifiant} ? Cette action est irréversible. L'historique et l'audit liés seront conservés.`
            : ''
        }
        confirmLabel="Supprimer"
        buttonType="danger"
        isLoading={deleteUtilisateur.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

function CreateFormFields({
  form,
  directions,
}: {
  form: UseFormReturn<UtilisateurCreateFormValues>
  directions: Direction[]
}) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form

  const prenom = useWatch({ control, name: 'prenom' })
  const nom = useWatch({ control, name: 'nom' })

  useEffect(() => {
    const generated = generateIdentifiantFromName(prenom ?? '', nom ?? '')
    setValue('identifiant', generated, { shouldValidate: Boolean(generated) })
  }, [nom, prenom, setValue])

  return (
    <div className="space-y-6">
      <FormSection
        title="Identité"
        description="Informations personnelles et identifiant de connexion."
      >
        <NameFields
          register={register as UseFormReturn<UtilisateurCommonFormValues>['register']}
          errors={errors}
        />
        <div className="space-y-1.5">
          <Label htmlFor="identifiant">Identifiant</Label>
          <Input
            id="identifiant"
            placeholder="ex. cdossou"
            hasError={Boolean(errors.identifiant)}
            {...register('identifiant')}
          />
          {errors.identifiant ? (
            <p className="text-xs text-statut-rejetee">{errors.identifiant.message}</p>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        title="Affectation"
        description="Rôle, périmètre métier et direction de rattachement."
      >
        <RoleModuleDirectionFields
          register={register as UseFormReturn<UtilisateurCommonFormValues>['register']}
          control={
            control as unknown as UseFormReturn<UtilisateurCommonFormValues>['control']
          }
          setValue={
            setValue as unknown as UseFormReturn<UtilisateurCommonFormValues>['setValue']
          }
          errors={errors}
          directions={directions}
        />
      </FormSection>
    </div>
  )
}

function EditFormFields({
  form,
  directions,
}: {
  form: UseFormReturn<UtilisateurEditFormValues>
  directions: Direction[]
}) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form

  const prenom = useWatch({ control, name: 'prenom' })
  const nom = useWatch({ control, name: 'nom' })

  useEffect(() => {
    const generated = generateIdentifiantFromName(prenom ?? '', nom ?? '')
    setValue('identifiant', generated, { shouldValidate: Boolean(generated) })
  }, [nom, prenom, setValue])

  return (
    <div className="space-y-6">
      <FormSection
        title="Identité"
        description="Informations personnelles et identifiant de connexion."
      >
        <NameFields
          register={register as UseFormReturn<UtilisateurCommonFormValues>['register']}
          errors={errors}
        />
        <div className="space-y-1.5">
          <Label htmlFor="edit-identifiant">Identifiant</Label>
          <Input
            id="edit-identifiant"
            placeholder="ex. cdossou"
            hasError={Boolean(errors.identifiant)}
            {...register('identifiant')}
          />
          {errors.identifiant ? (
            <p className="text-xs text-statut-rejetee">{errors.identifiant.message}</p>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        title="Affectation"
        description="Rôle, périmètre métier et direction de rattachement."
      >
        <RoleModuleDirectionFields
          register={register as UseFormReturn<UtilisateurCommonFormValues>['register']}
          control={
            control as unknown as UseFormReturn<UtilisateurCommonFormValues>['control']
          }
          setValue={
            setValue as unknown as UseFormReturn<UtilisateurCommonFormValues>['setValue']
          }
          errors={errors}
          directions={directions}
        />
      </FormSection>
    </div>
  )
}

function NameFields({
  register,
  errors,
}: {
  register: UseFormReturn<UtilisateurCommonFormValues>['register']
  errors: UseFormReturn<UtilisateurCommonFormValues>['formState']['errors']
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="prenom">Prénom</Label>
        <Input id="prenom" hasError={Boolean(errors.prenom)} {...register('prenom')} />
        {errors.prenom ? (
          <p className="text-xs text-statut-rejetee">{errors.prenom.message}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nom">Nom</Label>
        <Input id="nom" hasError={Boolean(errors.nom)} {...register('nom')} />
        {errors.nom ? (
          <p className="text-xs text-statut-rejetee">{errors.nom.message}</p>
        ) : null}
      </div>
    </div>
  )
}

function RoleModuleDirectionFields({
  register,
  control,
  setValue,
  errors,
  directions,
}: {
  register: UseFormReturn<UtilisateurCommonFormValues>['register']
  control: UseFormReturn<UtilisateurCommonFormValues>['control']
  setValue: UseFormReturn<UtilisateurCommonFormValues>['setValue']
  errors: UseFormReturn<UtilisateurCommonFormValues>['formState']['errors']
  directions: Direction[]
}) {
  const role = useWatch({ control, name: 'role' })
  const moduleAffecte = useWatch({ control, name: 'moduleAffecte' })
  const isSuperviseur = role === 'SUPERVISEUR'

  useEffect(() => {
    if (isSuperviseur) {
      if (moduleAffecte != null) {
        setValue('moduleAffecte', null, { shouldValidate: true })
      }
      return
    }

    if (!moduleAffecte) {
      setValue('moduleAffecte', 'EMPLOYEUR', { shouldValidate: true })
    }
  }, [isSuperviseur, moduleAffecte, setValue])

  return (
    <>
      <SelectField
        id="role"
        label="Rôle"
        error={errors.role?.message}
        {...register('role')}
      >
        <option value="AGENT_VALIDATION">Agent 1</option>
        <option value="CHEF_VALIDATION">Agent 2</option>
        <option value="CONTROLEUR">Contrôleur</option>
        <option value="SUPERVISEUR">Superviseur</option>
        <option value="ADMINISTRATEUR">Administrateur</option>
      </SelectField>

      {!isSuperviseur ? (
        <SelectField
          id="moduleAffecte"
          label="Module affecté"
          error={errors.moduleAffecte?.message}
          {...register('moduleAffecte')}
        >
          {Object.entries(MODULE_AFFECTE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
      ) : (
        <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Le superviseur n&apos;est pas associé à un module : accès au tableau de
          bord uniquement.
        </p>
      )}

      <SelectField
        id="directionId"
        label="Direction"
        error={errors.directionId?.message}
        {...register('directionId')}
      >
        <option value="">— Sélectionner —</option>
        {directions.map((direction) => (
          <option key={direction.id} value={direction.id}>
            {direction.abreviation} — {direction.nom}
          </option>
        ))}
      </SelectField>
    </>
  )
}

function UtilisateurDetailDrawer({
  utilisateur,
  onClose,
  onEdit,
}: {
  utilisateur: UtilisateurListItem
  onClose: () => void
  onEdit: () => void
}) {
  return (
    <SideDrawer
      open
      title="Détails de l'utilisateur"
      description={utilisateur.identifiant}
      titleId="utilisateur-detail-title"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={onEdit}>
            <Pencil className="size-4" aria-hidden="true" />
            Modifier
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <FormSection title="Informations personnelles">
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Prénom" value={utilisateur.prenom} />
          <DetailItem label="Nom" value={utilisateur.nom} />
        </dl>
      </FormSection>

      <FormSection title="Affectation" description="Rôle et direction CNSS">
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Rôle" value={ROLE_LABELS[utilisateur.role]} />
          <DetailItem
            label="Module affecté"
            value={
              utilisateur.moduleAffecte
                ? MODULE_AFFECTE_LABELS[utilisateur.moduleAffecte]
                : '—'
            }
          />
          <DetailItem
            label="Direction"
            value={`${utilisateur.directionNom} (${utilisateur.directionAbreviation})`}
            className="sm:col-span-2"
          />
        </dl>
      </FormSection>

      <FormSection title="Compte">
        <dl className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Statut du compte"
            value={utilisateur.isActive ? 'Actif' : 'Inactif'}
          />
          <DetailItem
            label="Verrouillage"
            value={utilisateur.isVerrouille ? 'Verrouillé' : 'Non verrouillé'}
          />
          <DetailItem
            label="Créé le"
            value={formatDate(utilisateur.dtCreation)}
            className="sm:col-span-2"
          />
          <DetailItem
            label="Dernière connexion"
            value={
              utilisateur.dtLastLogin
                ? formatDate(utilisateur.dtLastLogin)
                : 'Aucune connexion enregistrée'
            }
            className="sm:col-span-2"
          />
        </dl>
      </FormSection>
      </div>
    </SideDrawer>
  )
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn('rounded-lg bg-slate-50 px-3 py-2.5', className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-cnss-900">{value}</dd>
    </div>
  )
}
