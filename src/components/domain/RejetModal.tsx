import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Button, Label } from '@/components/ui'
import {
  rejetSchema,
  type RejetFormValues,
} from '@/features/validation/schemas'
import { cn } from '@/lib/cn'

export interface RejetModalProps {
  open: boolean
  title: string
  description?: string
  isLoading?: boolean
  onClose: () => void
  onSubmit: (motif: string) => void
}

export function RejetModal({
  open,
  title,
  description,
  isLoading = false,
  onClose,
  onSubmit,
}: RejetModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejetFormValues>({
    resolver: zodResolver(rejetSchema),
    defaultValues: { motif: '' },
  })

  useEffect(() => {
    if (!open) {
      reset({ motif: '' })
    }
  }, [open, reset])

  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, isLoading, onClose])

  if (!open) {
    return null
  }

  const submit = (values: RejetFormValues) => {
    onSubmit(values.motif)
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px]"
        aria-label="Fermer la fenêtre de rejet"
        onClick={() => {
          if (!isLoading) onClose()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rejet-modal-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="rejet-modal-title"
              className="font-display text-lg font-semibold text-cnss-900"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Fermer"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="motifRejet" required>
              Motif de rejet
            </Label>
            <textarea
              id="motifRejet"
              rows={4}
              placeholder="Décrivez la raison du rejet (minimum 10 caractères)…"
              className={cn(
                'flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
                'placeholder:text-slate-400 transition-colors duration-200 resize-y min-h-[6rem]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cnss-400 focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
                errors.motif
                  ? 'border-statut-rejetee focus-visible:ring-statut-rejetee/50'
                  : 'border-slate-200 hover:border-slate-300',
              )}
              disabled={isLoading}
              {...register('motif')}
            />
            {errors.motif ? (
              <p className="text-sm text-statut-rejetee" role="alert">
                {errors.motif.message}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" variant="danger" isLoading={isLoading}>
              Confirmer le rejet
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
