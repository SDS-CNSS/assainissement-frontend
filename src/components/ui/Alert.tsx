import { type HTMLAttributes } from 'react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'

const variantConfig = {
  info: {
    icon: Info,
    className: 'border-cnss-400/30 bg-cnss-50 text-cnss-800',
    iconClassName: 'text-cnss-600',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-statut-validee/30 bg-statut-validee/10 text-emerald-900',
    iconClassName: 'text-statut-validee',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-statut-enAttente/30 bg-statut-enAttente/10 text-amber-900',
    iconClassName: 'text-statut-enAttente',
  },
  error: {
    icon: AlertCircle,
    className: 'border-statut-rejetee/30 bg-statut-rejetee/10 text-red-900',
    iconClassName: 'text-statut-rejetee',
  },
} as const

export type AlertVariant = keyof typeof variantConfig

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
}

export function Alert({
  variant = 'info',
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg border p-4 text-sm',
        config.className,
        className,
      )}
      {...props}
    >
      <Icon
        className={cn('mt-0.5 size-5 shrink-0', config.iconClassName)}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="mb-1 font-semibold">{title}</p>
        ) : null}
        <div className="text-current/90">{children}</div>
      </div>
    </div>
  )
}
