import type { DashboardData } from '../lib/stats'

type Props = {
  comparison: DashboardData['comparison']
}

export function Callout2026({ comparison }: Props) {
  const y = comparison.year2026
  const higherPct = comparison.latePctDelta > 0
  const higherRate = comparison.latePerMatchDelta > 0

  return (
    <section className="callout" aria-labelledby="callout-title">
      <div className="callout-top">
        <div>
          <p className="eyebrow">2026 spotlight</p>
          <h2 id="callout-title">Is this World Cup unusually late?</h2>
        </div>
        <div className="match-clock" title="Late-goal window">
          <span className="match-clock-label">From</span>
          <span className="match-clock-time">75&apos;</span>
        </div>
      </div>
      <p className="lede">
        Compared with the average of 1998–2022, 2026 is{' '}
        <strong>
          {higherPct ? 'slightly later' : comparison.latePctDelta === 0 ? 'on par' : 'slightly earlier'}
        </strong>{' '}
        by share of goals after 75', and{' '}
        <strong>
          {higherRate ? 'higher' : comparison.latePerMatchDelta === 0 ? 'even' : 'lower'}
        </strong>{' '}
        on late goals per match.
      </p>

      <div className="callout-metrics">
        <div className="metric">
          <span className="metric-value">{y.lateGoals}</span>
          <span className="metric-label">Late goals (75'+)</span>
        </div>
        <div className="metric">
          <span className="metric-value">{y.lateGoalPct}%</span>
          <span className="metric-label">
            of all goals
            <span className="delta">
              {' '}
              ({comparison.latePctDelta >= 0 ? '+' : ''}
              {comparison.latePctDelta} vs avg {comparison.historicAvgLateGoalPct}%)
            </span>
          </span>
        </div>
        <div className="metric">
          <span className="metric-value">{y.lateGoalsPerMatch}</span>
          <span className="metric-label">
            late / match
            <span className="delta">
              {' '}
              ({comparison.latePerMatchDelta >= 0 ? '+' : ''}
              {comparison.latePerMatchDelta} vs avg{' '}
              {comparison.historicAvgLateGoalsPerMatch})
            </span>
          </span>
        </div>
        <div className="metric">
          <span className="metric-value">{y.totalGoals}</span>
          <span className="metric-label">
            total goals · {y.matchCount} matches played
          </span>
        </div>
      </div>
    </section>
  )
}
