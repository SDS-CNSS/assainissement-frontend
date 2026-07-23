import { Building2 } from 'lucide-react'
import { FormulaireDepotIfu } from '@/components/domain/FormulaireDepotIfu'
import { PortailPageHero } from '@/components/portail/PortailPageHero'

export function EmployeurPage() {
  return (
    <div className="bg-cnss-50">
      <PortailPageHero
        icon={Building2}
        badge="Parcours employeur · IFU"
        title="Dépôt de demande"
        description="Mettez à jour votre Identifiant Fiscal Unique (IFU)."
      />

      <section className="relative z-10 bg-white">
        <div className="mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-12">
          <div className="rounded-[1.25rem] border border-cnss-100 bg-white p-4 shadow-card sm:p-7">
            <FormulaireDepotIfu />
          </div>
        </div>
      </section>
    </div>
  )
}
