import { Users } from 'lucide-react'
import { FormulaireDepotNpi } from '@/components/domain/FormulaireDepotNpi'

export function TravailleurPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-cnss-900 via-cnss-800 to-cnss-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,163,240,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <Users className="size-4 text-cnss-300" aria-hidden="true" />
              Parcours travailleur
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Dépôt de demande NPI
            </h1>
            <p className="mt-4 text-lg text-cnss-100/90">
              Assainissez votre Numéro Personnel d&apos;Identification (NPI) vérifié
              auprès de l&apos;ANIP, avec confirmation par code OTP envoyé par e-mail.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <FormulaireDepotNpi />
      </section>
    </div>
  )
}
