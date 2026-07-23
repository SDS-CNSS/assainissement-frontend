import { Users } from 'lucide-react'
import { FormulaireDepotNpi } from '@/components/domain/FormulaireDepotNpi'
import { PortailPageHero } from '@/components/portail/PortailPageHero'

export function TravailleurPage() {
  return (
    <div className="bg-cnss-50">
      <PortailPageHero
        icon={Users}
        badge="Parcours travailleur · NPI"
        title="Dépôt de demande"
        description="Assainissez votre Numéro Personnel d'Identification (NPI)."
      />

      <section className="relative z-10 bg-white">
        <div className="mx-auto max-w-4xl px-3 py-8 sm:px-6 sm:py-12">
          <div className="rounded-[1.25rem] border border-cnss-100 bg-white p-4 shadow-card sm:p-7">
            <FormulaireDepotNpi />
          </div>
        </div>
      </section>
    </div>
  )
}
