import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TournamentStats } from '../lib/stats'

type Props = {
  tournaments: TournamentStats[]
}

export function GoalsPerMatchChart({ tournaments }: Props) {
  const data = tournaments.map((t) => ({
    year: String(t.year),
    goalsPerMatch: t.goalsPerMatch,
    totalGoals: t.totalGoals,
  }))

  return (
    <section className="panel" aria-labelledby="gpm-title">
      <h2 id="gpm-title">Scoring rate</h2>
      <p className="section-desc">Goals per match by tournament — context for the late-goal share.</p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: 'var(--ink-muted)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--ink-muted)', fontSize: 12 }} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 4,
              }}
              formatter={(value, name) => {
                const n = typeof value === 'number' ? value : Number(value)
                if (name === 'goalsPerMatch') return [n.toFixed(2), 'Goals / match']
                return [value, String(name)]
              }}
            />
            <Bar dataKey="goalsPerMatch" fill="var(--pitch)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
