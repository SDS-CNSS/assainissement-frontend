import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { TableauDeBordStats } from '@/features/admin/types'

const MODULE_COLORS = {
  employeur: '#14149E',
  travailleur: '#4FA3F0',
} as const

function formatMonthLabel(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-')
  if (!year || !month) return yyyyMm

  const date = new Date(Number(year), Number(month) - 1, 1)
  if (Number.isNaN(date.getTime())) return yyyyMm

  return date.toLocaleDateString('fr-FR', { month: 'short' })
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-slate-500">
      {message}
    </div>
  )
}

export function DashboardCharts({ stats }: { stats: TableauDeBordStats }) {
  const evolutionData = stats.evolution.map((point) => ({
    ...point,
    label: formatMonthLabel(point.date),
  }))

  const moduleData = [
    {
      name: 'Employeur (IFU)',
      key: 'employeur' as const,
      value: stats.parModule.employeur,
    },
    {
      name: 'Travailleur (NPI)',
      key: 'travailleur' as const,
      value: stats.parModule.travailleur,
    },
  ].filter((item) => item.value > 0)

  const moduleTotal =
    stats.parModule.employeur + stats.parModule.travailleur

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="overflow-hidden lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Évolution des demandes</CardTitle>
          <p className="text-xs text-slate-500">
            Nombre de dépôts pour chaque mois (12 derniers mois)
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {evolutionData.length === 0 ? (
            <ChartEmpty message="Aucune demande à afficher sur la période." />
          ) : (
            <div className="h-64 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={evolutionData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 8 }}
                >
                  <defs>
                    <linearGradient
                      id="demandesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#14149E" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#14149E" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    interval={0}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    angle={-30}
                    textAnchor="end"
                    height={48}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value) => [
                      Number(value).toLocaleString('fr-FR'),
                      'Demandes',
                    ]}
                    labelFormatter={(label) => String(label)}
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: '#e2e8f0',
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#14149E"
                    strokeWidth={2}
                    fill="url(#demandesGradient)"
                    name="Demandes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Demandes par module</CardTitle>
          <p className="text-xs text-slate-500">Répartition Employeur / Travailleur</p>
        </CardHeader>
        <CardContent className="pt-0">
          {moduleTotal === 0 ? (
            <ChartEmpty message="Aucune demande à répartir." />
          ) : (
            <div className="h-64 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moduleData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="46%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {moduleData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={MODULE_COLORS[entry.key]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      Number(value).toLocaleString('fr-FR'),
                      'Demandes',
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: '#e2e8f0',
                      fontSize: 13,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
