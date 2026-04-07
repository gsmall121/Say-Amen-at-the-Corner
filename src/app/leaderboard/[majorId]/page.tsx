import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeaderboardTable from '@/components/LeaderboardTable';
import { calculateMajorEarnings } from '@/lib/earnings';
import Link from 'next/link';

interface PageProps {
  params: { majorId: string };
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function MajorLeaderboardPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const currentUserId = session.user.id as string;
  const { majorId } = params;

  const major = await prisma.major.findUnique({
    where: { id: majorId },
  });

  if (!major) {
    redirect('/dashboard');
  }

  const showLeaderboard = major.status === 'IN_PROGRESS' || major.status === 'COMPLETED';

  // Get players with scores
  const players = await prisma.player.findMany({
    where: { majorId },
    include: { scores: true },
    orderBy: [
      { position: 'asc' },
      { totalScore: 'asc' },
    ],
  });

  // Get picks (with or without details based on status)
  const picks = await prisma.pick.findMany({
    where: { majorId },
    include: {
      user: { select: { id: true, name: true } },
      players: {
        include: {
          player: true,
        },
      },
    },
  });

  let results = null;
  if (showLeaderboard) {
    const participants = picks.map(pick => ({
      userId: pick.user.id,
      userName: pick.user.name,
      players: pick.players.map(pp => ({
        id: pp.player.id,
        name: pp.player.name,
        tier: pp.player.tier,
        odds: pp.player.odds,
        worldRanking: pp.player.worldRanking,
        totalScore: pp.player.totalScore,
        position: pp.player.position,
        status: pp.player.status,
      })),
    }));
    results = calculateMajorEarnings(participants);
  }

  const statusColors: Record<string, string> = {
    UPCOMING: 'rgba(245,239,224,0.5)',
    PICKS_OPEN: '#a0c878',
    IN_PROGRESS: '#e63c3c',
    COMPLETED: '#c9a84c',
  };

  const statusLabels: Record<string, string> = {
    UPCOMING: 'Upcoming',
    PICKS_OPEN: 'Picks Open',
    IN_PROGRESS: 'Live',
    COMPLETED: 'Final',
  };

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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="font-serif text-sm uppercase tracking-widest mb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
                {major.year} Major Championship
              </p>
              <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: '#c9a84c' }}>
                {major.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.5)' }}>
                  {major.venue}, {major.location}
                </span>
                <span
                  className="text-xs font-serif px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    color: statusColors[major.status],
                    background: `${statusColors[major.status]}15`,
                    border: `1px solid ${statusColors[major.status]}30`,
                  }}
                >
                  {statusLabels[major.status]}
                  {major.status === 'IN_PROGRESS' && (
                    <span className="inline-block w-2 h-2 rounded-full ml-2 animate-pulse" style={{ background: '#e63c3c' }} />
                  )}
                </span>
              </div>
            </div>
            {major.status === 'IN_PROGRESS' && (
              <p className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.3)' }}>
                Auto-refreshing every 60 seconds
              </p>
            )}
          </div>
          <div className="gold-divider mt-4" />
        </div>

        {!showLeaderboard ? (
          <div className="max-w-2xl">
            {major.status === 'PICKS_OPEN' && (
              <div className="card-green p-8 rounded-xl text-center">
                <div className="text-5xl mb-4">🏌️</div>
                <h2 className="font-serif text-2xl font-bold mb-3" style={{ color: '#c9a84c' }}>
                  Leaderboard Hidden
                </h2>
                <p className="font-serif text-base mb-6" style={{ color: 'rgba(245,239,224,0.6)' }}>
                  Other players&apos; picks are hidden until the tournament begins. Make your picks below!
                </p>
                <p className="font-serif text-sm mb-6" style={{ color: 'rgba(245,239,224,0.4)' }}>
                  {picks.length} player{picks.length !== 1 ? 's have' : ' has'} submitted picks so far.
                </p>
                <Link href={`/picks/${majorId}`} className="btn-gold py-3 px-8">
                  {picks.some(p => p.user.id === currentUserId) ? 'Edit My Picks' : 'Make My Picks'}
                </Link>
              </div>
            )}
            {major.status === 'UPCOMING' && (
              <div className="card-green p-8 rounded-xl text-center">
                <h2 className="font-serif text-2xl font-bold mb-3" style={{ color: '#c9a84c' }}>
                  Coming Soon
                </h2>
                <p className="font-serif text-base" style={{ color: 'rgba(245,239,224,0.6)' }}>
                  Picks will open soon. Check back later!
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Pool Leaderboard */}
            <div className="mb-10">
              <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: '#f5efe0' }}>
                Pool Leaderboard
              </h2>
              <div className="card-dark rounded-xl overflow-hidden">
                {results && results.length > 0 ? (
                  <LeaderboardTable
                    results={results}
                    currentUserId={currentUserId}
                    showEarnings={true}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <p className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.5)' }}>
                      No picks submitted yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tournament Leaderboard */}
            <div>
              <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: '#f5efe0' }}>
                Tournament Scores
              </h2>
              <div className="card-dark rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
                      {['Pos', 'Player', 'Score', 'Status', 'Tier'].map(h => (
                        <th key={h} className="font-serif text-left py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr key={player.id} className="leaderboard-row" style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                        <td className="py-3 px-4 font-serif text-sm" style={{ color: 'rgba(245,239,224,0.6)' }}>
                          {player.position ? `T${player.position}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-serif text-sm font-bold" style={{ color: '#f5efe0' }}>
                          {player.name}
                        </td>
                        <td className="py-3 px-4 font-serif text-sm font-bold">
                          <span style={{
                            color: (player.totalScore ?? 0) < 0 ? '#e63c3c'
                              : (player.totalScore ?? 0) > 0 ? '#a0c878'
                              : '#c9a84c',
                          }}>
                            {player.totalScore === null ? '—'
                              : player.totalScore === 0 ? 'E'
                              : player.totalScore > 0 ? `+${player.totalScore}`
                              : `${player.totalScore}`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="text-xs font-serif px-2 py-0.5 rounded-full"
                            style={{
                              color: player.status === 'ACTIVE' ? '#a0c878'
                                : player.status === 'CUT' ? 'rgba(245,239,224,0.3)'
                                : '#e63c3c',
                              background: player.status === 'ACTIVE' ? 'rgba(160,200,120,0.1)'
                                : player.status === 'CUT' ? 'rgba(245,239,224,0.05)'
                                : 'rgba(230,60,60,0.1)',
                            }}
                          >
                            {player.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-serif" style={{
                            color: ['#c9a84c', '#a0c878', '#6a9a6a', '#4a7a4a'][player.tier - 1],
                          }}>
                            T{player.tier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
