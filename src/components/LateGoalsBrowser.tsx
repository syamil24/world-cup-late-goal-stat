import { useMemo, useState } from 'react'
import type { Goal } from '../lib/stats'
import { CountryFlag } from './CountryFlag'

type Props = {
  lateGoals: Goal[]
  years: number[]
  defaultYear: number
}

export function LateGoalsBrowser({ lateGoals, years, defaultYear }: Props) {
  const [year, setYear] = useState<number | 'all'>(defaultYear)

  const filtered = useMemo(() => {
    const list = year === 'all' ? lateGoals : lateGoals.filter((g) => g.year === year)
    return [...list].sort(
      (a, b) => b.year - a.year || b.minuteSort - a.minuteSort || a.player.localeCompare(b.player),
    )
  }, [lateGoals, year])

  return (
    <section className="panel" aria-labelledby="browser-title">
      <div className="browser-head">
        <div>
          <h2 id="browser-title">Late-goal browser</h2>
          <p className="section-desc">
            Regulation goals from 75′ onward (incl. stoppage). Extra time excluded.
          </p>
        </div>
        <label className="year-filter">
          <span>Year</span>
          <select
            value={year}
            onChange={(e) => {
              const v = e.target.value
              setYear(v === 'all' ? 'all' : Number(v))
            }}
          >
            <option value="all">All tournaments</option>
            {[...years].reverse().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-scroll">
        <table className="goal-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Minute</th>
              <th>Player</th>
              <th>Team</th>
              <th>Match</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g, i) => (
              <tr key={`${g.year}-${g.match}-${g.player}-${g.minuteLabel}-${i}`}>
                <td>{g.year}</td>
                <td className="minute">
                  {g.minuteLabel}
                  {g.isPenalty ? ' (P)' : ''}
                  {g.isOwnGoal ? ' (OG)' : ''}
                </td>
                <td>{g.player}</td>
                <td>
                  <span className="team-cell">
                    <CountryFlag team={g.team} />
                    <span className="team-cell-name">{g.team}</span>
                  </span>
                </td>
                <td>{g.match}</td>
                <td>{g.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-meta">{filtered.length} late goals shown</p>
    </section>
  )
}
