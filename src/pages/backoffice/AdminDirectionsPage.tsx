import { useMemo, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from '@/components/ui'
import { ConfirmDialog } from '@/components/domain/ConfirmDialog'
import {
  FlashFeedback,
  useFlashFeedback,
} from '@/components/domain/FlashFeedback'
import { FormSection, FormSideDrawer } from '@/components/domain/FormSideDrawer'
import { TablePagination } from '@/components/domain/TablePagination'
import { getApiErrorMessage } from '@/api/types'
import {
  useCreateDirection,
  useDeleteDirection,
  useDirectionsList,
  useUpdateDirection,
} from '@/features/admin/hooks'
import {
  directionFormSchema,
  type DirectionFormValues,
} from '@/features/admin/schemas'
import type { Direction } from '@/features/admin/types'
import { DEFAULT_PAGE, PAGE_SIZE } from '@/lib/pagination'

/** UC-15 : gestion CRUD des directions (RG-13 sur suppression). */
export function AdminDirectionsPage() {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const directionsQuery = useDirectionsList({ page, limit: PAGE_SIZE })
  const createDirection = useCreateDirection()
  const updateDirection = useUpdateDirection()
  const deleteDirection = useDeleteDirection()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Direction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Direction | null>(null)
  const { feedback, setFeedback, clearFeedback } = useFlashFeedback()

  const createForm = useForm<DirectionFormValues>({
    resolver: zodResolver(directionFormSchema),
    defaultValues: { nom: '', abreviation: '' },
  })

  const editForm = useForm<DirectionFormValues>({
    resolver: zodResolver(directionFormSchema),
    defaultValues: { nom: '', abreviation: '' },
  })

  const openCreate = () => {
    createForm.reset({ nom: '', abreviation: '' })
    setCreateOpen(true)
  }

  const openEdit = (direction: Direction) => {
    editForm.reset({
      nom: direction.nom,
      abreviation: direction.abreviation,
    })
    setEditTarget(direction)
  }

  const handleCreate = createForm.handleSubmit(async (values) => {
    try {
      await createDirection.mutateAsync(values)
      setFeedback({
        variant: 'success',
        message: `Direction ${values.abreviation} créée.`,
      })
      setCreateOpen(false)
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'La création de la direction a échoué.',
        ),
      })
    }
  })

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editTarget) return

    try {
      await updateDirection.mutateAsync({
        id: editTarget.id,
        payload: values,
      })
      setFeedback({
        variant: 'success',
        message: `Direction ${values.abreviation} mise à jour.`,
      })
      setEditTarget(null)
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'La mise à jour de la direction a échoué.',
        ),
      })
    }
  })

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      await deleteDirection.mutateAsync(deleteTarget.id)
      setFeedback({
        variant: 'success',
        message: `Direction ${deleteTarget.abreviation} supprimée.`,
      })
      setDeleteTarget(null)
    } catch (error) {
      setFeedback({
        variant: 'error',
        message: getApiErrorMessage(
          error,
          'Impossible de supprimer cette direction. Elle est peut-être rattachée à des utilisateurs (RG-13).',
        ),
      })
      setDeleteTarget(null)
    }
  }

  const listError =
    directionsQuery.isError
      ? getApiErrorMessage(
          directionsQuery.error,
          'Impossible de charger la liste des directions.',
        )
      : null

  const sortedDirections = useMemo(
    () =>
      [...(directionsQuery.data?.items ?? [])].sort((a, b) =>
        a.abreviation.localeCompare(b.abreviation),
      ),
    [directionsQuery.data?.items],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-cnss-900">
            Directions
          </h2>
          <p className="mt-1 text-slate-600">
            Gestion des directions internes.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Nouvelle direction
        </Button>
      </div>

      <FlashFeedback feedback={feedback} onDismiss={clearFeedback} />

      {listError ? <Alert variant="error">{listError}</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>
            Liste des directions
            {directionsQuery.data ? ` (${directionsQuery.data.total})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {directionsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : sortedDirections.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Aucune direction enregistrée.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Abréviation
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Utilisateurs
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedDirections.map((direction) => (
                    <tr key={direction.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-cnss-900">
                        {direction.abreviation}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{direction.nom}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {direction.nbUtilisateurs ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-10 px-0"
                            aria-label={`Modifier ${direction.abreviation}`}
                            onClick={() => openEdit(direction)}
                          >
                            <Pencil className="size-5" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-10 px-0 text-statut-rejetee hover:text-red-700"
                            aria-label={`Supprimer ${direction.abreviation}`}
                            onClick={() => setDeleteTarget(direction)}
                          >
                            <Trash2 className="size-5" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {directionsQuery.data ? (
            <TablePagination
              page={page}
              total={directionsQuery.data.total}
              limit={directionsQuery.data.limit}
              itemLabel="direction"
              isLoading={directionsQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </CardContent>
      </Card>

      {createOpen ? (
        <FormSideDrawer
          open={createOpen}
          title="Nouvelle direction"
          description="Ajoutez une direction interne pour rattacher les utilisateurs CNSS."
          submitLabel="Créer la direction"
          isLoading={createDirection.isPending}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        >
          <DirectionFormFields form={createForm} />
        </FormSideDrawer>
      ) : null}

      {editTarget ? (
        <FormSideDrawer
          open={Boolean(editTarget)}
          title={`Modifier ${editTarget.abreviation}`}
          description="Mettez à jour le nom ou l'abréviation de la direction."
          submitLabel="Enregistrer"
          isLoading={updateDirection.isPending}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        >
          <DirectionFormFields form={editForm} />
        </FormSideDrawer>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer la direction"
        message={
          deleteTarget
            ? `Supprimer la direction ${deleteTarget.abreviation} ? Cette action est impossible si des utilisateurs y sont rattachés (RG-13).`
            : ''
        }
        confirmLabel="Supprimer"
        isLoading={deleteDirection.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function DirectionFormFields({
  form,
}: {
  form: UseFormReturn<DirectionFormValues>
}) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-6">
      <FormSection
        title="Identification"
        description="Nom complet et abréviation utilisés dans le back office."
      >
        <div className="space-y-1.5">
          <Label htmlFor="direction-nom" required>
            Nom
          </Label>
          <Input
            id="direction-nom"
            placeholder="ex. Direction des Systèmes d'Information"
            hasError={Boolean(errors.nom)}
            {...register('nom')}
          />
          {errors.nom ? (
            <p className="text-xs text-statut-rejetee">{errors.nom.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="direction-abreviation" required>
            Abréviation
          </Label>
          <Input
            id="direction-abreviation"
            placeholder="ex. DSI"
            hasError={Boolean(errors.abreviation)}
            {...register('abreviation')}
          />
          {errors.abreviation ? (
            <p className="text-xs text-statut-rejetee">
              {errors.abreviation.message}
            </p>
          ) : null}
        </div>
      </FormSection>
    </div>
  )
}
