import { useEffect, useMemo, useState } from 'react'
import type { Goal } from '../lib/stats'
import { CountryFlag } from './CountryFlag'

const PAGE_SIZE = 20

type Props = {
  lateGoals: Goal[]
  year: number
}

export function LateGoalsBrowser({ lateGoals, year }: Props) {
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return lateGoals
      .filter((g) => g.year === year)
      .sort(
        (a, b) =>
          b.minuteSort - a.minuteSort || a.player.localeCompare(b.player),
      )
  }, [lateGoals, year])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [year])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, filtered.length)

  return (
    <section className="panel" aria-labelledby="browser-title">
      <div className="browser-head">
        <div>
          <h2 id="browser-title">Late-goal browser · {year}</h2>
          <p className="section-desc">
            Regulation goals from 75′ onward (incl. stoppage). Extra time excluded.
          </p>
        </div>
      </div>

      <p className="table-scroll-hint" aria-hidden="true">
        <span>Swipe sideways for match &amp; stage</span>
        <span className="table-scroll-hint-arrow">→</span>
      </p>

      <div className="table-scroll-wrap">
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Late goals table, scroll horizontally for more columns"
        >
          <table className="goal-table">
            <thead>
              <tr>
                <th>Minute</th>
                <th>Player</th>
                <th>Team</th>
                <th>Match</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((g, i) => (
                <tr key={`${g.match}-${g.player}-${g.minuteLabel}-${from + i}`}>
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
      </div>

      <div className="pager">
        <p className="table-meta">
          {filtered.length === 0
            ? `No late goals in ${year}`
            : `Showing ${from}–${to} of ${filtered.length} late goals`}
        </p>
        <div className="pager-controls">
          <button
            type="button"
            className="pager-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="pager-status">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="pager-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
