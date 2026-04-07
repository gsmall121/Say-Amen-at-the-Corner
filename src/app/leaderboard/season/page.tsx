import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { calculateMajorEarnings, calculateSeasonStandings, formatCurrency } from '@/lib/earnings';
import Link from 'next/link';

export const revalidate = 120;

export default async function SeasonLeaderboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const currentUserId = session.user.id as string;

  // Get all majors for the season
  const allMajors = await prisma.major.findMany({
    where: { year: 2026 },
    orderBy: { startDate: 'asc' },
  });

  // Only include majors that have started
  const activeMajors = allMajors.filter(m => m.status === 'IN_PROGRESS' || m.status === 'COMPLETED');

  const majorResultsList = [];

  for (const major of activeMajors) {
    const picks = await prisma.pick.findMany({
      where: { majorId: major.id },
      include: {
        user: { select: { id: true, name: true } },
        players: {
          include: { player: true },
        },
      },
    });

    const participants = picks.map(pick => ({
      userId: pick.user.id,
      userName: pick.user.name,
      players: pick.players.map(pp => ({
        id: pp.player.id,
        name: pp.player.name,
        totalScore: pp.player.totalScore,
        position: pp.player.position,
        status: pp.player.status,
      })),
    }));

    const results = calculateMajorEarnings(participants);
    majorResultsList.push({
      majorId: major.id,
      majorName: major.name,
      results,
    });
  }

  const standings = calculateSeasonStandings(majorResultsList);

  // Get all active users so everyone shows up
  const allUsers = await prisma.user.findMany({
    where: { isActive: true, role: 'USER' },
    select: { id: true, name: true },
  });

  // Add users with no picks
  const existingUserIds = new Set(standings.map(s => s.userId));
  for (const user of allUsers) {
    if (!existingUserIds.has(user.id)) {
      standings.push({
        userId: user.id,
        userName: user.name,
        totalEarnings: 0,
        majorResults: [],
      });
    }
  }

  // Sort by total earnings
  standings.sort((a, b) => b.totalEarnings - a.totalEarnings);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Back nav */}
        <div className="mb-6">
          <Link href="/dashboard" className="font-serif text-sm flex items-center gap-2 hover:opacity-80 transition-opacity" style={{ color: 'rgba(201,168,76,0.6)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="font-serif text-sm uppercase tracking-widest mb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
            2026 Season
          </p>
          <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: '#c9a84c' }}>
            Season Standings
          </h1>
          <p className="font-serif text-base" style={{ color: 'rgba(245,239,224,0.5)' }}>
            Cumulative earnings across all completed majors
          </p>
          <div className="gold-divider mt-4" />
        </div>

        {/* Major tabs */}
        {allMajors.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {allMajors.map(major => (
              <Link
                key={major.id}
                href={`/leaderboard/${major.id}`}
                className="font-serif text-sm px-4 py-2 rounded-lg transition-all"
                style={{
                  background: major.status === 'IN_PROGRESS' || major.status === 'COMPLETED'
                    ? 'rgba(201,168,76,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  color: major.status === 'IN_PROGRESS' || major.status === 'COMPLETED'
                    ? '#c9a84c'
                    : 'rgba(245,239,224,0.4)',
                  border: `1px solid ${major.status === 'IN_PROGRESS' || major.status === 'COMPLETED' ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {major.name}
                {major.status === 'IN_PROGRESS' && (
                  <span className="inline-block w-2 h-2 rounded-full ml-2 align-middle animate-pulse" style={{ background: '#e63c3c' }} />
                )}
              </Link>
            ))}
          </div>
        )}

        {activeMajors.length === 0 ? (
          <div className="card-green p-8 rounded-xl text-center max-w-lg mx-auto">
            <div className="text-5xl mb-4">⛳</div>
            <h2 className="font-serif text-2xl font-bold mb-3" style={{ color: '#c9a84c' }}>
              Season Not Started
            </h2>
            <p className="font-serif text-base mb-6" style={{ color: 'rgba(245,239,224,0.6)' }}>
              Season standings will appear once the first major is underway.
            </p>
            <p className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.4)' }}>
              The Masters begins April 9, 2026.
            </p>
          </div>
        ) : (
          <>
            {/* Season standings table */}
            <div className="card-dark rounded-xl overflow-hidden mb-10">
              <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
                <h2 className="font-serif text-xl font-bold" style={{ color: '#f5efe0' }}>
                  Overall Standings
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
                      <th className="font-serif text-left py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>Rank</th>
                      <th className="font-serif text-left py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>Player</th>
                      {activeMajors.map(m => (
                        <th key={m.id} className="font-serif text-center py-3 px-4 text-xs uppercase tracking-widest hidden md:table-cell" style={{ color: 'rgba(201,168,76,0.7)' }}>
                          {m.name.split(' ')[m.name.startsWith('The') ? 1 : 0]}
                        </th>
                      ))}
                      <th className="font-serif text-right py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((standing, idx) => {
                      const isCurrentUser = standing.userId === currentUserId;
                      const rank = idx + 1;

                      return (
                        <tr
                          key={standing.userId}
                          className={`leaderboard-row ${rank === 1 ? 'position-1' : rank === 2 ? 'position-2' : rank === 3 ? 'position-3' : ''}`}
                          style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}
                        >
                          <td className="py-4 px-4 font-serif font-bold text-lg" style={{ color: 'rgba(245,239,224,0.6)' }}>
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-serif font-bold" style={{ color: isCurrentUser ? '#c9a84c' : '#f5efe0' }}>
                              {standing.userName}
                            </span>
                            {isCurrentUser && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-serif" style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                                You
                              </span>
                            )}
                          </td>
                          {activeMajors.map(m => {
                            const majorResult = standing.majorResults.find(r => r.majorId === m.id);
                            return (
                              <td key={m.id} className="py-4 px-4 text-center hidden md:table-cell">
                                {majorResult ? (
                                  <div>
                                    <div className="font-serif text-sm font-bold" style={{ color: '#c9a84c' }}>
                                      {formatCurrency(majorResult.earnings)}
                                    </div>
                                    <div className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.4)' }}>
                                      #{majorResult.rank}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.2)' }}>—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-4 px-4 text-right">
                            <span className="font-serif font-bold text-lg" style={{ color: standing.totalEarnings > 0 ? '#c9a84c' : 'rgba(245,239,224,0.3)' }}>
                              {standing.totalEarnings > 0 ? formatCurrency(standing.totalEarnings) : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Completed majors summary */}
            <div>
              <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: '#f5efe0' }}>
                Results by Major
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {majorResultsList.map(({ majorId, majorName, results }) => (
                  <div key={majorId} className="card-green p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-lg font-bold" style={{ color: '#c9a84c' }}>
                        {majorName}
                      </h3>
                      <Link href={`/leaderboard/${majorId}`} className="text-xs font-serif px-3 py-1 rounded" style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)' }}>
                        Full Leaderboard
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {results.slice(0, 5).map(r => (
                        <div key={r.userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.4)' }}>
                              {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`}
                            </span>
                            <span className="font-serif text-sm" style={{ color: r.userId === currentUserId ? '#c9a84c' : 'rgba(245,239,224,0.8)' }}>
                              {r.userName}
                            </span>
                          </div>
                          <span className="font-serif text-sm font-bold" style={{ color: '#c9a84c' }}>
                            {formatCurrency(r.earnings)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
