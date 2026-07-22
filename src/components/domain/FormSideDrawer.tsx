import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface SideDrawerProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  isLoading?: boolean
  onClose: () => void
  titleId?: string
}

export function SideDrawer({
  open,
  title,
  description,
  children,
  footer,
  isLoading = false,
  onClose,
  titleId = 'side-drawer-title',
}: SideDrawerProps) {
  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, isLoading, onClose])

  if (!open) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] animate-backdrop-in"
        aria-label="Fermer le panneau"
        onClick={() => {
          if (!isLoading) onClose()
        }}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col',
          'border-l border-slate-200/80 bg-white shadow-2xl shadow-cnss-900/10',
          'animate-drawer-in',
        )}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-cnss-100 bg-gradient-to-br from-cnss-50 via-white to-white px-6 py-5">
          <div
            className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-cnss-400/15 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="font-display text-xl font-semibold text-cnss-900"
              >
                {title}
              </h2>
              {description ? (
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-slate-500 hover:text-cnss-900"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Fermer"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

          {footer ? (
            <div className="shrink-0 border-t border-slate-200 bg-slate-50/80 px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}

export interface FormSideDrawerProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  submitLabel?: string
  isLoading?: boolean
  onClose: () => void
  onSubmit: () => void
}

export function FormSideDrawer({
  open,
  title,
  description,
  children,
  submitLabel = 'Enregistrer',
  isLoading = false,
  onClose,
  onSubmit,
}: FormSideDrawerProps) {
  return (
    <SideDrawer
      open={open}
      title={title}
      description={description}
      isLoading={isLoading}
      onClose={onClose}
      titleId="form-side-drawer-title"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="form-side-drawer-form"
            isLoading={isLoading}
          >
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form
        id="form-side-drawer-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        {children}
      </form>
    </SideDrawer>
  )
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-display text-sm font-semibold text-cnss-900">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
        {children}
      </div>
    </section>
  )
}
