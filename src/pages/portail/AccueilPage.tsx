import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Search, ShieldCheck, Users } from 'lucide-react'
import heroBackground from '@/images/hero-accueil-bg.png'
import { cn } from '@/lib/cn'

const parcours = [
  {
    title: 'Employeurs',
    subtitle: 'Assainissement IFU',
    description:
      'Vérifiez et mettez à jour votre Identifiant Fiscal Unique.',
    to: '/employeur',
    icon: Building2,
    step: '01',
  },
  {
    title: 'Travailleurs',
    subtitle: 'Assainissement NPI',
    description:
      'Confirmez votre Numéro Personnel d’Identification.',
    to: '/travailleur',
    icon: Users,
    step: '02',
  },
] as const

export function AccueilPage() {
  return (
    <div className="bg-cnss-50">
      {/* ——— Hero centré, fond clair ——— */}
      <section className="relative isolate overflow-hidden bg-white">
        <img
          src={heroBackground}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover object-center opacity-55"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/85 to-cnss-50"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgb(79_163_240/0.18),transparent_60%),radial-gradient(ellipse_50%_40%_at_100%_80%,rgb(125_190_245/0.16),transparent_55%),radial-gradient(ellipse_45%_35%_at_0%_70%,rgb(42_61_184/0.08),transparent_50%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-14 lg:py-16">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-cnss-200/80 bg-white/70 px-3.5 py-1.5 shadow-card backdrop-blur-sm">
            <ShieldCheck className="size-4 text-cnss-700" aria-hidden="true" />
            <p className="text-xs font-semibold tracking-[0.14em] text-cnss-700 uppercase sm:text-[13px]">
              Identifiants sécurisés · IFU &amp; NPI
            </p>
          </div>

          <h1
            className="animate-fade-up mt-5 max-w-2xl font-display text-[1.75rem] font-bold leading-tight tracking-tight text-cnss-900 sm:mt-6 sm:text-4xl lg:text-[2.85rem] lg:leading-[1.12]"
            style={{ animationDelay: '90ms' }}
          >
            Portail d&apos;assainissement IFU &amp; NPI
          </h1>

          <p
            className="animate-fade-up mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base"
            style={{ animationDelay: '150ms' }}
          >
            Mettez vos identifiants à jour pour garantir la conformité de vos
            dossiers auprès de la Caisse Nationale de Sécurité Sociale.
          </p>

          <div
            className="animate-fade-up mt-6 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center"
            style={{ animationDelay: '220ms' }}
          >
            <Link
              to="/employeur"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cnss-700 px-6 text-base font-semibold text-white shadow-[0_10px_28px_-10px_rgb(20_20_158/0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cnss-800"
            >
              Je suis employeur
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/travailleur"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-cnss-200 bg-white/80 px-6 text-base font-semibold text-cnss-800 backdrop-blur-sm transition-all duration-300 hover:border-cnss-300 hover:bg-white"
            >
              Je suis travailleur
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Parcours ——— */}
      <section className="relative z-10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-8 max-w-lg sm:mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] text-cnss-600 uppercase">
              Parcours
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-cnss-900 sm:text-3xl">
              Choisissez votre parcours
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Deux démarches distinctes selon votre profil.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {parcours.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'group relative overflow-hidden rounded-[1.5rem] border border-cnss-100 bg-white p-6 shadow-card sm:p-7',
                    'transition-all duration-300 hover:-translate-y-1 hover:border-cnss-200 hover:shadow-card-hover',
                    'animate-fade-up',
                  )}
                  style={{ animationDelay: `${80 + index * 90}ms` }}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full bg-cnss-100/80 transition-transform duration-500 group-hover:scale-125" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cnss-700 to-cnss-500 text-white shadow-[0_10px_24px_-10px_rgb(20_20_158/0.55)] transition-transform duration-300 group-hover:scale-105">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="font-display text-3xl font-bold text-cnss-100 transition-colors duration-300 group-hover:text-cnss-200">
                      {item.step}
                    </span>
                  </div>
                  <p className="relative mt-5 text-xs font-semibold tracking-[0.16em] text-cnss-600 uppercase">
                    {item.subtitle}
                  </p>
                  <h3 className="relative mt-1.5 font-display text-xl font-bold text-cnss-900 sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="relative mt-2.5 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                  <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cnss-700">
                    Commencer
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ——— Suivi ——— */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-cnss-900 px-6 py-10 sm:px-10 sm:py-12">
          <div className="bg-mesh-hero pointer-events-none absolute inset-0 opacity-80" />
          <div
            className="pointer-events-none absolute -right-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-cnss-400/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-stretch justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl min-w-0">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cnss-300 backdrop-blur-sm">
                <Search className="size-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Suivre une demande
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-cnss-100/75 sm:text-base">
                Vous avez déjà déposé un dossier&nbsp;? Consultez son avancement
                avec votre numéro de suivi.
              </p>
            </div>
            <Link
              to="/suivi"
              className="group inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-7 text-base font-semibold text-cnss-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cnss-50 sm:w-auto"
            >
              Accéder au suivi
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
