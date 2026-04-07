'use client';

import { formatScore, getPlayerPoolScore } from '@/lib/scoring';
import { formatCurrency } from '@/lib/earnings';

interface Player {
  id: string;
  name: string;
  tier?: number;
  totalScore: number | null;
  position: number | null;
  status: string;
}

interface ParticipantResult {
  userId: string;
  userName: string;
  poolScore: number;
  rank: number;
  earnings: number;
  players: Player[];
}

interface LeaderboardTableProps {
  results: ParticipantResult[];
  currentUserId?: string;
  showEarnings?: boolean;
}

function getRankDisplay(rank: number): React.ReactNode {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="font-serif font-bold" style={{ color: 'rgba(245,239,224,0.7)' }}>{rank}</span>;
}

function getRowClass(rank: number, isCurrentUser: boolean): string {
  let base = 'leaderboard-row border-b transition-all duration-150';
  if (isCurrentUser) base += ' ring-1 ring-inset';
  if (rank === 1) return base + ' position-1';
  if (rank === 2) return base + ' position-2';
  if (rank === 3) return base + ' position-3';
  return base;
}

export default function LeaderboardTable({
  results,
  currentUserId,
  showEarnings = true,
}: LeaderboardTableProps) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.5)' }}>
          No results yet
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full leaderboard-table">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
            <th className="font-serif text-left py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>
              Rank
            </th>
            <th className="font-serif text-left py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>
              Player
            </th>
            <th className="font-serif text-center py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>
              Score
            </th>
            {showEarnings && (
              <th className="font-serif text-right py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>
                Earnings
              </th>
            )}
            <th className="font-serif text-right py-3 px-4 text-xs uppercase tracking-widest hidden lg:table-cell" style={{ color: 'rgba(201,168,76,0.7)' }}>
              Picks
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => {
            const isCurrentUser = result.userId === currentUserId;
            const rowClass = getRowClass(result.rank, isCurrentUser);

            // Calculate individual player scores for best 10 display
            const playerScores = result.players
              .map(p => ({
                ...p,
                poolScore: getPlayerPoolScore(p.totalScore, p.status),
              }))
              .sort((a, b) => a.poolScore - b.poolScore);

            const best10 = playerScores.slice(0, 10);

            return (
              <tr
                key={result.userId}
                className={rowClass}
                style={{
                  borderColor: 'rgba(201,168,76,0.1)',
                  ...(isCurrentUser ? { ringColor: '#c9a84c' } : {}),
                }}
              >
                <td className="py-4 px-4 text-center" style={{ minWidth: '60px' }}>
                  <div className="flex items-center justify-center">
                    {getRankDisplay(result.rank)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <span
                        className="font-serif font-bold"
                        style={{ color: isCurrentUser ? '#c9a84c' : '#f5efe0' }}
                      >
                        {result.userName}
                      </span>
                      {isCurrentUser && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-serif" style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className="font-serif font-bold text-lg"
                    style={{
                      color: result.poolScore < 0 ? '#e63c3c' : result.poolScore > 0 ? '#a0c878' : '#c9a84c',
                    }}
                  >
                    {formatScore(result.poolScore)}
                  </span>
                </td>
                {showEarnings && (
                  <td className="py-4 px-4 text-right">
                    <span className="font-serif font-bold" style={{ color: '#c9a84c' }}>
                      {formatCurrency(result.earnings)}
                    </span>
                  </td>
                )}
                <td className="py-4 px-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {best10.map((player) => (
                      <span
                        key={player.id}
                        className="text-xs font-serif px-2 py-0.5 rounded"
                        title={`${player.name}: ${formatScore(player.poolScore)}`}
                        style={{
                          background: 'rgba(245,239,224,0.06)',
                          color: player.status === 'CUT' || player.status === 'WD'
                            ? 'rgba(245,239,224,0.3)'
                            : 'rgba(245,239,224,0.7)',
                          textDecoration: player.status === 'CUT' ? 'line-through' : 'none',
                        }}
                      >
                        {player.name.split(' ').slice(-1)[0]}
                        {' '}
                        <span style={{
                          color: player.poolScore < 0 ? '#e63c3c' : player.poolScore > 0 ? '#a0c878' : '#c9a84c',
                        }}>
                          {formatScore(player.poolScore)}
                        </span>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
