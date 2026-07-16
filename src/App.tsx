import { useEffect, useState } from 'react'
import { AmbientPitch } from './components/AmbientPitch'
import { Callout2026 } from './components/Callout2026'
import { GoalsPerMatchChart } from './components/GoalsPerMatchChart'
import { LateGoalsBrowser } from './components/LateGoalsBrowser'
import { LateGoalsChart } from './components/LateGoalsChart'
import { Leaders } from './components/Leaders'
import { TimingProfile } from './components/TimingProfile'
import {
  loadDashboardData,
  tournamentByYear,
  type DashboardData,
  type Goal,
} from './lib/stats'
import './styles.css'

export default function App() {
  const [stats, setStats] = useState<DashboardData | null>(null)
  const [lateGoals, setLateGoals] = useState<Goal[]>([])
  const [year, setYear] = useState(2026)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadDashboardData()
      .then(({ stats: s, lateGoals: lg }) => {
        if (cancelled) return
        setStats(s)
        setLateGoals(lg)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load data')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="page">
        <AmbientPitch />
        <p className="error">{error}. Run npm run build-data first.</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="page">
        <AmbientPitch />
        <p className="loading">Loading tournament stats…</p>
      </div>
    )
  }

  const selected = tournamentByYear(stats, year) ?? stats.tournaments.at(-1)!

  return (
    <div className="page">
      <AmbientPitch />

      <header className="hero">
        <div className="hero-copy">
          <div className="hero-badge-row">
            <span className="hero-badge">Men&apos;s FIFA · 1998–2026</span>
            <span className="hero-badge hero-badge--gold">Late drama · 75&apos;+</span>
          </div>
          <p className="brand">World Cup Late Goals</p>
          <h1>Who scores when the clock is cruel?</h1>
          <p className="hero-sub">
            Goals from the 75th minute through the end of regulation — including
            stoppage time. The 30 minutes of extra time are not counted as late goals.
          </p>
          <label className="year-picker">
            <span className="year-picker-label">Tap to switch tournament</span>
            <span className="year-picker-control">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                aria-label="Select World Cup tournament"
              >
                {[...stats.years].reverse().map((y) => (
                  <option key={y} value={y}>
                    {y} · {tournamentByYear(stats, y)?.host}
                  </option>
                ))}
              </select>
              <span className="year-picker-chevron" aria-hidden>
                ▾
              </span>
            </span>
          </label>
        </div>
      </header>

      <main className="pitch-sheet">
        <Callout2026 comparison={stats.comparison} />
        <LateGoalsChart tournaments={stats.tournaments} highlightYear={year} />
        <div className="two-col">
          <TimingProfile tournaments={stats.tournaments} />
          <GoalsPerMatchChart tournaments={stats.tournaments} />
        </div>
        <LateGoalsBrowser lateGoals={lateGoals} year={year} />
        <Leaders
          tournament={selected}
          allTime={stats.topScorersAllTime}
          lateSpecialists={stats.lateSpecialists}
        />
      </main>

      <footer className="site-footer">
        <p>
          Late goal = minute ≥ 75 in regulation (incl. 90+ stoppage); extra time is
          excluded. Data for 1998–2022 from{' '}
          <a
            href="https://github.com/jfjelstul/worldcup"
            target="_blank"
            rel="noreferrer"
          >
            Josh Fjelstul&apos;s World Cup Database
          </a>{' '}
          (CC-BY-NC-SA 4.0). 2026 from{' '}
          <a
            href="https://github.com/openfootball/worldcup.json"
            target="_blank"
            rel="noreferrer"
          >
            openfootball/worldcup.json
          </a>{' '}
          (public domain). Stats are bundled locally — refresh with{' '}
          <code>npm run build-data</code>.
        </p>
        <p className="generated">Generated {new Date(stats.generatedAt).toLocaleString()}</p>
      </footer>
    </div>
  )
}
