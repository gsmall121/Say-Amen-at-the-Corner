'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { MastersScoresResponse, ESPNPlayerScore } from '@/app/api/masters-scores/route';

// ─────────────────────────────────────────────
// PICKS DATA  (10 picks per person: 3 orange + 3 blue + 3 green + 1 grey)
// Drop 2 worst → sum of best 8
// ─────────────────────────────────────────────

type Tier = 'orange' | 'blue' | 'green' | 'grey';

interface PlayerPick {
  name: string;
  tier: Tier;
}

interface PoolEntry {
  poolName: string;
  players: PlayerPick[];
}

function p(name: string, tier: Tier): PlayerPick {
  return { name, tier };
}

const POOL: PoolEntry[] = [
  {
    poolName: 'Geo',
    players: [
      p('Scottie Scheffler', 'orange'), p('Bryson DeChambeau', 'orange'), p('Xander Schauffele', 'orange'),
      p('Matthew Fitzpatrick', 'blue'),  p('Robert MacIntyre', 'blue'),    p('Brooks Koepka', 'blue'),
      p('Adam Scott', 'green'),          p('Jake Knapp', 'green'),          p('Corey Conners', 'green'),
      p('Daniel Berger', 'grey'),
    ],
  },
  {
    poolName: 'Brandon Skordas',
    players: [
      p('Scottie Scheffler', 'orange'), p('Jon Rahm', 'orange'),           p('Xander Schauffele', 'orange'),
      p('Hideki Matsuyama', 'blue'),    p('Collin Morikawa', 'blue'),       p('Brooks Koepka', 'blue'),
      p('Russell Henley', 'green'),     p('Patrick Cantlay', 'green'),      p('Corey Conners', 'green'),
      p('Cameron Smith', 'grey'),
    ],
  },
  {
    poolName: 'Jack Dayton',
    players: [
      p('Bryson DeChambeau', 'orange'), p('Ludvig Aberg', 'orange'),       p('Xander Schauffele', 'orange'),
      p('Tommy Fleetwood', 'blue'),     p('Matthew Fitzpatrick', 'blue'),   p('Min Woo Lee', 'blue'),
      p('Justin Thomas', 'green'),      p('Shane Lowry', 'green'),          p('Maverick McNealy', 'green'),
      p('Ben Griffin', 'grey'),
    ],
  },
  {
    poolName: 'Ben Snyder',
    players: [
      p('Scottie Scheffler', 'orange'), p('Bryson DeChambeau', 'orange'),  p('Rory McIlroy', 'orange'),
      p('Matthew Fitzpatrick', 'blue'),  p('Collin Morikawa', 'blue'),      p('Justin Rose', 'blue'),
      p('Si Woo Kim', 'green'),          p('Akshay Bhatia', 'green'),       p('J.J. Spaun', 'green'),
      p('Ben Griffin', 'grey'),
    ],
  },
  {
    poolName: 'Grambledore',
    players: [
      p('Scottie Scheffler', 'orange'), p('Bryson DeChambeau', 'orange'),  p('Ludvig Aberg', 'orange'),
      p('Cameron Young', 'blue'),        p('Tommy Fleetwood', 'blue'),      p('Matthew Fitzpatrick', 'blue'),
      p('Russell Henley', 'green'),      p('Sepp Straka', 'green'),         p('Maverick McNealy', 'green'),
      p('Cameron Smith', 'grey'),
    ],
  },
  {
    poolName: 'Charlie Kramer',
    players: [
      p('Scottie Scheffler', 'orange'), p('Bryson DeChambeau', 'orange'),  p('Xander Schauffele', 'orange'),
      p('Tommy Fleetwood', 'blue'),      p('Justin Rose', 'blue'),          p('Christopher Gotterup', 'blue'),
      p('Si Woo Kim', 'green'),          p('Akshay Bhatia', 'green'),       p('Adam Scott', 'green'),
      p('Ryan Fox', 'grey'),
    ],
  },
  {
    poolName: 'GG',
    players: [
      p('Jon Rahm', 'orange'),           p('Rory McIlroy', 'orange'),       p('Xander Schauffele', 'orange'),
      p('Tommy Fleetwood', 'blue'),       p('Matthew Fitzpatrick', 'blue'),  p('Hideki Matsuyama', 'blue'),
      p('Si Woo Kim', 'green'),           p('Jake Knapp', 'green'),          p('Tyrrell Hatton', 'green'),
      p('Sungjae Im', 'grey'),
    ],
  },
  {
    poolName: 'Edwinta',
    players: [
      p('Scottie Scheffler', 'orange'), p('Bryson DeChambeau', 'orange'),  p('Xander Schauffele', 'orange'),
      p('Matthew Fitzpatrick', 'blue'),  p('Collin Morikawa', 'blue'),      p('Min Woo Lee', 'blue'),
      p('Akshay Bhatia', 'green'),       p('Adam Scott', 'green'),          p('Corey Conners', 'green'),
      p('Sungjae Im', 'grey'),
    ],
  },
  {
    poolName: "Jack Dayton's Real Picks",
    players: [
      p('Jon Rahm', 'orange'),           p('Ludvig Aberg', 'orange'),       p('Xander Schauffele', 'orange'),
      p('Tommy Fleetwood', 'blue'),       p('Min Woo Lee', 'blue'),          p('Viktor Hovland', 'blue'),
      p('Akshay Bhatia', 'green'),        p('Patrick Cantlay', 'green'),     p('Sepp Straka', 'green'),
      p('Ben Griffin', 'grey'),
    ],
  },
  {
    poolName: 'Reid B',
    players: [
      p('Scottie Scheffler', 'orange'), p('Rory McIlroy', 'orange'),        p('Xander Schauffele', 'orange'),
      p('Hideki Matsuyama', 'blue'),     p('Brooks Koepka', 'blue'),         p('Jordan Spieth', 'blue'),
      p('Patrick Cantlay', 'green'),     p('J.J. Spaun', 'green'),           p('Maverick McNealy', 'green'),
      p('Sungjae Im', 'grey'),
    ],
  },
  {
    poolName: 'SANTOS',
    players: [
      p('Scottie Scheffler', 'orange'), p('Jon Rahm', 'orange'),            p('Xander Schauffele', 'orange'),
      p('Cameron Young', 'blue'),        p('Tommy Fleetwood', 'blue'),       p('Patrick Reed', 'blue'),
      p('Jason Day', 'green'),           p('Nicolai Hojgaard', 'green'),    p('Corey Conners', 'green'),
      p('Harris English', 'grey'),
    ],
  },
  {
    poolName: 'Kevin McInerney',
    players: [
      p('Jon Rahm', 'orange'),           p('Ludvig Aberg', 'orange'),        p('Xander Schauffele', 'orange'),
      p('Matthew Fitzpatrick', 'blue'),   p('Robert MacIntyre', 'blue'),      p('Patrick Reed', 'blue'),
      p('Adam Scott', 'green'),           p('Corey Conners', 'green'),        p('Maverick McNealy', 'green'),
      p('Ryan Fox', 'grey'),
    ],
  },
  {
    poolName: 'Casey Halpern',
    players: [
      p('Jon Rahm', 'orange'),           p('Ludvig Aberg', 'orange'),        p('Xander Schauffele', 'orange'),
      p('Cameron Young', 'blue'),         p('Hideki Matsuyama', 'blue'),      p('Patrick Reed', 'blue'),
      p('Si Woo Kim', 'green'),           p('Adam Scott', 'green'),           p('Jacob Bridgeman', 'green'),
      p('Cameron Smith', 'grey'),
    ],
  },
  {
    poolName: 'John Wertimer',
    players: [
      p('Scottie Scheffler', 'orange'), p('Jon Rahm', 'orange'),             p('Rory McIlroy', 'orange'),
      p('Cameron Young', 'blue'),        p('Tommy Fleetwood', 'blue'),        p('Matthew Fitzpatrick', 'blue'),
      p('Si Woo Kim', 'green'),          p('Akshay Bhatia', 'green'),         p('Jason Day', 'green'),
      p('Daniel Berger', 'grey'),
    ],
  },
  {
    poolName: 'Leo',
    players: [
      p('Scottie Scheffler', 'orange'), p('Bryson DeChambeau', 'orange'),   p('Rory McIlroy', 'orange'),
      p('Tommy Fleetwood', 'blue'),      p('Hideki Matsuyama', 'blue'),      p('Brooks Koepka', 'blue'),
      p('Shane Lowry', 'green'),         p('J.J. Spaun', 'green'),           p('Nicolai Hojgaard', 'green'),
      p('Harris English', 'grey'),
    ],
  },
  {
    poolName: 'Keisman',
    players: [
      p('Scottie Scheffler', 'orange'), p('Rory McIlroy', 'orange'),        p('Ludvig Aberg', 'orange'),
      p('Tommy Fleetwood', 'blue'),      p('Hideki Matsuyama', 'blue'),      p('Min Woo Lee', 'blue'),
      p('Justin Thomas', 'green'),       p('Patrick Cantlay', 'green'),      p('Corey Conners', 'green'),
      p('Cameron Smith', 'grey'),
    ],
  },
  {
    poolName: 'Cori Pitiger',
    players: [
      p('Scottie Scheffler', 'orange'), p('Bryson DeChambeau', 'orange'),   p('Xander Schauffele', 'orange'),
      p('Cameron Young', 'blue'),        p('Tommy Fleetwood', 'blue'),       p('Matthew Fitzpatrick', 'blue'),
      p('Akshay Bhatia', 'green'),       p('Adam Scott', 'green'),           p('Tyrrell Hatton', 'green'),
      p('Daniel Berger', 'grey'),
    ],
  },
  {
    poolName: 'Brett Goldstein',
    players: [
      p('Scottie Scheffler', 'orange'), p('Rory McIlroy', 'orange'),        p('Xander Schauffele', 'orange'),
      p('Cameron Young', 'blue'),        p('Matthew Fitzpatrick', 'blue'),   p('Brooks Koepka', 'blue'),
      p('Tyrrell Hatton', 'green'),      p('Nicolai Hojgaard', 'green'),    p('Maverick McNealy', 'green'),
      p('Harry Hall', 'grey'),
    ],
  },
  {
    poolName: 'Yannington',
    players: [
      p('Scottie Scheffler', 'orange'), p('Ludvig Aberg', 'orange'),        p('Xander Schauffele', 'orange'),
      p('Cameron Young', 'blue'),        p('Tommy Fleetwood', 'blue'),       p('Jordan Spieth', 'blue'),
      p('Tyrrell Hatton', 'green'),      p('Nicolai Hojgaard', 'green'),    p('Corey Conners', 'green'),
      p('Sungjae Im', 'grey'),
    ],
  },
  {
    poolName: 'Griff',
    players: [
      p('Scottie Scheffler', 'orange'), p('Jon Rahm', 'orange'),            p('Ludvig Aberg', 'orange'),
      p('Cameron Young', 'blue'),        p('Matthew Fitzpatrick', 'blue'),   p('Justin Rose', 'blue'),
      p('Russell Henley', 'green'),      p('Akshay Bhatia', 'green'),        p('Adam Scott', 'green'),
      p('Harris English', 'grey'),
    ],
  },
];

// ─────────────────────────────────────────────
// NAME MATCHING
// ─────────────────────────────────────────────

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (Åberg → aberg)
    .replace(/[.']/g, '')            // strip punctuation (J.J. → JJ)
    .trim();
}

function findScore(
  pickName: string,
  espnPlayers: ESPNPlayerScore[]
): ESPNPlayerScore | null {
  const norm = normalize(pickName);

  // 1. Exact normalized match
  for (const ep of espnPlayers) {
    if (normalize(ep.name) === norm) return ep;
  }

  // 2. Last-name match (only if last name ≥ 4 chars)
  const pickLast = norm.split(' ').at(-1) ?? '';
  if (pickLast.length >= 4) {
    for (const ep of espnPlayers) {
      const epLast = normalize(ep.name).split(' ').at(-1) ?? '';
      if (epLast === pickLast) return ep;
    }
  }

  // 3. Substring match
  for (const ep of espnPlayers) {
    const epNorm = normalize(ep.name);
    if (epNorm.includes(norm) || norm.includes(epNorm)) return ep;
  }

  return null;
}

// ─────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────

function playerPoolScore(esp: ESPNPlayerScore | null): number {
  if (!esp) return 0; // not found / not started → E
  return esp.score ?? 0; // use actual score for all players, including CUT/WD/DQ
}

interface ScoredPick {
  pick: PlayerPick;
  espn: ESPNPlayerScore | null;
  poolScore: number;
  dropped: boolean;
}

interface StandingRow {
  poolName: string;
  total: number;          // sum of best 8
  rank: number;
  scoredPicks: ScoredPick[];
}

function buildStandings(
  pool: PoolEntry[],
  espnPlayers: ESPNPlayerScore[]
): StandingRow[] {
  const rows: Omit<StandingRow, 'rank'>[] = pool.map(entry => {
    const scored: ScoredPick[] = entry.players.map(pick => {
      const espn = findScore(pick.name, espnPlayers);
      return { pick, espn, poolScore: playerPoolScore(espn), dropped: false };
    });

    // Sort descending (worst = highest score) to find the 2 to drop
    const byScore = [...scored].sort((a, b) => b.poolScore - a.poolScore);
    const droppedSet = new Set([byScore[0], byScore[1]]);

    // Mark dropped (only mark if we actually have scores to drop)
    scored.forEach(sp => {
      sp.dropped = droppedSet.has(sp);
    });

    const total = scored
      .filter(sp => !sp.dropped)
      .reduce((sum, sp) => sum + sp.poolScore, 0);

    return { poolName: entry.poolName, total, scoredPicks: scored };
  });

  // Sort by total (lower is better), then assign ranks
  rows.sort((a, b) => a.total - b.total);

  let rank = 1;
  return rows.map((row, i) => {
    if (i > 0 && row.total !== rows[i - 1].total) rank = i + 1;
    return { ...row, rank };
  });
}

// ─────────────────────────────────────────────
// FORMATTING HELPERS
// ─────────────────────────────────────────────

function fmtScore(n: number | null): string {
  if (n === null) return '—';
  if (n === 0) return 'E';
  return n > 0 ? `+${n}` : `${n}`;
}

function scoreColor(n: number): string {
  if (n < 0) return '#e63c3c';
  if (n > 0) return '#a0c878';
  return '#c9a84c';
}

const TIER_CSS: Record<Tier, { color: string; label: string }> = {
  orange: { color: '#fb923c', label: 'Orange' },
  blue:   { color: '#60a5fa', label: 'Blue'   },
  green:  { color: '#4ade80', label: 'Green'  },
  grey:   { color: '#9ca3af', label: 'Grey'   },
};

function ThruDisplay({ esp }: { esp: ESPNPlayerScore | null }) {
  if (!esp) return <span style={{ color: 'rgba(245,239,224,0.3)' }}>—</span>;
  if (esp.status === 'cut') return <span style={{ color: 'rgba(245,239,224,0.3)' }}>CUT</span>;
  if (esp.status === 'wd')  return <span style={{ color: '#e63c3c' }}>WD</span>;
  if (esp.status === 'dq')  return <span style={{ color: '#e63c3c' }}>DQ</span>;
  if (esp.thru === null || esp.thru === 0) return <span style={{ color: 'rgba(245,239,224,0.3)' }}>—</span>;
  if (esp.thru === 18) return <span style={{ color: 'rgba(245,239,224,0.5)' }}>F</span>;
  return <span style={{ color: 'rgba(245,239,224,0.5)' }}>Thru {esp.thru}</span>;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function MastersLeaderboard() {
  const [data, setData] = useState<MastersScoresResponse | null>(null);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/masters-scores');
      const json: MastersScoresResponse = await res.json();
      setData(json);
      setStandings(buildStandings(POOL, json.players));
      setLastUpdated(json.lastUpdated);
      setCountdown(60);
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + 60-second auto-refresh
  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 60_000);
    return () => clearInterval(interval);
  }, [fetchScores]);

  // Countdown ticker
  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 60)), 1_000);
    return () => clearInterval(tick);
  }, []);

  const isLive = data?.eventStatus === 'in_progress';
  const isComplete = data?.eventStatus === 'complete';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Page header ── */}
        <div className="mb-8">
          <p className="font-serif text-sm uppercase tracking-widest mb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
            2026 · Augusta National
          </p>
          <h1 className="font-serif text-4xl font-bold mb-2 gold-shimmer">
            Masters Pool Leaderboard
          </h1>

          {/* Event name + status badges */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {data?.eventName && (
              <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.5)' }}>
                {data.eventName}
              </span>
            )}

            {isLive && (
              <span className="flex items-center gap-1.5 text-xs font-serif px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ color: '#e63c3c', background: 'rgba(230,60,60,0.12)', border: '1px solid rgba(230,60,60,0.3)' }}>
                <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: '#e63c3c' }} />
                Live
              </span>
            )}

            {isComplete && (
              <span className="text-xs font-serif px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ color: '#c9a84c', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>
                Final
              </span>
            )}

            {data?.eventStatus === 'scheduled' && (
              <span className="text-xs font-serif px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ color: 'rgba(245,239,224,0.4)', background: 'rgba(245,239,224,0.05)', border: '1px solid rgba(245,239,224,0.1)' }}>
                Upcoming
              </span>
            )}
          </div>

          {/* Scoring key */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            {(['orange','blue','green','grey'] as Tier[]).map(tier => (
              <span key={tier} className="flex items-center gap-1.5 text-xs font-serif" style={{ color: 'rgba(245,239,224,0.5)' }}>
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: TIER_CSS[tier].color }} />
                {TIER_CSS[tier].label} tier
              </span>
            ))}
            <span className="text-xs font-serif" style={{ color: 'rgba(245,239,224,0.35)' }}>
              · Best 8 of 10 picks
            </span>
          </div>

          <div className="gold-divider mt-4" />
        </div>

        {/* ── Last updated + countdown ── */}
        {lastUpdated && (
          <div className="flex items-center justify-between mb-4">
            <p className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.3)' }}>
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
            {isLive && (
              <p className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.3)' }}>
                Refreshing in {countdown}s
              </p>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="card-dark rounded-xl p-12 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: '#c9a84c', borderTopColor: 'transparent' }} />
              <span className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.5)' }}>
                Fetching scores…
              </span>
            </div>
          </div>
        )}

        {/* ── Standings table ── */}
        {!loading && (
          <div className="card-dark rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
                  {['Rank', 'Name', 'Score', 'Picks (tap to expand)'].map(h => (
                    <th key={h}
                      className="font-serif text-left py-3 px-4 text-xs uppercase tracking-widest"
                      style={{ color: 'rgba(201,168,76,0.7)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => {
                  const isExpanded = expanded === row.poolName;
                  const rowBg =
                    row.rank === 1 ? 'linear-gradient(90deg,rgba(201,168,76,0.15) 0%,transparent 100%)'
                    : row.rank === 2 ? 'linear-gradient(90deg,rgba(192,192,192,0.08) 0%,transparent 100%)'
                    : row.rank === 3 ? 'linear-gradient(90deg,rgba(205,127,50,0.08) 0%,transparent 100%)'
                    : 'transparent';

                  return (
                    <React.Fragment key={row.poolName}>
                      {/* ─ Main row ─ */}
                      <tr
                        className="leaderboard-row cursor-pointer select-none"
                        style={{
                          background: rowBg,
                          borderBottom: isExpanded
                            ? '1px solid rgba(201,168,76,0.2)'
                            : i < standings.length - 1 ? '1px solid rgba(201,168,76,0.08)' : undefined,
                        }}
                        onClick={() => setExpanded(isExpanded ? null : row.poolName)}
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 text-center" style={{ minWidth: '56px' }}>
                          <span className="font-serif font-bold text-lg"
                            style={{ color: row.rank <= 3 ? '#c9a84c' : 'rgba(245,239,224,0.6)' }}>
                            {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : row.rank}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="py-4 px-4">
                          <span className="font-serif font-bold" style={{ color: '#f5efe0' }}>
                            {row.poolName}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-4">
                          <span className="font-serif font-bold text-xl"
                            style={{ color: scoreColor(row.total) }}>
                            {fmtScore(row.total)}
                          </span>
                        </td>

                        {/* Mini pick chips */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 items-center">
                            {row.scoredPicks.map(sp => (
                              <span
                                key={sp.pick.name}
                                className="text-xs font-serif px-2 py-0.5 rounded"
                                title={`${sp.pick.name}: ${fmtScore(sp.poolScore)}${sp.dropped ? ' (dropped)' : ''}`}
                                style={{
                                  background: sp.dropped
                                    ? 'rgba(245,239,224,0.04)'
                                    : `${TIER_CSS[sp.pick.tier].color}18`,
                                  color: sp.dropped
                                    ? 'rgba(245,239,224,0.2)'
                                    : TIER_CSS[sp.pick.tier].color,
                                  textDecoration: sp.dropped ? 'line-through' : 'none',
                                  opacity: sp.dropped ? 0.5 : 1,
                                  border: `1px solid ${sp.dropped ? 'rgba(245,239,224,0.06)' : TIER_CSS[sp.pick.tier].color + '40'}`,
                                }}
                              >
                                {sp.pick.name.split(' ').at(-1)}
                                {sp.espn && (
                                  <span className="ml-1" style={{ color: sp.dropped ? 'rgba(245,239,224,0.2)' : scoreColor(sp.poolScore) }}>
                                    {fmtScore(sp.poolScore)}
                                  </span>
                                )}
                              </span>
                            ))}
                            <span className="text-xs ml-1" style={{ color: 'rgba(245,239,224,0.25)' }}>
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* ─ Expanded detail ─ */}
                      {isExpanded && (
                        <tr key={`${row.poolName}-detail`}
                          style={{ borderBottom: '1px solid rgba(201,168,76,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                          <td colSpan={4} className="px-4 pb-4 pt-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                              {row.scoredPicks.map(sp => (
                                <div
                                  key={sp.pick.name}
                                  className="rounded-lg p-2.5"
                                  style={{
                                    background: sp.dropped
                                      ? 'rgba(245,239,224,0.03)'
                                      : `${TIER_CSS[sp.pick.tier].color}10`,
                                    border: `1px solid ${sp.dropped
                                      ? 'rgba(245,239,224,0.06)'
                                      : TIER_CSS[sp.pick.tier].color + '35'}`,
                                    opacity: sp.dropped ? 0.45 : 1,
                                  }}
                                >
                                  {/* Tier dot + label */}
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ background: sp.dropped ? 'rgba(245,239,224,0.2)' : TIER_CSS[sp.pick.tier].color }} />
                                    <span className="text-xs font-serif uppercase tracking-wide"
                                      style={{ color: sp.dropped ? 'rgba(245,239,224,0.2)' : TIER_CSS[sp.pick.tier].color }}>
                                      {TIER_CSS[sp.pick.tier].label}
                                      {sp.dropped && ' · dropped'}
                                    </span>
                                  </div>

                                  {/* Player name */}
                                  <p className="font-serif text-sm font-bold leading-tight mb-1"
                                    style={{
                                      color: sp.dropped ? 'rgba(245,239,224,0.25)' : '#f5efe0',
                                      textDecoration: sp.dropped ? 'line-through' : 'none',
                                    }}>
                                    {sp.pick.name}
                                  </p>

                                  {/* Score row */}
                                  <div className="flex items-center justify-between">
                                    <span className="font-serif font-bold text-base"
                                      style={{ color: sp.dropped ? 'rgba(245,239,224,0.2)' : scoreColor(sp.poolScore) }}>
                                      {sp.espn ? fmtScore(sp.poolScore) : '—'}
                                    </span>
                                    <span className="font-serif text-xs">
                                      <ThruDisplay esp={sp.espn} />
                                    </span>
                                  </div>

                                  {/* Position */}
                                  {sp.espn?.position && sp.espn.status === 'active' && (
                                    <p className="font-serif text-xs mt-0.5"
                                      style={{ color: 'rgba(245,239,224,0.35)' }}>
                                      {sp.espn.position}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {standings.length === 0 && !loading && (
              <div className="p-12 text-center">
                <p className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.4)' }}>
                  No score data available yet — scores will appear once the tournament begins.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── No-data / error note ── */}
        {data?.error && (
          <p className="mt-4 font-serif text-xs text-center" style={{ color: 'rgba(245,239,224,0.3)' }}>
            Note: {data.error}. Scores will auto-refresh when available.
          </p>
        )}

        <p className="mt-6 font-serif text-xs text-center" style={{ color: 'rgba(245,239,224,0.25)' }}>
          Scores sourced from ESPN · Refreshes every 60 seconds
        </p>
      </main>

      <Footer />
    </div>
  );
}
