import {
  CheckCircle2,
  ClipboardList,
  Hourglass,
  ShieldCheck,
} from 'lucide-react'
import {
  Alert,
  Card,
  CardContent,
  Skeleton,
} from '@/components/ui'
import { getApiErrorMessage } from '@/api/types'
import { DashboardCharts } from '@/features/admin/DashboardCharts'
import { useTableauDeBord } from '@/features/admin/hooks'
import { useAuthStore } from '@/features/auth/authStore'
import { userHasRole } from '@/features/auth/types'
import { cn } from '@/lib/cn'

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
            ? 'Vue d’ensemble des demandes, accès aux modules via le menu.'
            : 'Vue d’ensemble des demandes d’assainissement.'}
        </p>
      </div>

      {statsError ? <Alert variant="error">{statsError}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-3.5">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="mt-3 h-7 w-16" />
                  <Skeleton className="mt-1.5 h-3.5 w-24" />
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
                      'pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b',
                      stat.accentClass,
                    )}
                    aria-hidden="true"
                  />
                  <CardContent className="relative p-3.5">
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        stat.iconClass,
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <p
                      className={cn(
                        'mt-3 font-display text-2xl font-semibold tracking-tight',
                        stat.valueClass,
                      )}
                    >
                      {stats[stat.key].toLocaleString('fr-FR')}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-700">
                      {stat.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{stat.hint}</p>
                  </CardContent>
                </Card>
              )
            })
          : null}
      </div>

      {statsQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mx-auto size-48 rounded-full" />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {!statsQuery.isLoading && stats ? <DashboardCharts stats={stats} /> : null}
    </div>
  )
}
