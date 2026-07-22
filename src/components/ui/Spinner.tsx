import { cn } from '@/lib/cn'

const sizeStyles = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-[3px]',
} as const

export type SpinnerSize = keyof typeof sizeStyles

export interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

export function Spinner({
  size = 'md',
  className,
  label = 'Chargement…',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        sizeStyles[size],
        className,
      )}
    />
  )
}

export interface SkeletonProps {
  className?: string
}

/** Placeholder de chargement — préféré aux spinners bruts pour le contenu (spec section 10). */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-slate-200/80',
        className,
      )}
    />
  )
}
