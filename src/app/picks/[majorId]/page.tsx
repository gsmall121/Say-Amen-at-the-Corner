'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlayerTierSelector from '@/components/PlayerTierSelector';

interface Player {
  id: string;
  name: string;
  tier: number;
  odds: string | null;
  worldRanking: number | null;
}

interface Major {
  id: string;
  name: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface PageProps {
  params: { majorId: string };
}

export default function PicksPage({ params }: PageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { majorId } = params;

  const [major, setMajor] = useState<Major | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [existingPickIds, setExistingPickIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status !== 'authenticated') return;

    async function loadData() {
      try {
        // Load major and players
        const [majorResp, playersResp, picksResp] = await Promise.all([
          fetch(`/api/major/${majorId}`),
          fetch(`/api/players?majorId=${majorId}`),
          fetch(`/api/picks?majorId=${majorId}`),
        ]);

        if (majorResp.ok) {
          const majorData = await majorResp.json();
          setMajor(majorData.major);
        }

        if (playersResp.ok) {
          const playersData = await playersResp.json();
          setPlayers(playersData.players || []);
        }

        if (picksResp.ok) {
          const picksData = await picksResp.json();
          if (picksData.pick) {
            setExistingPickIds(picksData.pick.players.map((pp: any) => pp.playerId));
          }
        }
      } catch (e) {
        setError('Failed to load tournament data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [majorId, status, router]);

  async function handleSubmitPicks(playerIds: string[]) {
    const resp = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ majorId, playerIds }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || 'Failed to submit picks');
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.6)' }}>Loading tournament data...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="font-serif text-lg mb-4" style={{ color: '#e63c3c' }}>{error}</p>
            <button onClick={() => router.push('/dashboard')} className="btn-outline-gold">
              Back to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">⛳</div>
            <h2 className="font-serif text-3xl font-bold mb-3" style={{ color: '#c9a84c' }}>
              Picks Submitted!
            </h2>
            <p className="font-serif text-lg mb-4" style={{ color: 'rgba(245,239,224,0.6)' }}>
              Your picks for {major?.name} have been saved.
            </p>
            <p className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.4)' }}>
              Redirecting to dashboard...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isLocked = major?.status === 'IN_PROGRESS' || major?.status === 'COMPLETED';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="font-serif text-sm uppercase tracking-widest mb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
            Make Your Picks
          </p>
          <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: '#c9a84c' }}>
            {major?.name || 'Tournament'}
          </h1>
          {major && (
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.5)' }}>
                {major.venue}
              </span>
              <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.3)' }}>
                {major.location}
              </span>
            </div>
          )}
          <div className="gold-divider mt-4" />
        </div>

        {/* Rules reminder */}
        <div className="card-dark p-5 rounded-xl mb-8">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span style={{ color: '#c9a84c' }}>✦</span>
              <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.7)' }}>Pick 12 total players</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#c9a84c' }}>✦</span>
              <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.7)' }}>Best 10 of 12 count</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#c9a84c' }}>✦</span>
              <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.7)' }}>Lower score wins</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#c9a84c' }}>✦</span>
              <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.7)' }}>Missed cut = +20 penalty</span>
            </div>
          </div>
        </div>

        {isLocked ? (
          <div className="card-green p-8 rounded-xl text-center">
            <h2 className="font-serif text-2xl font-bold mb-3" style={{ color: '#c9a84c' }}>
              Picks Are Locked
            </h2>
            <p className="font-serif text-base mb-6" style={{ color: 'rgba(245,239,224,0.6)' }}>
              The tournament has begun. Picks can no longer be changed.
            </p>
            <div className="mt-6">
              <PlayerTierSelector
                players={players}
                initialSelectedIds={existingPickIds}
                onSubmit={async () => {}}
                isLocked={true}
                deadline={major ? new Date(major.startDate) : null}
              />
            </div>
          </div>
        ) : (
          <PlayerTierSelector
            players={players}
            initialSelectedIds={existingPickIds}
            onSubmit={handleSubmitPicks}
            isLocked={false}
            deadline={major ? new Date(major.startDate) : null}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
