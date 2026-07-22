import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

const services = [
  {
    title: 'Employeurs — IFU',
    description:
      'Déposez une demande d\'assainissement de votre Identifiant Fiscal Unique (IFU) auprès de la DGI.',
    to: '/employeur',
    icon: Building2,
  },
  {
    title: 'Travailleurs — NPI',
    description:
      'Déposez une demande d\'assainissement de votre Numéro Personnel d\'Identification (NPI) via l\'ANIP, confirmée par e-mail.',
    to: '/travailleur',
    icon: Users,
  },
  {
    title: 'Suivi de demande',
    description:
      'Consultez l\'état d\'avancement de votre demande à partir de votre numéro de dossier.',
    to: '/suivi',
    icon: Search,
  },
] as const

export function AccueilPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-cnss-900 via-cnss-800 to-cnss-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,163,240,0.25),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <ShieldCheck className="size-4 text-cnss-300" aria-hidden="true" />
              Portail public CNSS
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Assainissez vos données d&apos;identification
            </h1>
            <p className="mt-4 text-lg text-cnss-100/90">
              Mettez à jour votre IFU (employeurs) ou votre NPI (travailleurs) pour
              garantir la conformité de vos dossiers auprès de la CNSS.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/employeur"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cnss-100 px-6 text-base font-medium text-cnss-800 transition-colors hover:bg-cnss-300/40"
              >
                Dépôt employeur
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/travailleur"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-6 text-base font-medium text-white transition-colors hover:bg-white/10"
              >
                Dépôt travailleur
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-cnss-900">
            Nos services en ligne
          </h2>
          <p className="mt-2 text-slate-600">
            Choisissez le parcours adapté à votre profil ou suivez une demande existante.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Card
                key={service.to}
                className="group transition-shadow duration-200 hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col pt-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-cnss-100 text-cnss-700 transition-colors group-hover:bg-cnss-700 group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-cnss-900">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-slate-600">
                    {service.description}
                  </p>
                  <Link
                    to={service.to}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cnss-700 hover:text-cnss-800"
                  >
                    Accéder
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
