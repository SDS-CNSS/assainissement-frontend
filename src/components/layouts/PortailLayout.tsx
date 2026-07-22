import { Link, Outlet } from 'react-router-dom'
import { Building2, LogIn, Search, Users } from 'lucide-react'
import cnssLogo from '@/images/logo.png'

export function PortailLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={cnssLogo}
              alt="Logo CNSS"
              className="size-10 rounded-lg object-contain"
            />
            <div className="text-left">
              <p className="font-display text-sm font-semibold text-cnss-900">
                CNSS — Bénin
              </p>
              <p className="text-xs text-slate-500">Portail d&apos;assainissement</p>
            </div>
          </Link>
          <Link
            to="/login"
            className="hidden items-center gap-1.5 rounded-lg border border-cnss-700 px-3 py-1.5 text-sm font-medium text-cnss-700 transition-colors hover:bg-cnss-50 sm:inline-flex"
          >
            <LogIn className="size-4" aria-hidden="true" />
            Espace back office
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Caisse Nationale de Sécurité Sociale — Bénin</p>
          <nav className="flex flex-wrap gap-4">
            <Link to="/employeur" className="inline-flex items-center gap-1.5 hover:text-cnss-700">
              <Building2 className="size-4" aria-hidden="true" />
              Employeurs
            </Link>
            <Link to="/travailleur" className="inline-flex items-center gap-1.5 hover:text-cnss-700">
              <Users className="size-4" aria-hidden="true" />
              Travailleurs
            </Link>
            <Link to="/suivi" className="inline-flex items-center gap-1.5 hover:text-cnss-700">
              <Search className="size-4" aria-hidden="true" />
              Suivi
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
