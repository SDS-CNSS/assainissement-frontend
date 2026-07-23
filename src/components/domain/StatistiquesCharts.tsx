import { useMemo } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import type { EvolutionPoint, TableauDeBordStats } from '@/features/admin/types'
import { STATUT_DEMANDE_MAP, type StatutDemande } from '@/lib/statutDemande'

const CNSS_BLUE = '#14149E'
const CNSS_BLUE_MID = '#2A3DB8'
const CNSS_SKY = '#4FA3F0'
const EMERALD = '#2FA86A'
const AMBER = '#F5A623'
const ROSE = '#E5484D'
const SLATE = '#64748b'

const MODULE_COLORS = {
  employeur: CNSS_BLUE_MID,
  travailleur: CNSS_SKY,
} as const

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE_N1: AMBER,
  EN_ATTENTE_N2: CNSS_SKY,
  REJETEE_N1_EN_ATTENTE_N2: ROSE,
  EN_ATTENTE_SUPERVISEUR: '#7C3AED',
  REJETEE_DEFINITIVEMENT: '#c2410c',
  VALIDEE_DEFINITIVEMENT: EMERALD,
}

const STATUT_CHART_LABELS: Partial<Record<StatutDemande, string>> = {
  EN_ATTENTE_N1: 'En attente Agent 1',
  REJETEE_N1_EN_ATTENTE_N2: 'Rejetée Agent 1',
  EN_ATTENTE_N2: 'En attente Agent 2',
  EN_ATTENTE_SUPERVISEUR: 'En attente Superviseur',
  REJETEE_DEFINITIVEMENT: 'Rejetée définitivement',
  VALIDEE_DEFINITIVEMENT: 'Validée',
}

function formatShortDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      {label ? <p className="mb-1 font-medium text-cnss-900">{label}</p> : null}
      <ul className="space-y-0.5">
        {payload.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-slate-600">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span>
              {entry.name}&nbsp;:{' '}
              <strong className="text-cnss-900">
                {(entry.value ?? 0).toLocaleString('fr-FR')}
              </strong>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function withCumulative(points: EvolutionPoint[]) {
  let running = 0
  return points.map((point) => {
    running += point.count
    return {
      ...point,
      label: formatShortDate(point.date),
      cumul: running,
    }
  })
}

export function StatistiquesCharts({
  stats,
  isLoading,
}: {
  stats?: TableauDeBordStats
  isLoading: boolean
}) {
  const evolutionData = useMemo(
    () => (stats ? withCumulative(stats.evolution) : []),
    [stats],
  )

  const moduleData = useMemo(() => {
    if (!stats) return []
    return [
      {
        name: 'Employeurs (IFU)',
        value: stats.parModule.employeur,
        color: MODULE_COLORS.employeur,
      },
      {
        name: 'Travailleurs (NPI)',
        value: stats.parModule.travailleur,
        color: MODULE_COLORS.travailleur,
      },
    ].filter((item) => item.value > 0)
  }, [stats])

  const statutData = useMemo(() => {
    if (!stats) return []
    return Object.entries(stats.parStatut)
      .filter(([, value]) => value > 0)
      .map(([statut, value]) => {
        const meta = STATUT_DEMANDE_MAP[statut as StatutDemande]
        return {
          name:
            STATUT_CHART_LABELS[statut as StatutDemande] ??
            meta?.label ??
            statut,
          value,
          color: STATUT_COLORS[statut] ?? SLATE,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [stats])

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className={index === 0 ? 'lg:col-span-2' : undefined}>
            <CardContent className="py-6">
              <Skeleton className="mb-4 h-4 w-48" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const hasEvolution = evolutionData.length > 0
  const hasModules = moduleData.length > 0
  const hasStatuts = statutData.length > 0

  if (!hasEvolution && !hasModules && !hasStatuts) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-slate-500">
          Aucune donnée à représenter pour la période sélectionnée.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Évolution des dépôts</CardTitle>
          <p className="text-sm text-slate-500">
            Nombre de demandes déposées par jour, par module.
          </p>
        </CardHeader>
        <CardContent>
          {hasEvolution ? (
            <div className="h-72 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={evolutionData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CNSS_BLUE} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={CNSS_BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: SLATE, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: SLATE, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Total"
                    stroke={CNSS_BLUE}
                    fill="url(#fillTotal)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="employeur"
                    name="Employeurs"
                    stroke={MODULE_COLORS.employeur}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="travailleur"
                    name="Travailleurs"
                    stroke={MODULE_COLORS.travailleur}
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              Pas d&apos;évolution journalière pour ces filtres.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume cumulé</CardTitle>
          <p className="text-sm text-slate-500">
            Accumulation des dépôts sur la période.
          </p>
        </CardHeader>
        <CardContent>
          {hasEvolution ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={evolutionData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: SLATE, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: SLATE, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="cumul"
                    name="Cumul"
                    stroke={CNSS_BLUE_MID}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              Pas de cumul disponible.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition par module</CardTitle>
          <p className="text-sm text-slate-500">
            Part Employeurs (IFU) / Travailleurs (NPI).
          </p>
        </CardHeader>
        <CardContent>
          {hasModules ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moduleData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {moduleData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              Aucune répartition par module.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Répartition par statut</CardTitle>
          <p className="text-sm text-slate-500">
            Etat du stock de demandes selon le workflow de validation.
          </p>
        </CardHeader>
        <CardContent>
          {hasStatuts ? (
            <div className="h-72 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statutData}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: SLATE, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: SLATE, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Demandes" radius={[0, 6, 6, 0]} barSize={22}>
                    {statutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              Aucune répartition par statut.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
