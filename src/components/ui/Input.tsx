import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError = false, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
        'placeholder:text-slate-400 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cnss-400 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
        hasError
          ? 'border-statut-rejetee focus-visible:ring-statut-rejetee/50'
          : 'border-slate-200 hover:border-slate-300',
        className,
      )}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
