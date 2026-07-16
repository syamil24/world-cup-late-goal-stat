import type { DashboardData, TournamentStats } from '../lib/stats'
import { CountryFlag } from './CountryFlag'

type Props = {
  tournament: TournamentStats
  allTime: DashboardData['topScorersAllTime']
  lateSpecialists: DashboardData['lateSpecialists']
}

export function Leaders({ tournament, allTime, lateSpecialists }: Props) {
  return (
    <section className="panel leaders" aria-labelledby="leaders-title">
      <h2 id="leaders-title">Leaders</h2>
      <p className="section-desc">
        Golden Boot pace for {tournament.year}, career totals since 1998, and who
        specializes in the last ten minutes.
      </p>

      <div className="leaders-grid">
        <div>
          <h3>{tournament.year} top scorers</h3>
          <ol className="rank-list">
            {tournament.topScorers.slice(0, 8).map((s) => (
              <li key={s.player}>
                <span className="rank-player">
                  <CountryFlag team={s.team} />
                  <span className="rank-player-text">
                    {s.player}
                    <small>{s.team}</small>
                  </span>
                </span>
                <span className="rank-num">{s.goals}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3>Most goals 1998–2026</h3>
          <ol className="rank-list">
            {allTime.slice(0, 8).map((s) => (
              <li key={s.player}>
                <span className="rank-player">
                  <CountryFlag team={s.team} />
                  <span className="rank-player-text">
                    {s.player}
                    <small>
                      {s.team}
                      {s.years.length ? ` · ${s.years.join(', ')}` : ''}
                    </small>
                  </span>
                </span>
                <span className="rank-num">{s.goals}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3>Late-goal specialists</h3>
          <ol className="rank-list">
            {lateSpecialists.slice(0, 8).map((s) => (
              <li key={s.player}>
                <span className="rank-player">
                  <CountryFlag team={s.team} />
                  <span className="rank-player-text">
                    {s.player}
                    <small>
                      {s.team} · {s.lateGoals} late / {s.goals} total
                    </small>
                  </span>
                </span>
                <span className="rank-num">{s.lateGoals}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3>{tournament.year} late-goal teams</h3>
          <ol className="rank-list">
            {tournament.lateGoalTeams.slice(0, 8).map((t) => (
              <li key={t.team}>
                <span className="rank-player">
                  <CountryFlag team={t.team} />
                  <span className="rank-player-text">
                    <small>{t.team}</small>
                  </span>
                </span>
                <span className="rank-num">{t.lateGoals}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
