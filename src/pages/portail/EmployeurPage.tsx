import { Building2 } from 'lucide-react'
import { FormulaireDepotIfu } from '@/components/domain/FormulaireDepotIfu'

export function EmployeurPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-cnss-900 via-cnss-800 to-cnss-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,163,240,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <Building2 className="size-4 text-cnss-300" aria-hidden="true" />
              Parcours employeur
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Dépôt de demande IFU
            </h1>
            <p className="mt-3 text-cnss-100/90">
              Assainissez votre Identifiant Fiscal Unique (IFU) vérifié auprès de la DGI.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <FormulaireDepotIfu />
      </section>
    </div>
  )
}
