'use client';

import { useState } from 'react';

interface RoundScore {
  round: number;
  score: number | null;
  scoreToPar: number | null;
}

interface Player {
  id: string;
  name: string;
  tier: number;
  totalScore: number | null;
  position: number | null;
  status: string;
  scores: RoundScore[];
}

interface PlayerRowProps {
  player: Player;
  onSave: (playerId: string, totalScore: string, position: string, status: string) => Promise<void>;
}

function PlayerRow({ player, onSave }: PlayerRowProps) {
  const [localScore, setLocalScore] = useState(player.totalScore?.toString() ?? '');
  const [localPos, setLocalPos] = useState(player.position?.toString() ?? '');
  const [localStatus, setLocalStatus] = useState(player.status);
  const [saving, setSaving] = useState(false);

  const STATUS_OPTIONS = ['ACTIVE', 'CUT', 'WD', 'DQ'];

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(player.id, localScore, localPos, localStatus);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="leaderboard-row" style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
      <td className="py-2 px-3">
        <span className="text-xs font-bold px-2 py-1 rounded font-serif" style={{
          background: ['rgba(201,168,76,0.15)', 'rgba(160,200,120,0.12)', 'rgba(106,154,106,0.1)', 'rgba(74,122,74,0.1)'][player.tier - 1],
          color: ['#c9a84c', '#a0c878', '#6a9a6a', '#4a7a4a'][player.tier - 1],
        }}>
          T{player.tier}
        </span>
      </td>
      <td className="py-2 px-3">
        <span className="font-serif text-sm" style={{ color: '#f5efe0' }}>{player.name}</span>
      </td>
      <td className="py-2 px-3">
        <input
          type="number"
          value={localScore}
          onChange={e => setLocalScore(e.target.value)}
          placeholder="E"
          className="w-20 p-2 rounded font-serif text-sm text-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
        />
      </td>
      <td className="py-2 px-3">
        <input
          type="number"
          value={localPos}
          onChange={e => setLocalPos(e.target.value)}
          placeholder="—"
          className="w-20 p-2 rounded font-serif text-sm text-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
        />
      </td>
      <td className="py-2 px-3">
        <select
          value={localStatus}
          onChange={e => setLocalStatus(e.target.value)}
          className="p-2 rounded font-serif text-sm"
          style={{
            background: '#1a2e1a',
            border: '1px solid rgba(201,168,76,0.2)',
            color: localStatus === 'CUT' || localStatus === 'WD' ? 'rgba(245,239,224,0.4)' : '#f5efe0',
            outline: 'none',
          }}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>
      <td className="py-2 px-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-serif px-3 py-2 rounded"
          style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}
        >
          {saving ? '...' : 'Save'}
        </button>
      </td>
    </tr>
  );
}

interface ScoreEntryProps {
  players: Player[];
  majorId: string;
  onSync: () => Promise<void>;
}

export default function ScoreEntry({ players: initialPlayers, majorId, onSync }: ScoreEntryProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);

    try {
      const resp = await fetch('/api/scores/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ majorId }),
      });
      const data = await resp.json();

      if (resp.ok) {
        setSyncResult(`Synced ${data.updatedCount} players from ESPN API`);
        await onSync();
      } else {
        setSyncResult(`Sync failed: ${data.error}`);
      }
    } catch {
      setSyncResult('Sync failed: Network error');
    } finally {
      setSyncing(false);
    }
  }

  async function handleScoreUpdate(playerId: string, totalScore: string, position: string, status: string) {
    const resp = await fetch('/api/admin/scores', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        totalScore: totalScore !== '' ? parseInt(totalScore, 10) : undefined,
        position: position !== '' ? parseInt(position, 10) : undefined,
        status,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      setPlayers(prev => prev.map(p =>
        p.id === playerId ? { ...p, ...data.player } : p
      ));
    }
  }

  return (
    <div>
      {/* Sync button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-gold py-3 px-6 flex items-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={syncing ? 'animate-spin' : ''}
          >
            <path d="M14 8C14 11.314 11.314 14 8 14C4.686 14 2 11.314 2 8C2 4.686 4.686 2 8 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 2L10 5M8 2L6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {syncing ? 'Syncing from ESPN...' : 'Sync from ESPN API'}
        </button>

        {syncResult && (
          <span className="font-serif text-sm" style={{ color: syncResult.includes('failed') ? '#e63c3c' : '#a0c878' }}>
            {syncResult}
          </span>
        )}
      </div>

      {/* Search filter */}
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter players..."
          className="w-full sm:w-64 p-2 rounded-lg font-serif text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
              {['Tier', 'Player', 'Total Score', 'Position', 'Status', 'Save'].map(h => (
                <th key={h} className="font-serif text-left py-3 px-3 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(player => (
              <PlayerRow
                key={player.id}
                player={player}
                onSave={handleScoreUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
