import { Link } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Eye,
  Hourglass,
  ShieldCheck,
  Users,
} from 'lucide-react'
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui'
import { getApiErrorMessage } from '@/api/types'
import { useTableauDeBord } from '@/features/admin/hooks'
import { useAuthStore } from '@/features/auth/authStore'
import { userHasRole } from '@/features/auth/types'
import { cn } from '@/lib/cn'

const ADMIN_SECTIONS = [
  {
    label: 'Utilisateurs',
    description: 'Gestion des utilisateurs',
    to: '/backoffice/admin/utilisateurs',
    icon: Users,
  },
  {
    label: 'Directions',
    description: 'Gestion des directions',
    to: '/backoffice/admin/directions',
    icon: Building2,
  },
  {
    label: 'Supervision',
    description: 'Vue globale des demandes',
    to: '/backoffice/admin/supervision',
    icon: Eye,
  },
  {
    label: 'Consolidation',
    description: 'Écriture IFU/NPI validés dans le référentiel',
    to: '/backoffice/admin/consolidation',
    icon: CheckCircle2,
  },
] as const

const STAT_CARDS = [
  {
    key: 'totalDemandes' as const,
    label: 'Total demandes',
    hint: 'Tous modules confondus',
    icon: ClipboardList,
    iconClass: 'bg-cnss-100 text-cnss-700',
    valueClass: 'text-cnss-900',
    accentClass: 'from-cnss-700/10 to-transparent',
  },
  {
    key: 'enAttenteN1' as const,
    label: 'En attente Agent 1',
    hint: 'File Agent 1',
    icon: Hourglass,
    iconClass: 'bg-amber-100 text-amber-700',
    valueClass: 'text-amber-800',
    accentClass: 'from-amber-500/10 to-transparent',
  },
  {
    key: 'enAttenteN2' as const,
    label: 'En attente Agent 2',
    hint: 'File Agent 2',
    icon: ShieldCheck,
    iconClass: 'bg-sky-100 text-sky-700',
    valueClass: 'text-cnss-800',
    accentClass: 'from-sky-500/10 to-transparent',
  },
  {
    key: 'valideesDefinitivement' as const,
    label: 'Validées',
    hint: 'Décision définitive Agent 2',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-100 text-emerald-700',
    valueClass: 'text-emerald-800',
    accentClass: 'from-emerald-500/10 to-transparent',
  },
] as const

export function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = userHasRole(user, 'ROLE_ADMIN')
  const statsQuery = useTableauDeBord()

  const statsError =
    statsQuery.isError
      ? getApiErrorMessage(
          statsQuery.error,
          'Impossible de charger le résumé statistique.',
        )
      : null

  const stats = statsQuery.data

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-cnss-900">
          Tableau de bord
        </h2>
        <p className="mt-1 text-slate-600">
          {isAdmin
            ? 'Gestion des utilisateurs, directions, supervision et consolidation.'
            : 'Vue d’ensemble des demandes d’assainissement.'}
        </p>
      </div>

      {statsError ? <Alert variant="error">{statsError}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-5">
                  <Skeleton className="size-11 rounded-xl" />
                  <Skeleton className="mt-5 h-9 w-20" />
                  <Skeleton className="mt-2 h-4 w-28" />
                </CardContent>
              </Card>
            ))
          : null}

        {!statsQuery.isLoading && stats
          ? STAT_CARDS.map((stat) => {
              const Icon = stat.icon
              return (
                <Card
                  key={stat.key}
                  className="relative overflow-hidden transition-shadow duration-200 hover:shadow-md"
                >
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b',
                      stat.accentClass,
                    )}
                    aria-hidden="true"
                  />
                  <CardContent className="relative p-5">
                    <span
                      className={cn(
                        'flex size-11 items-center justify-center rounded-xl',
                        stat.iconClass,
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <p
                      className={cn(
                        'mt-5 font-display text-3xl font-semibold tracking-tight',
                        stat.valueClass,
                      )}
                    >
                      {stats[stat.key].toLocaleString('fr-FR')}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {stat.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{stat.hint}</p>
                  </CardContent>
                </Card>
              )
            })
          : null}
      </div>

      {isAdmin ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.to} to={section.to} className="group block">
                <Card className="h-full transition-shadow duration-200 group-hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-cnss-100 text-cnss-700">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <CardTitle>{section.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{section.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
