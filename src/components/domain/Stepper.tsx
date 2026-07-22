import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface StepperStep {
  id: string
  label: string
}

export interface StepperProps {
  steps: StepperStep[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav
      aria-label="Progression du formulaire"
      className={cn('w-full', className)}
    >
      <ol className="flex items-center justify-between gap-0.5 sm:gap-2">
        {steps.map((step, index) => {
          const isDone = index < currentStep
          const isActive = index === currentStep

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:gap-2"
            >
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <div
                    aria-hidden="true"
                    className={cn(
                      'h-0.5 flex-1 transition-colors duration-200',
                      isDone || isActive ? 'bg-cnss-700' : 'bg-slate-200',
                    )}
                  />
                ) : (
                  <div className="flex-1" aria-hidden="true" />
                )}

                <div
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-200 sm:size-9 sm:text-sm',
                    isDone
                      ? 'border-cnss-700 bg-cnss-700 text-white'
                      : isActive
                        ? 'border-cnss-700 bg-white text-cnss-700'
                        : 'border-slate-200 bg-white text-slate-400',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isDone ? (
                    <Check className="size-3.5 sm:size-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </div>

                {index < steps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className={cn(
                      'h-0.5 flex-1 transition-colors duration-200',
                      isDone ? 'bg-cnss-700' : 'bg-slate-200',
                    )}
                  />
                ) : (
                  <div className="flex-1" aria-hidden="true" />
                )}
              </div>

              <span
                className={cn(
                  'max-w-full truncate text-center text-[10px] font-medium leading-tight sm:text-xs',
                  // Mobile : libellé de l’étape active seulement (parcours NPI à 6 étapes)
                  isActive ? 'block' : 'hidden sm:block',
                  isActive
                    ? 'text-cnss-800'
                    : isDone
                      ? 'text-cnss-700'
                      : 'text-slate-400',
                )}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
