import { useEffect, type ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  buttonType?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  message: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  children,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isLoading = false,
  confirmDisabled = false,
  buttonType = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, isLoading, onCancel])

  if (!open) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 h-full bg-slate-900/50 backdrop-blur-[1px]"
        aria-label="Annuler la confirmation"
        onClick={() => {
          if (!isLoading) onCancel()
        }}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-statut-enAttente/15 text-statut-enAttente">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="font-display text-lg font-semibold text-cnss-900"
            >
              {title}
            </h2>
            <p id="confirm-dialog-message" className="mt-1 text-sm text-slate-600">
              {message}
            </p>
            {children ? <div className="mt-4">{children}</div> : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Fermer"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={buttonType}
            isLoading={isLoading}
            disabled={confirmDisabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </>
  )
}
