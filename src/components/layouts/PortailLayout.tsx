import { useEffect, useId, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Building2, Menu, Search, Users, X } from 'lucide-react'
import cnssLogo from '@/images/logo.png'
import { cn } from '@/lib/cn'

const NAV_LINKS = [
  { to: '/employeur', label: 'Employeurs', icon: Building2 },
  { to: '/travailleur', label: 'Travailleurs', icon: Users },
  { to: '/suivi', label: 'Suivi', icon: Search },
] as const

export function PortailLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuId = useId()
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 sm:gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src={cnssLogo}
              alt="Logo CNSS"
              className="size-9 shrink-0 rounded-xl object-contain sm:size-10"
            />
            <div className="min-w-0 text-left">
              <p className="font-display text-sm font-semibold text-cnss-900 truncate">
                CNSS — Bénin
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Portail d&apos;assainissement
              </p>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Navigation principale"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                  location.pathname === link.to
                    ? 'bg-cnss-50 text-cnss-800'
                    : 'text-slate-600 hover:bg-cnss-50 hover:text-cnss-800',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl text-cnss-800 transition-colors hover:bg-cnss-50 md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <div
          id={menuId}
          className={cn(
            'border-t border-slate-200/80 bg-white md:hidden',
            menuOpen ? 'block' : 'hidden',
          )}
        >
          <nav
            className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6"
            aria-label="Navigation mobile"
          >
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-cnss-50 text-cnss-800'
                      : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <Icon className="size-4 shrink-0 text-cnss-700" aria-hidden="true" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          aria-label="Fermer le menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <main className="relative z-0 flex-1 min-w-0 overflow-x-clip bg-cnss-50">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <img
                src={cnssLogo}
                alt="Logo CNSS"
                className="size-10 shrink-0 rounded-xl object-contain"
              />
              <div className="min-w-0 text-left">
                <p className="font-display text-sm font-semibold text-cnss-900">
                  CNSS — Bénin
                </p>
                <p className="mt-0.5 max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm">
                  Portail public d&apos;assainissement des identifiants IFU et
                  NPI.
                </p>
              </div>
            </Link>

            <nav
              className="flex flex-wrap gap-x-5 gap-y-2"
              aria-label="Liens pied de page"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-cnss-700"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="mt-8 border-t border-slate-100 pt-5 text-xs text-slate-400">
            © {new Date().getFullYear()} CNSS — Bénin · Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  )
}
