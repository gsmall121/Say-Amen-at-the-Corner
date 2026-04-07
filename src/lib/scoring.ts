// Pool scoring logic

const MISSED_CUT_PENALTY = 20;
const WD_PENALTY = 20;
const DQ_PENALTY = 20;

export function getPlayerPoolScore(
  totalScore: number | null,
  status: string
): number {
  if (status === 'CUT') return MISSED_CUT_PENALTY;
  if (status === 'WD') return WD_PENALTY;
  if (status === 'DQ') return DQ_PENALTY;
  if (totalScore === null) return 0; // Still playing, use 0 (even par) as placeholder
  return totalScore;
}

/**
 * Apply the cut-line score cap rule for a player who made the cut.
 *
 * If a player's status is ACTIVE (made the cut) and the tournament has a
 * cutScore set, rounds 3 and 4 are each capped at cutScore for pool
 * scoring purposes. If a round score exceeds the cut line, cutScore is
 * used instead so the player cannot score worse than the cut line on
 * Saturday or Sunday.
 *
 * @param roundScores  Array of round scores relative to par (index 0 = R1, etc.)
 * @param status       Player status (ACTIVE, CUT, WD, DQ)
 * @param cutScore     The tournament cut line relative to par (nullable)
 * @returns            Effective total score to use for pool calculations
 */
export function getPlayerPoolScoreWithCap(
  roundScores: (number | null)[],
  status: string,
  cutScore: number | null | undefined
): number {
  if (status === 'CUT') return MISSED_CUT_PENALTY;
  if (status === 'WD') return WD_PENALTY;
  if (status === 'DQ') return DQ_PENALTY;

  if (roundScores.length === 0) return 0;

  // Apply cut-line cap to rounds 3 and 4 for players who made the cut
  const cappedScores = roundScores.map((score, index) => {
    if (score === null) return 0;
    // Rounds are 1-indexed; index 2 = R3, index 3 = R4
    const roundNumber = index + 1;
    if (
      status === 'ACTIVE' &&
      cutScore != null &&
      (roundNumber === 3 || roundNumber === 4) &&
      score > cutScore
    ) {
      return cutScore;
    }
    return score;
  });

  return cappedScores.reduce((sum, s) => sum + s, 0);
}

// Best 10 of 12: sort player scores ascending, take 10 lowest
export function calculatePoolScore(playerScores: number[]): number {
  const sorted = [...playerScores].sort((a, b) => a - b);
  const best10 = sorted.slice(0, 10);
  return best10.reduce((sum, score) => sum + score, 0);
}

export function formatScore(score: number | null): string {
  if (score === null || score === undefined) return 'E';
  if (score === 0) return 'E';
  if (score > 0) return `+${score}`;
  return `${score}`;
}

// Earnings structure
const EARNINGS_TABLE: Record<number, number> = {
  1: 500000,
  2: 300000,
  3: 200000,
  4: 150000,
  5: 100000,
  6: 80000,
  7: 60000,
  8: 50000,
  9: 40000,
  10: 30000,
};

for (let i = 11; i <= 15; i++) EARNINGS_TABLE[i] = 20000;
for (let i = 16; i <= 20; i++) EARNINGS_TABLE[i] = 10000;
for (let i = 21; i <= 30; i++) EARNINGS_TABLE[i] = 5000;

export function getEarningsForPosition(position: number): number {
  return EARNINGS_TABLE[position] ?? 0;
}

export interface PlayerWithScore {
  id: string;
  name: string;
  tier: number;
  odds: string | null;
  worldRanking: number | null;
  totalScore: number | null;
  position: number | null;
  status: string;
  roundScores?: (number | null)[];
}

export interface PickResult {
  userId: string;
  userName: string;
  players: PlayerWithScore[];
  poolScore: number;
  rank?: number;
  totalEarnings?: number;
}

export function calculatePickResults(
  userId: string,
  userName: string,
  players: PlayerWithScore[],
  cutScore?: number | null
): PickResult {
  const scores = players.map(p => {
    // Use round-by-round cap if round scores are available and cutScore is set
    if (cutScore != null && p.roundScores && p.roundScores.length > 0) {
      return getPlayerPoolScoreWithCap(p.roundScores, p.status, cutScore);
    }
    return getPlayerPoolScore(p.totalScore, p.status);
  });
  const poolScore = calculatePoolScore(scores);

  return {
    userId,
    userName,
    players,
    poolScore,
  };
}
