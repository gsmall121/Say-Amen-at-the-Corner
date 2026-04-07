import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminUserTable from '@/components/AdminUserTable';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if ((session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [users, majors] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        inviteToken: true,
        createdAt: true,
        _count: { select: { picks: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.major.findMany({
      where: { year: 2026 },
      include: {
        _count: {
          select: { players: true, picks: true },
        },
      },
      orderBy: { startDate: 'asc' },
    }),
  ]);

  const statusColors: Record<string, string> = {
    UPCOMING: 'rgba(245,239,224,0.4)',
    PICKS_OPEN: '#a0c878',
    IN_PROGRESS: '#e63c3c',
    COMPLETED: '#c9a84c',
  };

  const serializedUsers = users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="font-serif text-sm uppercase tracking-widest mb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
            Commissioner Panel
          </p>
          <h1 className="font-serif text-4xl font-bold" style={{ color: '#c9a84c' }}>
            Admin Dashboard
          </h1>
          <div className="gold-divider mt-4" />
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Members', value: users.filter(u => u.role !== 'ADMIN').length },
            { label: 'Active Members', value: users.filter(u => u.isActive && u.role !== 'ADMIN').length },
            { label: 'Total Picks', value: users.reduce((sum, u) => sum + u._count.picks, 0) },
            { label: 'Pending Invites', value: users.filter(u => !u.isActive).length },
          ].map(stat => (
            <div key={stat.label} className="card-green p-5 rounded-xl text-center">
              <div className="font-serif text-3xl font-bold mb-1" style={{ color: '#c9a84c' }}>
                {stat.value}
              </div>
              <div className="font-serif text-xs uppercase tracking-wider" style={{ color: 'rgba(245,239,224,0.4)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Majors management */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: '#f5efe0' }}>
            Tournament Management
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {majors.map(major => (
              <div key={major.id} className="card-green p-5 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-serif text-base font-bold leading-tight" style={{ color: '#c9a84c' }}>
                    {major.name}
                  </h3>
                  <span
                    className="text-xs font-serif px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                    style={{
                      color: statusColors[major.status],
                      background: `${statusColors[major.status]}15`,
                      border: `1px solid ${statusColors[major.status]}30`,
                    }}
                  >
                    {major.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-1 mb-4 text-xs font-serif" style={{ color: 'rgba(245,239,224,0.5)' }}>
                  <p>{major._count.players} players</p>
                  <p>{major._count.picks} picks submitted</p>
                </div>
                <Link
                  href={`/admin/major/${major.id}`}
                  className="btn-outline-gold text-xs py-2 px-4 w-full text-center block"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Users section */}
        <div className="card-dark p-6 rounded-xl">
          <AdminUserTable users={serializedUsers} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
