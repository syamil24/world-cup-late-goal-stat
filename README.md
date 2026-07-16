# World Cup Late Goals

Static dashboard comparing **late goals** across men's FIFA World Cups from **1998 through 2026**, with a spotlight on whether **2026** is unusually late-scoring.

**Live idea:** goals from the **75th minute** through the end of regulation (including stoppage / `90+N`). The 30 minutes of **extra time are not** counted as late goals — they are tracked separately.

Demo stack: Vite + React + TypeScript + Recharts. Stats are **bundled as local JSON** under `public/data/` — visitors never call Fjelstul, openfootball, or any World Cup API at runtime.

## Quick start

```bash
npm install
npm run build-data   # generate public/data/*.json
npm run dev          # http://localhost:5173
```

Production:

```bash
npm run build
npm run preview
```

## Features

- **2026 callout** — late-goal count, share of all goals, and late goals per match vs 1998–2022 averages
- **Cross-tournament charts** — late goals, timing buckets, scoring rate
- **Leaders** — top scorers, late-goal specialists, late-goal teams (with country flags)
- **Late-goal browser** — filterable list of every regulation 75′+ goal
- Pitch / stadium theme with poster background

## Late-goal definition

| Included | Excluded |
|----------|----------|
| Minute ≥ **75** in normal time | Extra time (ET / 91–120) |
| Second-half stoppage (`90+1`, `90+2`, …) | Penalty shootouts |

**Note:** Some media articles use the “final 15 minutes” as **from the 76th minute**. This project uses **≥ 75** as the late window. Totals can also differ slightly from Opta/FIFA feeds because **2026** is sourced from openfootball (community JSON), which may be one match ahead/behind a given article.

## Data sources

| Years | Source | License |
|-------|--------|---------|
| 1998–2022 | [jfjelstul/worldcup](https://github.com/jfjelstul/worldcup) (`goals.csv`, `matches.csv`) | [CC-BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — attribution required |
| 2026 | [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) | Public domain |

Attribution appears in the app footer.

## Refresh 2026 data

Re-download sources and rebuild JSON (e.g. after new knockout matches):

```bash
npm run build-data:force
```

Then commit updated files under `public/data/` if you want the repo snapshot refreshed.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run build-data` | Build `public/data/` from cached or downloaded raw files |
| `npm run build-data:force` | Re-download raw files, then rebuild |
| `npm run dev` | Vite dev server |
| `npm run build` | Data + TypeScript + production build |
| `npm run preview` | Preview the production build |

## Project layout

```
scripts/build-data.mjs     # ETL → public/data/
data/raw/                  # cached downloads (gitignored)
public/data/               # goals.json, late-goals.json, tournament-stats.json
public/images/             # hero / background artwork
src/                       # React dashboard
```

## License

App code in this repository is available for use with the project. Upstream datasets remain under their own licenses (see table above). Hero artwork and favicon are original assets for this project (not official FIFA marks).
