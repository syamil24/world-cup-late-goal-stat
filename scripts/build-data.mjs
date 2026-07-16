/**
 * Downloads (or uses cached) World Cup goal data and emits static JSON for the dashboard.
 * End users only load public/data/*.json — they never hit these sources.
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const RAW = join(ROOT, 'data', 'raw')
const OUT = join(ROOT, 'public', 'data')

const YEARS = [1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026]
const HISTORIC = YEARS.filter((y) => y < 2026)

const URLS = {
  goals:
    'https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/goals.csv',
  matches:
    'https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/matches.csv',
  wc2026:
    'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json',
}

const BUCKETS = [
  '1-15',
  '16-30',
  '31-45+',
  '46-60',
  '61-74',
  '75+',
  'ET',
]

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function ensureRaw(force = false) {
  await mkdir(RAW, { recursive: true })
  const files = [
    ['goals.csv', URLS.goals],
    ['matches.csv', URLS.matches],
    ['worldcup-2026.json', URLS.wc2026],
  ]
  for (const [name, url] of files) {
    const path = join(RAW, name)
    if (!force && (await exists(path))) {
      console.log(`Using cached ${name}`)
      continue
    }
    console.log(`Downloading ${name}…`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
    await writeFile(path, Buffer.from(await res.arrayBuffer()))
  }
}

/** Minimal CSV parser supporting quotes */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some((v) => v !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    if (row.some((v) => v !== '')) rows.push(row)
  }
  const headers = rows[0]
  return rows.slice(1).map((r) => {
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = r[i] ?? ''
    })
    return obj
  })
}

function playerName(given, family) {
  return [given, family].filter(Boolean).join(' ').trim() || 'Unknown'
}

function isExtraTimePeriod(period) {
  return String(period).toLowerCase().includes('extra time')
}

function classifyMinute(minuteRegulation, minuteStoppage, matchPeriod) {
  const reg = Number(minuteRegulation) || 0
  const stop = Number(minuteStoppage) || 0
  const et = isExtraTimePeriod(matchPeriod)

  let minuteLabel
  if (et) {
    minuteLabel = stop > 0 ? `${reg}+${stop}'` : `${reg}'`
  } else if (reg === 45 && stop > 0) {
    minuteLabel = `45+${stop}'`
  } else if (reg === 90 && stop > 0) {
    minuteLabel = `90+${stop}'`
  } else {
    minuteLabel = `${reg}'`
  }

  const minuteSort = et ? 90 + (reg >= 90 ? reg - 90 : reg) + stop / 100 : reg + stop / 100

  const isExtraTime = et
  // Late = regulation 75+ including 90+ stoppage; exclude ET
  const isLate = !et && reg >= 75

  let bucket
  if (et) bucket = 'ET'
  else if (reg <= 15) bucket = '1-15'
  else if (reg <= 30) bucket = '16-30'
  else if (reg <= 45) bucket = '31-45+'
  else if (reg <= 60) bucket = '46-60'
  else if (reg < 75) bucket = '61-74'
  else bucket = '75+'

  return { minuteLabel, minuteSort, isLate, isExtraTime, bucket }
}

/**
 * Parse openfootball minute strings like "90+4", "80", "108", "92".
 * Plain minutes > 90 are only real extra time when the match has score.et;
 * otherwise treat 91–99 as second-half stoppage (90+N), same late-goal bucket.
 */
function parseOpenfootballMinute(raw, matchWentToExtraTime = false) {
  const s = String(raw).trim()
  const plus = /^(\d+)\+(\d+)$/.exec(s)
  if (plus) {
    const reg = Number(plus[1])
    const stop = Number(plus[2])
    // 120+1 etc. is ET stoppage; 90+N / 45+N is regulation stoppage
    const et = reg > 90
    return classifyMinute(reg, stop, et ? 'extra time, second half' : 'second half')
  }
  const n = Number(s)
  if (Number.isNaN(n)) {
    return classifyMinute(0, 0, 'second half')
  }
  if (n > 90) {
    if (matchWentToExtraTime) {
      return classifyMinute(n, 0, 'extra time, second half')
    }
    // e.g. "92" with no ET score → 90+2 stoppage, not extra time
    const stop = n - 90
    return classifyMinute(90, stop, 'second half')
  }
  return classifyMinute(n, 0, n <= 45 ? 'first half' : 'second half')
}

function emptyBuckets() {
  return Object.fromEntries(BUCKETS.map((b) => [b, 0]))
}

function buildAggregates(goals, matchCounts) {
  const byYear = {}
  for (const year of YEARS) {
    byYear[year] = {
      year,
      host: HOSTS[year] ?? '',
      matchCount: matchCounts[year] ?? 0,
      totalGoals: 0,
      lateGoals: 0,
      extraTimeGoals: 0,
      lateGoalPct: 0,
      goalsPerMatch: 0,
      lateGoalsPerMatch: 0,
      buckets: emptyBuckets(),
      topScorers: [],
      lateGoalTeams: [],
    }
  }

  const scorerMap = {} // year -> name -> { goals, teams: Record<string, number> }
  const lateTeamMap = {} // year -> team -> count
  const allScorers = {} // name -> { player, goals, lateGoals, years, teams }

  for (const g of goals) {
    const t = byYear[g.year]
    if (!t) continue
    t.totalGoals++
    t.buckets[g.bucket] = (t.buckets[g.bucket] ?? 0) + 1
    if (g.isLate) t.lateGoals++
    if (g.isExtraTime) t.extraTimeGoals++

    if (!scorerMap[g.year]) scorerMap[g.year] = {}
    if (!g.isOwnGoal) {
      if (!scorerMap[g.year][g.player]) {
        scorerMap[g.year][g.player] = { goals: 0, teams: {} }
      }
      scorerMap[g.year][g.player].goals++
      scorerMap[g.year][g.player].teams[g.team] =
        (scorerMap[g.year][g.player].teams[g.team] ?? 0) + 1

      if (!allScorers[g.player]) {
        allScorers[g.player] = {
          player: g.player,
          goals: 0,
          lateGoals: 0,
          years: new Set(),
          teams: {},
        }
      }
      allScorers[g.player].goals++
      allScorers[g.player].years.add(g.year)
      allScorers[g.player].teams[g.team] = (allScorers[g.player].teams[g.team] ?? 0) + 1
      if (g.isLate) allScorers[g.player].lateGoals++
    }

    if (g.isLate) {
      if (!lateTeamMap[g.year]) lateTeamMap[g.year] = {}
      lateTeamMap[g.year][g.team] = (lateTeamMap[g.year][g.team] ?? 0) + 1
    }
  }

  function primaryTeam(teams) {
    return (
      Object.entries(teams).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      )[0]?.[0] ?? ''
    )
  }

  for (const year of YEARS) {
    const t = byYear[year]
    const mc = t.matchCount || 1
    t.lateGoalPct = t.totalGoals ? Math.round((t.lateGoals / t.totalGoals) * 1000) / 10 : 0
    t.goalsPerMatch = Math.round((t.totalGoals / mc) * 100) / 100
    t.lateGoalsPerMatch = Math.round((t.lateGoals / mc) * 100) / 100
    t.topScorers = Object.entries(scorerMap[year] ?? {})
      .map(([player, info]) => ({
        player,
        goals: info.goals,
        team: primaryTeam(info.teams),
      }))
      .sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player))
      .slice(0, 10)
    t.lateGoalTeams = Object.entries(lateTeamMap[year] ?? {})
      .map(([team, lateGoals]) => ({ team, lateGoals }))
      .sort((a, b) => b.lateGoals - a.lateGoals || a.team.localeCompare(b.team))
      .slice(0, 10)
  }

  const historic = HISTORIC.map((y) => byYear[y])
  const avgLatePct =
    historic.reduce((s, t) => s + t.lateGoalPct, 0) / (historic.length || 1)
  const avgLatePerMatch =
    historic.reduce((s, t) => s + t.lateGoalsPerMatch, 0) / (historic.length || 1)

  const comparison = {
    historicAvgLateGoalPct: Math.round(avgLatePct * 10) / 10,
    historicAvgLateGoalsPerMatch: Math.round(avgLatePerMatch * 100) / 100,
    year2026: byYear[2026],
    latePctDelta: Math.round((byYear[2026].lateGoalPct - avgLatePct) * 10) / 10,
    latePerMatchDelta:
      Math.round((byYear[2026].lateGoalsPerMatch - avgLatePerMatch) * 100) / 100,
  }

  const topScorersAllTime = Object.values(allScorers)
    .map((s) => ({
      player: s.player,
      goals: s.goals,
      lateGoals: s.lateGoals,
      team: primaryTeam(s.teams),
      years: [...s.years].sort(),
    }))
    .sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player))
    .slice(0, 15)

  const lateSpecialists = Object.values(allScorers)
    .filter((s) => s.lateGoals > 0)
    .map((s) => ({
      player: s.player,
      lateGoals: s.lateGoals,
      goals: s.goals,
      team: primaryTeam(s.teams),
      years: [...s.years].sort(),
    }))
    .sort((a, b) => b.lateGoals - a.lateGoals || b.goals - a.goals)
    .slice(0, 15)

  return {
    generatedAt: new Date().toISOString(),
    years: YEARS,
    lateGoalDefinition:
      'Goals scored at minute 75 or later in regulation (including 90+ stoppage). Extra-time goals are tracked separately.',
    tournaments: YEARS.map((y) => byYear[y]),
    comparison,
    topScorersAllTime,
    lateSpecialists,
  }
}

const HOSTS = {
  1998: 'France',
  2002: 'Korea / Japan',
  2006: 'Germany',
  2010: 'South Africa',
  2014: 'Brazil',
  2018: 'Russia',
  2022: 'Qatar',
  2026: 'USA / Canada / Mexico',
}

async function main() {
  const force = process.argv.includes('--force')
  await ensureRaw(force)
  await mkdir(OUT, { recursive: true })

  const goalsRows = parseCsv(await readFile(join(RAW, 'goals.csv'), 'utf8'))
  const matchRows = parseCsv(await readFile(join(RAW, 'matches.csv'), 'utf8'))
  const wc2026 = JSON.parse(await readFile(join(RAW, 'worldcup-2026.json'), 'utf8'))

  const matchCounts = {}
  for (const year of HISTORIC) {
    const tid = `WC-${year}`
    matchCounts[year] = matchRows.filter(
      (m) => m.tournament_id === tid && !String(m.tournament_name).includes('Women'),
    ).length
  }

  const goals = []

  for (const row of goalsRows) {
    if (!row.tournament_id?.startsWith('WC-')) continue
    if (String(row.tournament_name).includes('Women')) continue
    const year = Number(row.tournament_id.replace('WC-', ''))
    if (!HISTORIC.includes(year)) continue

    const cls = classifyMinute(
      row.minute_regulation,
      row.minute_stoppage,
      row.match_period,
    )
    goals.push({
      year,
      player: playerName(row.given_name, row.family_name),
      team: row.team_name,
      minuteLabel: row.minute_label || cls.minuteLabel,
      minuteSort: cls.minuteSort,
      isLate: cls.isLate,
      isExtraTime: cls.isExtraTime,
      isPenalty: row.penalty === '1',
      isOwnGoal: row.own_goal === '1',
      match: row.match_name,
      stage: row.stage_name,
      bucket: cls.bucket,
      source: 'fjelstul',
    })
  }

  // 2026 from openfootball — count played matches (have score.ft)
  let played2026 = 0
  for (const m of wc2026.matches ?? []) {
    if (!m.score?.ft) continue
    played2026++
    const stage = m.round || m.group || ''
    const matchName = `${m.team1} vs ${m.team2}`
    const wentToEt = Boolean(m.score?.et)

    for (const g of m.goals1 ?? []) {
      const cls = parseOpenfootballMinute(g.minute, wentToEt)
      goals.push({
        year: 2026,
        player: g.name,
        team: m.team1,
        minuteLabel: cls.minuteLabel,
        minuteSort: cls.minuteSort,
        isLate: cls.isLate,
        isExtraTime: cls.isExtraTime,
        isPenalty: Boolean(g.penalty),
        isOwnGoal: Boolean(g.owngoal || g.own_goal),
        match: matchName,
        stage,
        bucket: cls.bucket,
        source: 'openfootball',
      })
    }
    for (const g of m.goals2 ?? []) {
      const cls = parseOpenfootballMinute(g.minute, wentToEt)
      goals.push({
        year: 2026,
        player: g.name,
        team: m.team2,
        minuteLabel: cls.minuteLabel,
        minuteSort: cls.minuteSort,
        isLate: cls.isLate,
        isExtraTime: cls.isExtraTime,
        isPenalty: Boolean(g.penalty),
        isOwnGoal: Boolean(g.owngoal || g.own_goal),
        match: matchName,
        stage,
        bucket: cls.bucket,
        source: 'openfootball',
      })
    }
  }
  matchCounts[2026] = played2026 || (wc2026.matches?.length ?? 0)

  goals.sort((a, b) => a.year - b.year || a.minuteSort - b.minuteSort || a.player.localeCompare(b.player))

  const stats = buildAggregates(goals, matchCounts)
  const lateGoals = goals.filter((g) => g.isLate)

  await writeFile(join(OUT, 'goals.json'), JSON.stringify(goals))
  await writeFile(join(OUT, 'late-goals.json'), JSON.stringify(lateGoals))
  await writeFile(join(OUT, 'tournament-stats.json'), JSON.stringify(stats, null, 2))

  console.log(`Wrote ${goals.length} goals (${lateGoals.length} late) → public/data/`)
  for (const t of stats.tournaments) {
    console.log(
      `  ${t.year}: ${t.totalGoals} goals, ${t.lateGoals} late (${t.lateGoalPct}%), ${t.matchCount} matches`,
    )
  }
  console.log(
    `2026 vs historic avg late%: ${stats.comparison.year2026.lateGoalPct}% vs ${stats.comparison.historicAvgLateGoalPct}% (Δ ${stats.comparison.latePctDelta})`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
