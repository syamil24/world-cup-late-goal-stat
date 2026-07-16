import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BUCKET_ORDER, type TournamentStats } from '../lib/stats'

type Props = {
  tournaments: TournamentStats[]
}

const COLORS: Record<string, string> = {
  '1-15': '#1a3a2f',
  '16-30': '#245544',
  '31-45+': '#2f6b55',
  '46-60': '#3d8a6a',
  '61-74': '#5a9e4e',
  '75+': '#e8a317',
  ET: '#c45c26',
}

export function TimingProfile({ tournaments }: Props) {
  const data = tournaments.map((t) => {
    const row: Record<string, string | number> = { year: String(t.year) }
    for (const b of BUCKET_ORDER) {
      row[b] = t.buckets[b] ?? 0
    }
    return row
  })

  return (
    <section className="panel" aria-labelledby="timing-title">
      <h2 id="timing-title">When goals arrive</h2>
      <p className="section-desc">
        Goal timing by minute bucket. Amber <strong>75+</strong> = late regulation
        (incl. stoppage); orange <strong>ET</strong> = extra time (not counted as late).
      </p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: 'var(--ink-muted)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--ink-muted)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 4,
              }}
            />
            <Legend />
            {BUCKET_ORDER.map((b) => (
              <Bar key={b} dataKey={b} stackId="timing" fill={COLORS[b]} name={b} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
