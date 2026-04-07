import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MajorCard from '@/components/MajorCard';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const majors = await prisma.major.findMany({
    where: { year: 2026 },
    orderBy: { startDate: 'asc' },
  });

  // Get user's picks for all majors
  const picks = await prisma.pick.findMany({
    where: { userId: session.user.id! },
    select: { majorId: true, submittedAt: true, isLocked: true },
  });

  const picksMap = new Map(picks.map(p => [p.majorId, p]));

  // Get season earnings for this user
  const earnings = await prisma.earning.findMany({
    where: { userId: session.user.id! },
    include: { major: { select: { name: true } } },
    orderBy: { amount: 'desc' },
  });

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="font-serif text-sm uppercase tracking-widest mb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
                Welcome back
              </p>
              <h1 className="font-serif text-4xl font-bold" style={{ color: '#c9a84c' }}>
                {session.user.name}
              </h1>
            </div>
            {totalEarnings > 0 && (
              <div className="card-green px-6 py-4 text-center">
                <p className="font-serif text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(245,239,224,0.4)' }}>
                  Season Earnings
                </p>
                <p className="font-serif text-2xl font-bold" style={{ color: '#c9a84c' }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalEarnings)}
                </p>
              </div>
            )}
          </div>
          <div className="gold-divider mt-6" />
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/leaderboard/season" className="btn-outline-gold text-sm py-2 px-5">
            Season Standings
          </Link>
          {majors.filter(m => m.status === 'IN_PROGRESS' || m.status === 'COMPLETED').map(m => (
            <Link key={m.id} href={`/leaderboard/${m.id}`} className="btn-outline-gold text-sm py-2 px-5">
              {m.name} Leaderboard
            </Link>
          ))}
        </div>

        {/* Majors grid */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: '#f5efe0' }}>
            2026 Majors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {majors.map(major => (
              <MajorCard
                key={major.id}
                id={major.id}
                name={major.name}
                year={major.year}
                venue={major.venue}
                location={major.location}
                startDate={major.startDate}
                endDate={major.endDate}
                status={major.status}
                hasSubmittedPicks={picksMap.has(major.id)}
                showActions={true}
              />
            ))}
          </div>
        </div>

        {/* My Picks Summary */}
        {picks.length > 0 && (
          <div className="mt-10">
            <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: '#f5efe0' }}>
              My Submitted Picks
            </h2>
            <div className="card-green p-6 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {picks.map(pick => {
                  const major = majors.find(m => m.id === pick.majorId);
                  if (!major) return null;
                  return (
                    <div key={pick.majorId} className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(10,26,10,0.5)', border: '1px solid rgba(201,168,76,0.1)' }}>
                      <div>
                        <p className="font-serif font-bold" style={{ color: '#c9a84c' }}>{major.name}</p>
                        <p className="font-serif text-xs mt-1" style={{ color: 'rgba(245,239,224,0.4)' }}>
                          Submitted {new Date(pick.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {pick.isLocked && (
                          <span className="text-xs font-serif px-2 py-1 rounded-full" style={{ background: 'rgba(245,239,224,0.06)', color: 'rgba(245,239,224,0.4)' }}>
                            Locked
                          </span>
                        )}
                        {major.status === 'PICKS_OPEN' && !pick.isLocked && (
                          <Link href={`/picks/${major.id}`} className="text-xs font-serif px-3 py-1 rounded" style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)' }}>
                            Edit
                          </Link>
                        )}
                        {(major.status === 'IN_PROGRESS' || major.status === 'COMPLETED') && (
                          <Link href={`/leaderboard/${major.id}`} className="text-xs font-serif px-3 py-1 rounded" style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)' }}>
                            Leaderboard
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Season Earnings Detail */}
        {earnings.length > 0 && (
          <div className="mt-10">
            <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: '#f5efe0' }}>
              My Earnings
            </h2>
            <div className="card-green p-6 rounded-xl">
              <div className="space-y-3">
                {earnings.map(earning => (
                  <div key={earning.id} className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(10,26,10,0.5)', border: '1px solid rgba(201,168,76,0.1)' }}>
                    <div>
                      <p className="font-serif font-bold" style={{ color: '#f5efe0' }}>{earning.major.name}</p>
                      <p className="font-serif text-xs mt-1" style={{ color: 'rgba(245,239,224,0.4)' }}>
                        Finished #{earning.rank}
                      </p>
                    </div>
                    <span className="font-serif font-bold text-lg" style={{ color: '#c9a84c' }}>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(earning.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
                  <span className="font-serif font-bold text-lg" style={{ color: '#f5efe0' }}>Total</span>
                  <span className="font-serif font-bold text-2xl" style={{ color: '#c9a84c' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalEarnings)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
