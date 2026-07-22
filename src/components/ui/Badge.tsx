import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const variantStyles = {
  default: 'bg-cnss-100 text-cnss-800 border-cnss-300/40',
  info: 'bg-cnss-100 text-cnss-800 border-cnss-400/30',
  success: 'bg-statut-validee/15 text-emerald-800 border-statut-validee/30',
  warning: 'bg-statut-enAttente/15 text-amber-800 border-statut-enAttente/30',
  danger: 'bg-statut-rejetee/15 text-red-800 border-statut-rejetee/30',
  outline: 'bg-white text-slate-700 border-slate-200',
} as const

export type BadgeVariant = keyof typeof variantStyles

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
}
