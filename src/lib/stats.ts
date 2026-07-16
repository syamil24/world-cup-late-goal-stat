export type Goal = {
  year: number
  player: string
  team: string
  minuteLabel: string
  minuteSort: number
  isLate: boolean
  isExtraTime: boolean
  isPenalty: boolean
  isOwnGoal: boolean
  match: string
  stage: string
  bucket: string
  source: string
}

export type TournamentStats = {
  year: number
  host: string
  matchCount: number
  totalGoals: number
  lateGoals: number
  extraTimeGoals: number
  lateGoalPct: number
  goalsPerMatch: number
  lateGoalsPerMatch: number
  buckets: Record<string, number>
  topScorers: { player: string; goals: number; team: string }[]
  lateGoalTeams: { team: string; lateGoals: number }[]
}

export type DashboardData = {
  generatedAt: string
  years: number[]
  lateGoalDefinition: string
  tournaments: TournamentStats[]
  comparison: {
    historicAvgLateGoalPct: number
    historicAvgLateGoalsPerMatch: number
    year2026: TournamentStats
    latePctDelta: number
    latePerMatchDelta: number
  }
  topScorersAllTime: {
    player: string
    goals: number
    lateGoals: number
    team: string
    years: number[]
  }[]
  lateSpecialists: {
    player: string
    lateGoals: number
    goals: number
    team: string
    years: number[]
  }[]
}

export const BUCKET_ORDER = [
  '1-15',
  '16-30',
  '31-45+',
  '46-60',
  '61-74',
  '75+',
  'ET',
] as const

export async function loadDashboardData(): Promise<{
  stats: DashboardData
  lateGoals: Goal[]
}> {
  const [statsRes, lateRes] = await Promise.all([
    fetch('/data/tournament-stats.json'),
    fetch('/data/late-goals.json'),
  ])
  if (!statsRes.ok || !lateRes.ok) {
    throw new Error('Failed to load local stats JSON from /data/')
  }
  const stats = (await statsRes.json()) as DashboardData
  const lateGoals = (await lateRes.json()) as Goal[]
  return { stats, lateGoals }
}

export function tournamentByYear(
  stats: DashboardData,
  year: number,
): TournamentStats | undefined {
  return stats.tournaments.find((t) => t.year === year)
}
