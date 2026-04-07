'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScoreEntry from '@/components/ScoreEntry';
import Link from 'next/link';

interface Major {
  id: string;
  name: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  cutScore: number | null;
}

interface Player {
  id: string;
  name: string;
  tier: number;
  odds: string | null;
  worldRanking: number | null;
  totalScore: number | null;
  position: number | null;
  status: string;
  scores: Array<{ round: number; score: number | null; scoreToPar: number | null }>;
}

const STATUS_OPTIONS = ['UPCOMING', 'PICKS_OPEN', 'IN_PROGRESS', 'COMPLETED'];

interface PageProps {
  params: { majorId: string };
}

export default function AdminMajorPage({ params }: PageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { majorId } = params;

  const [major, setMajor] = useState<Major | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'scores' | 'players' | 'status'>('scores');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [cutScoreInput, setCutScoreInput] = useState('');
  const [cutScoreUpdating, setCutScoreUpdating] = useState(false);
  const [cutScoreMessage, setCutScoreMessage] = useState<string | null>(null);

  // Add player form
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTier, setNewPlayerTier] = useState('1');
  const [newPlayerOdds, setNewPlayerOdds] = useState('');
  const [newPlayerRanking, setNewPlayerRanking] = useState('');
  const [addingPlayer, setAddingPlayer] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    if (status !== 'authenticated') return;

    loadData();
  }, [majorId, status]);

  async function loadData() {
    try {
      const [majorResp, playersResp] = await Promise.all([
        fetch(`/api/major/${majorId}`),
        fetch(`/api/admin/players?majorId=${majorId}`),
      ]);

      if (majorResp.ok) {
        const data = await majorResp.json();
        setMajor(data.major);
        setCutScoreInput(data.major.cutScore != null ? String(data.major.cutScore) : '');
      }
      if (playersResp.ok) {
        const data = await playersResp.json();
        setPlayers(data.players || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: string) {
    setStatusUpdating(true);
    setStatusMessage(null);

    try {
      const resp = await fetch(`/api/admin/major/${majorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setMajor(data.major);
        setStatusMessage(`Status updated to ${newStatus}`);
      } else {
        const data = await resp.json();
        setStatusMessage(`Error: ${data.error}`);
      }
    } finally {
      setStatusUpdating(false);
    }
  }

  async function updateCutScore(e: React.FormEvent) {
    e.preventDefault();
    setCutScoreUpdating(true);
    setCutScoreMessage(null);

    try {
      const parsed = cutScoreInput.trim() === '' ? null : parseInt(cutScoreInput, 10);
      if (cutScoreInput.trim() !== '' && isNaN(parsed as number)) {
        setCutScoreMessage('Error: Cut score must be a valid integer (e.g. 3 for +3)');
        return;
      }

      const resp = await fetch(`/api/admin/major/${majorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cutScore: parsed }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setMajor(data.major);
        setCutScoreMessage(
          parsed === null
            ? 'Cut score cleared'
            : `Cut score set to ${parsed >= 0 ? '+' : ''}${parsed}`
        );
      } else {
        const data = await resp.json();
        setCutScoreMessage(`Error: ${data.error}`);
      }
    } finally {
      setCutScoreUpdating(false);
    }
  }

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    setAddingPlayer(true);

    try {
      const resp = await fetch('/api/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          majorId,
          name: newPlayerName,
          tier: newPlayerTier,
          odds: newPlayerOdds || null,
          worldRanking: newPlayerRanking ? parseInt(newPlayerRanking) : null,
        }),
      });

      if (resp.ok) {
        setNewPlayerName('');
        setNewPlayerOdds('');
        setNewPlayerRanking('');
        await loadData();
      }
    } finally {
      setAddingPlayer(false);
    }
  }

  async function deletePlayer(playerId: string) {
    if (!confirm('Delete this player?')) return;
    await fetch(`/api/admin/players?playerId=${playerId}`, { method: 'DELETE' });
    await loadData();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.5)' }}>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Back nav */}
        <div className="mb-6">
          <Link href="/admin" className="font-serif text-sm flex items-center gap-2 hover:opacity-80 transition-opacity" style={{ color: 'rgba(201,168,76,0.6)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Back to Admin
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: '#c9a84c' }}>
            {major?.name || 'Tournament'}
          </h1>
          <p className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.5)' }}>
            {major?.venue} — {major?.location}
          </p>
          {major && (
            <div className="mt-3 inline-flex items-center gap-2">
              <span className="font-serif text-sm px-3 py-1 rounded-full" style={{
                background: 'rgba(201,168,76,0.15)',
                color: '#c9a84c',
                border: '1px solid rgba(201,168,76,0.3)',
              }}>
                Status: {major.status.replace('_', ' ')}
              </span>
              <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.4)' }}>
                {players.length} players
              </span>
            </div>
          )}
          <div className="gold-divider mt-4" />
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-8 rounded-lg p-1" style={{ background: 'rgba(10,26,10,0.8)', border: '1px solid rgba(201,168,76,0.15)', width: 'fit-content' }}>
          {[
            { id: 'scores' as const, label: 'Scores & Sync' },
            { id: 'players' as const, label: 'Players' },
            { id: 'status' as const, label: 'Status' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="font-serif text-sm px-5 py-2 rounded-lg transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(201,168,76,0.2)' : 'transparent',
                color: activeTab === tab.id ? '#c9a84c' : 'rgba(245,239,224,0.5)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'scores' && (
          <div className="card-dark p-6 rounded-xl">
            <ScoreEntry
              players={players}
              majorId={majorId}
              onSync={loadData}
            />
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-6">
            {/* Add player form */}
            <div className="card-dark p-6 rounded-xl">
              <h3 className="font-serif text-lg font-bold mb-4" style={{ color: '#c9a84c' }}>
                Add Player
              </h3>
              <form onSubmit={addPlayer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    required
                    placeholder="Player name"
                    className="w-full p-3 rounded-lg font-serif text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                  />
                </div>
                <div>
                  <select
                    value={newPlayerTier}
                    onChange={e => setNewPlayerTier(e.target.value)}
                    className="w-full p-3 rounded-lg font-serif text-sm"
                    style={{ background: '#1a2e1a', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                  >
                    <option value="1">Tier 1</option>
                    <option value="2">Tier 2</option>
                    <option value="3">Tier 3</option>
                    <option value="4">Tier 4</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={newPlayerOdds}
                    onChange={e => setNewPlayerOdds(e.target.value)}
                    placeholder="Odds (e.g. +350)"
                    className="w-full p-3 rounded-lg font-serif text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={newPlayerRanking}
                    onChange={e => setNewPlayerRanking(e.target.value)}
                    placeholder="World rank"
                    className="w-full p-3 rounded-lg font-serif text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                  />
                </div>
                <div>
                  <button type="submit" disabled={addingPlayer} className="btn-gold w-full py-3 text-sm">
                    {addingPlayer ? 'Adding...' : 'Add Player'}
                  </button>
                </div>
              </form>
            </div>

            {/* Players list */}
            <div className="card-dark rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
                    {['Tier', 'Name', 'Odds', 'World Rank', 'Score', 'Status', ''].map(h => (
                      <th key={h} className="font-serif text-left py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => (
                    <tr key={player.id} className="leaderboard-row" style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold px-2 py-1 rounded font-serif" style={{
                          color: ['#c9a84c', '#a0c878', '#6a9a6a', '#4a7a4a'][player.tier - 1],
                          background: 'rgba(255,255,255,0.05)',
                        }}>
                          T{player.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-serif text-sm" style={{ color: '#f5efe0' }}>{player.name}</td>
                      <td className="py-3 px-4 font-serif text-sm" style={{ color: 'rgba(245,239,224,0.5)' }}>{player.odds || '—'}</td>
                      <td className="py-3 px-4 font-serif text-sm" style={{ color: 'rgba(245,239,224,0.5)' }}>{player.worldRanking || '—'}</td>
                      <td className="py-3 px-4 font-serif text-sm" style={{ color: 'rgba(245,239,224,0.7)' }}>
                        {player.totalScore === null ? '—' : player.totalScore === 0 ? 'E' : player.totalScore > 0 ? `+${player.totalScore}` : `${player.totalScore}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-serif" style={{ color: player.status === 'CUT' || player.status === 'WD' ? 'rgba(245,239,224,0.3)' : '#a0c878' }}>
                          {player.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => deletePlayer(player.id)}
                          className="text-xs font-serif px-2 py-1 rounded"
                          style={{ color: '#e63c3c', background: 'rgba(230,60,60,0.1)' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="card-dark p-6 rounded-xl max-w-lg">
            <h3 className="font-serif text-lg font-bold mb-4" style={{ color: '#c9a84c' }}>
              Update Tournament Status
            </h3>
            <p className="font-serif text-sm mb-6" style={{ color: 'rgba(245,239,224,0.5)' }}>
              Current status: <span style={{ color: '#c9a84c' }}>{major?.status.replace('_', ' ')}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={statusUpdating || major?.status === s}
                  className="py-3 px-4 rounded-lg font-serif text-sm font-bold transition-all"
                  style={{
                    background: major?.status === s ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
                    color: major?.status === s ? '#c9a84c' : 'rgba(245,239,224,0.6)',
                    border: major?.status === s ? '2px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    cursor: major?.status === s ? 'default' : 'pointer',
                  }}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
            {statusMessage && (
              <div className="mt-4 p-3 rounded-lg" style={{
                background: statusMessage.startsWith('Error') ? 'rgba(230,60,60,0.1)' : 'rgba(160,200,120,0.1)',
                border: `1px solid ${statusMessage.startsWith('Error') ? 'rgba(230,60,60,0.3)' : 'rgba(160,200,120,0.3)'}`,
              }}>
                <p className="font-serif text-sm" style={{ color: statusMessage.startsWith('Error') ? '#e63c3c' : '#a0c878' }}>
                  {statusMessage}
                </p>
              </div>
            )}
            <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(255,200,0,0.05)', border: '1px solid rgba(255,200,0,0.1)' }}>
              <p className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.5)' }}>
                ⚠ Changing to IN_PROGRESS will lock all existing picks. This cannot be undone.
              </p>
            </div>

            {/* Cut Score Section */}
            <div className="mt-8">
              <h3 className="font-serif text-lg font-bold mb-2" style={{ color: '#c9a84c' }}>
                Cut-Line Score Cap
              </h3>
              <p className="font-serif text-sm mb-4" style={{ color: 'rgba(245,239,224,0.5)' }}>
                Set the cut line (relative to par) for this tournament. Players who made the cut
                will have their R3 and R4 scores capped at this value for pool scoring purposes.
                {major?.cutScore != null && (
                  <span style={{ color: '#a0c878' }}>
                    {' '}Current cut score: <strong>{major.cutScore >= 0 ? '+' : ''}{major.cutScore}</strong>
                  </span>
                )}
                {major?.cutScore == null && (
                  <span style={{ color: 'rgba(245,239,224,0.3)' }}> Not set.</span>
                )}
              </p>
              <form onSubmit={updateCutScore} className="flex items-center gap-3">
                <input
                  type="number"
                  value={cutScoreInput}
                  onChange={e => setCutScoreInput(e.target.value)}
                  placeholder="e.g. 3 for +3"
                  className="w-36 p-3 rounded-lg font-serif text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                />
                <button
                  type="submit"
                  disabled={cutScoreUpdating}
                  className="btn-gold py-3 px-5 text-sm"
                >
                  {cutScoreUpdating ? 'Saving...' : 'Set Cut Score'}
                </button>
                {cutScoreInput.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => { setCutScoreInput(''); }}
                    className="font-serif text-xs px-3 py-2 rounded"
                    style={{ color: 'rgba(245,239,224,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Clear
                  </button>
                )}
              </form>
              {cutScoreMessage && (
                <div className="mt-3 p-3 rounded-lg" style={{
                  background: cutScoreMessage.startsWith('Error') ? 'rgba(230,60,60,0.1)' : 'rgba(160,200,120,0.1)',
                  border: `1px solid ${cutScoreMessage.startsWith('Error') ? 'rgba(230,60,60,0.3)' : 'rgba(160,200,120,0.3)'}`,
                }}>
                  <p className="font-serif text-sm" style={{ color: cutScoreMessage.startsWith('Error') ? '#e63c3c' : '#a0c878' }}>
                    {cutScoreMessage}
                  </p>
                </div>
              )}
              <p className="font-serif text-xs mt-3" style={{ color: 'rgba(245,239,224,0.35)' }}>
                Example: Enter 3 to mean the cut was +3. Leave blank to disable the cap rule.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
