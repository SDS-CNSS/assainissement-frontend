import { Building2 } from 'lucide-react'
import { FormulaireDepotIfu } from '@/components/domain/FormulaireDepotIfu'

export function EmployeurPage() {
  return (
    <div className="bg-gradient-to-b from-cnss-50/80 via-slate-50 to-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-cnss-900 via-cnss-800 to-cnss-700 text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,163,240,0.28),transparent_55%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/2 size-[min(28rem,100vw)] -translate-x-1/2 rounded-full bg-cnss-400/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-10 text-center sm:px-6 sm:pb-24 sm:pt-16">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur sm:mb-5">
            <Building2 className="size-4 shrink-0 text-cnss-300" aria-hidden="true" />
            <span className="truncate">Parcours employeur</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Dépôt de demande IFU
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-cnss-100/90 sm:text-base">
            Assainissez votre Identifiant Fiscal Unique (IFU) vérifié auprès de la
            DGI.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-10 max-w-3xl px-3 pb-10 sm:-mt-16 sm:px-6 sm:pb-20">
        <div className="rounded-xl border border-cnss-100/80 bg-white p-4 shadow-lg shadow-cnss-900/5 sm:p-7">
          <FormulaireDepotIfu />
        </div>
      </section>
    </div>
  )
}
