import { getEarningsForPosition, getPlayerPoolScore, getPlayerPoolScoreWithCap, calculatePoolScore } from './scoring';

export interface PlayerScore {
  id: string;
  name: string;
  totalScore: number | null;
  position: number | null;
  status: string;
  roundScores?: (number | null)[];
}

export interface ParticipantMajorResult {
  userId: string;
  userName: string;
  poolScore: number;
  rank: number;
  earnings: number;
  players: PlayerScore[];
}

export function calculateMajorEarnings(
  participants: Array<{
    userId: string;
    userName: string;
    players: PlayerScore[];
  }>,
  cutScore?: number | null
): ParticipantMajorResult[] {
  // Calculate pool score for each participant
  const withScores = participants.map(p => {
    const scores = p.players.map(player => {
      // Use round-by-round cap if round scores are available and cutScore is set
      if (cutScore != null && player.roundScores && player.roundScores.length > 0) {
        return getPlayerPoolScoreWithCap(player.roundScores, player.status, cutScore);
      }
      return getPlayerPoolScore(player.totalScore, player.status);
    });
    const poolScore = calculatePoolScore(scores);
    return { ...p, poolScore };
  });

  // Sort by pool score (lower is better)
  withScores.sort((a, b) => a.poolScore - b.poolScore);

  // Assign ranks (handle ties)
  const results: ParticipantMajorResult[] = [];
  let currentRank = 1;

  for (let i = 0; i < withScores.length; i++) {
    if (i > 0 && withScores[i].poolScore !== withScores[i - 1].poolScore) {
      currentRank = i + 1;
    }

    const earnings = getEarningsForPosition(currentRank);

    results.push({
      userId: withScores[i].userId,
      userName: withScores[i].userName,
      poolScore: withScores[i].poolScore,
      rank: currentRank,
      earnings,
      players: withScores[i].players,
    });
  }

  return results;
}

export interface SeasonStanding {
  userId: string;
  userName: string;
  totalEarnings: number;
  majorResults: Array<{
    majorId: string;
    majorName: string;
    rank: number;
    earnings: number;
    poolScore: number;
  }>;
}

export function calculateSeasonStandings(
  majorResults: Array<{
    majorId: string;
    majorName: string;
    results: ParticipantMajorResult[];
  }>
): SeasonStanding[] {
  const standingsMap = new Map<string, SeasonStanding>();

  for (const major of majorResults) {
    for (const result of major.results) {
      if (!standingsMap.has(result.userId)) {
        standingsMap.set(result.userId, {
          userId: result.userId,
          userName: result.userName,
          totalEarnings: 0,
          majorResults: [],
        });
      }

      const standing = standingsMap.get(result.userId)!;
      standing.totalEarnings += result.earnings;
      standing.majorResults.push({
        majorId: major.majorId,
        majorName: major.majorName,
        rank: result.rank,
        earnings: result.earnings,
        poolScore: result.poolScore,
      });
    }
  }

  const standings = Array.from(standingsMap.values());
  standings.sort((a, b) => b.totalEarnings - a.totalEarnings);

  return standings;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
