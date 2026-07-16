import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TournamentStats } from '../lib/stats'

type Props = {
  tournaments: TournamentStats[]
  highlightYear: number
}

export function LateGoalsChart({ tournaments, highlightYear }: Props) {
  const data = tournaments.map((t) => ({
    year: String(t.year),
    lateGoals: t.lateGoals,
    latePerMatch: t.lateGoalsPerMatch,
    latePct: t.lateGoalPct,
    isHighlight: t.year === highlightYear,
  }))

  return (
    <section className="panel" aria-labelledby="late-chart-title">
      <h2 id="late-chart-title">Late goals across World Cups</h2>
      <p className="section-desc">
        Absolute late goals and late goals per match (fairer for 2026&apos;s larger
        tournament).
      </p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: 'var(--ink-muted)', fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fill: 'var(--ink-muted)', fontSize: 12 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 4,
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="lateGoals"
              name="Late goals"
              radius={[4, 4, 0, 0]}
            >
              {data.map((d) => (
                <Cell
                  key={d.year}
                  fill={d.isHighlight ? 'var(--accent)' : 'var(--pitch)'}
                />
              ))}
            </Bar>
            <Bar
              yAxisId="right"
              dataKey="latePerMatch"
              name="Late / match"
              fill="var(--accent-2)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
