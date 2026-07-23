import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

const variantStyles = {
  primary:
    'bg-cnss-700 text-white hover:bg-cnss-800 active:bg-cnss-900 disabled:bg-cnss-700/50',
  secondary:
    'bg-cnss-100 text-cnss-800 hover:bg-cnss-300/40 active:bg-cnss-300/60',
  outline:
    'border border-cnss-700 text-cnss-700 bg-white hover:bg-cnss-50 active:bg-cnss-100',
  ghost: 'text-cnss-700 hover:bg-cnss-100 active:bg-cnss-100/80',
  danger: 'bg-statut-rejetee text-white hover:bg-red-600 active:bg-red-700',
  success:
    'bg-statut-validee text-white hover:brightness-95 active:brightness-90 disabled:bg-statut-validee/50',
} as const

const sizeStyles = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
} as const

export type ButtonVariant = keyof typeof variantStyles
export type ButtonSize = keyof typeof sizeStyles

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled ?? isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cnss-400 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner size="sm" className="text-current" /> : null}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
