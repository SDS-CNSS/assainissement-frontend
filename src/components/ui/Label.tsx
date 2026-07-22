import { type LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({
  className,
  children,
  required = false,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-slate-700',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="ml-0.5 text-statut-rejetee" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  )
}
