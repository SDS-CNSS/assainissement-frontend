import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Search, Users } from 'lucide-react'
import cnssLogo from '@/images/logo.png'
import { cn } from '@/lib/cn'

const parcours = [
  {
    title: 'Employeurs',
    subtitle: 'Assainissement IFU',
    description:
      'Vérifiez et mettez à jour votre Identifiant Fiscal Unique auprès de la DGI.',
    to: '/employeur',
    icon: Building2,
    accent: 'from-cnss-700 to-cnss-600',
  },
  {
    title: 'Travailleurs',
    subtitle: 'Assainissement NPI',
    description:
      'Confirmez votre Numéro Personnel d’Identification via l’ANIP et un code e-mail.',
    to: '/travailleur',
    icon: Users,
    accent: 'from-cnss-800 to-cnss-700',
  },
] as const

export function AccueilPage() {
  return (
    <div className="bg-slate-50">
      {/* ——— Hero soft, centré ——— */}
      <section className="relative isolate overflow-hidden bg-[#E4EEF9]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgba(79,163,240,0.42),transparent_58%),radial-gradient(ellipse_60%_50%_at_100%_60%,rgba(125,190,245,0.28),transparent_55%),radial-gradient(ellipse_50%_40%_at_0%_80%,rgba(42,61,184,0.14),transparent_50%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cnss-300/40 to-transparent"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex min-h-[min(72svh,36rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[min(76svh,40rem)] sm:px-6 sm:py-20 lg:min-h-[min(80svh,44rem)] lg:py-24">
          <div className="animate-fade-up flex flex-col items-center">
            <img
              src={cnssLogo}
              alt="Logo CNSS"
              className="size-16 object-contain sm:size-20"
            />
            <p className="mt-5 font-display text-2xl font-bold tracking-tight text-cnss-800 sm:text-3xl">
              CNSS
            </p>
            <p className="mt-1 text-xs font-medium tracking-[0.18em] text-cnss-600/80 uppercase sm:text-sm sm:tracking-[0.2em]">
              République du Bénin
            </p>
          </div>

          <h1
            className="animate-fade-up mt-8 max-w-2xl font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-cnss-900 sm:mt-10 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
            style={{ animationDelay: '80ms' }}
          >
            Portail d&apos;assainissement IFU &amp; NPI
          </h1>

          <p
            className="animate-fade-up mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base"
            style={{ animationDelay: '140ms' }}
          >
            Mettez vos identifiants à jour pour garantir la conformité de vos
            dossiers auprès de la Caisse Nationale de Sécurité Sociale.
          </p>

          <div
            className="animate-fade-up mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center"
            style={{ animationDelay: '200ms' }}
          >
            <Link
              to="/employeur"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cnss-700 px-6 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgb(20_20_158/0.45)] transition-all duration-200 hover:bg-cnss-800 hover:shadow-[0_10px_28px_-8px_rgb(20_20_158/0.5)]"
            >
              Je suis employeur
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/travailleur"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-cnss-200/90 bg-white/70 px-6 text-base font-semibold text-cnss-800 backdrop-blur-sm transition-colors duration-200 hover:border-cnss-300 hover:bg-white"
            >
              Je suis travailleur
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* ——— Parcours ——— */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6 sm:pt-14">
        <div className="mb-6 max-w-xl sm:mb-8">
          <h2 className="font-display text-xl font-semibold text-cnss-900 sm:text-3xl">
            Choisissez votre parcours
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Deux démarches distinctes selon votre profil.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {parcours.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6',
                  'transition-all duration-300 hover:-translate-y-0.5 hover:border-cnss-200 hover:shadow-[0_12px_40px_-12px_rgb(10_10_120/0.18)]',
                  'animate-fade-up',
                )}
                style={{ animationDelay: `${80 + index * 80}ms` }}
              >
                <div
                  className={cn(
                    'mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white sm:mb-5 sm:size-12',
                    item.accent,
                  )}
                >
                  <Icon className="size-5 sm:size-6" aria-hidden="true" />
                </div>
                <p className="text-xs font-semibold tracking-wider text-cnss-600 uppercase">
                  {item.subtitle}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-cnss-900 sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cnss-700 transition-colors group-hover:text-cnss-900 sm:mt-5">
                  Commencer
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ——— Suivi ——— */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl border border-cnss-100 bg-cnss-50 px-5 py-8 sm:px-10 sm:py-12">
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-cnss-200/40 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-stretch justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-lg min-w-0">
              <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-white text-cnss-700 shadow-card">
                <Search className="size-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-semibold text-cnss-900 sm:text-2xl">
                Suivre une demande
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                Vous avez déjà déposé un dossier&nbsp;? Consultez son avancement
                avec votre numéro de suivi.
              </p>
            </div>
            <Link
              to="/suivi"
              className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-cnss-700 px-6 text-base font-semibold text-white transition-colors duration-200 hover:bg-cnss-800 sm:w-auto"
            >
              Accéder au suivi
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
