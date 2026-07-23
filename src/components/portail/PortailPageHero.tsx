import type { LucideIcon } from 'lucide-react'
import heroBackground from '@/images/hero-accueil-bg.png'

type PortailPageHeroProps = {
  badge: string
  title: string
  description: string
  icon: LucideIcon
}

/**
 * Hero clair partagé des parcours public (employeur / travailleur),
 * aligné sur la DA de l’accueil.
 */
export function PortailPageHero({
  badge,
  title,
  description,
  icon: Icon,
}: PortailPageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <img
        src={heroBackground}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover object-center opacity-55"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgb(79_163_240/0.18),transparent_60%),radial-gradient(ellipse_50%_40%_at_100%_80%,rgb(125_190_245/0.16),transparent_55%),radial-gradient(ellipse_45%_35%_at_0%_70%,rgb(42_61_184/0.08),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-10 text-center sm:px-6 sm:py-12 lg:py-14">
        <div className="animate-fade-up inline-flex max-w-full items-center gap-2 rounded-full border border-cnss-200/80 bg-white/70 px-3.5 py-1.5 shadow-card backdrop-blur-sm">
          <Icon className="size-4 shrink-0 text-cnss-700" aria-hidden="true" />
          <p className="truncate text-xs font-semibold tracking-[0.14em] text-cnss-700 uppercase sm:text-[13px]">
            {badge}
          </p>
        </div>

        <h1
          className="animate-fade-up mt-5 max-w-2xl font-display text-[1.75rem] font-bold leading-tight tracking-tight text-cnss-900 sm:mt-6 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.12]"
          style={{ animationDelay: '90ms' }}
        >
          {title}
        </h1>

        <p
          className="animate-fade-up mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base"
          style={{ animationDelay: '150ms' }}
        >
          {description}
        </p>
      </div>
    </section>
  )
}
