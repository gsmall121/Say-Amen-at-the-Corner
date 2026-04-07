'use client';

import { useState } from 'react';

interface Player {
  id: string;
  name: string;
  tier: number;
  odds: string | null;
  worldRanking: number | null;
}

interface TierRequirements {
  tier: number;
  label: string;
  required: number;
  description: string;
  color: string;
  borderColor: string;
}

const TIER_CONFIG: TierRequirements[] = [
  {
    tier: 1,
    label: 'Tier 1 — The Elite',
    required: 3,
    description: 'Top 8 players by odds — Select 3',
    color: '#c9a84c',
    borderColor: 'rgba(201,168,76,0.5)',
  },
  {
    tier: 2,
    label: 'Tier 2 — Contenders',
    required: 4,
    description: 'Players ranked 9-30 — Select 4',
    color: '#a0c878',
    borderColor: 'rgba(160,200,120,0.5)',
  },
  {
    tier: 3,
    label: 'Tier 3 — Value Plays',
    required: 3,
    description: 'Players ranked 31-50 — Select 3',
    color: '#6a9a6a',
    borderColor: 'rgba(106,154,106,0.5)',
  },
  {
    tier: 4,
    label: 'Tier 4 — Long Shots',
    required: 2,
    description: 'Remaining field — Select 2',
    color: '#4a7a4a',
    borderColor: 'rgba(74,122,74,0.5)',
  },
];

interface PlayerTierSelectorProps {
  players: Player[];
  initialSelectedIds?: string[];
  onSubmit: (playerIds: string[]) => Promise<void>;
  isLocked?: boolean;
  deadline?: Date | null;
}

export default function PlayerTierSelector({
  players,
  initialSelectedIds = [],
  onSubmit,
  isLocked = false,
  deadline,
}: PlayerTierSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playersByTier = TIER_CONFIG.map(config => ({
    ...config,
    players: players.filter(p => p.tier === config.tier),
    selected: players.filter(p => p.tier === config.tier && selectedIds.has(p.id)),
  }));

  const totalSelected = selectedIds.size;
  const allValid = playersByTier.every(t => t.selected.length === t.required);

  function togglePlayer(player: Player) {
    if (isLocked) return;

    const tierConfig = TIER_CONFIG.find(t => t.tier === player.tier)!;
    const tierSelected = players.filter(p => p.tier === player.tier && selectedIds.has(p.id));

    const newSelected = new Set(selectedIds);

    if (newSelected.has(player.id)) {
      newSelected.delete(player.id);
    } else {
      if (tierSelected.length >= tierConfig.required) {
        return; // Tier is full
      }
      newSelected.add(player.id);
    }

    setSelectedIds(newSelected);
    setError(null);
  }

  async function handleSubmit() {
    if (!allValid) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(Array.from(selectedIds));
    } catch (e: any) {
      setError(e.message || 'Failed to submit picks');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="card-dark p-5 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.6)' }}>
            Total picks: {totalSelected} / 12
          </span>
          {allValid && (
            <span className="text-sm font-serif px-3 py-1 rounded-full" style={{ background: 'rgba(160,200,120,0.15)', color: '#a0c878', border: '1px solid rgba(160,200,120,0.3)' }}>
              Ready to submit
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {playersByTier.map(tier => (
            <div key={tier.tier} className="flex-1">
              <div className="text-xs font-serif mb-1 text-center" style={{ color: tier.color }}>
                T{tier.tier}: {tier.selected.length}/{tier.required}
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    background: tier.color,
                    width: `${(tier.selected.length / tier.required) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier sections */}
      {playersByTier.map((tierData) => (
        <div key={tierData.tier} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tierData.borderColor}` }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ background: `rgba(10,26,10,0.8)`, borderBottom: `1px solid ${tierData.borderColor}` }}>
            <div>
              <h3 className="font-serif font-bold text-lg" style={{ color: tierData.color }}>
                {tierData.label}
              </h3>
              <p className="font-serif text-sm mt-0.5" style={{ color: 'rgba(245,239,224,0.5)' }}>
                {tierData.description}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-xl"
              style={{
                background: tierData.selected.length === tierData.required
                  ? `rgba(${tierData.color === '#c9a84c' ? '201,168,76' : '160,200,120'}, 0.2)`
                  : 'rgba(255,255,255,0.05)',
                border: `2px solid ${tierData.color}`,
                color: tierData.color,
              }}
            >
              {tierData.selected.length}/{tierData.required}
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" style={{ background: 'rgba(26,46,26,0.5)' }}>
            {tierData.players.map((player) => {
              const isSelected = selectedIds.has(player.id);
              const tierFull = tierData.selected.length >= tierData.required && !isSelected;

              return (
                <button
                  key={player.id}
                  onClick={() => togglePlayer(player)}
                  disabled={isLocked || (tierFull && !isSelected)}
                  className="relative text-left rounded-lg p-3 transition-all duration-200"
                  style={{
                    background: isSelected
                      ? `rgba(${tierData.color === '#c9a84c' ? '201,168,76' : '160,200,120'}, 0.15)`
                      : 'rgba(10,26,10,0.6)',
                    border: isSelected
                      ? `2px solid ${tierData.color}`
                      : `1px solid rgba(255,255,255,0.08)`,
                    opacity: tierFull && !isSelected ? 0.4 : 1,
                    cursor: isLocked || (tierFull && !isSelected) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: tierData.color, color: '#1a2e1a' }}
                    >
                      ✓
                    </div>
                  )}
                  <p className="font-serif font-bold text-sm pr-6" style={{ color: isSelected ? '#f5efe0' : 'rgba(245,239,224,0.8)' }}>
                    {player.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {player.worldRanking && (
                      <span className="text-xs font-serif" style={{ color: 'rgba(245,239,224,0.4)' }}>
                        #{player.worldRanking}
                      </span>
                    )}
                    {player.odds && (
                      <span className="text-xs font-serif" style={{ color: tierData.color, opacity: 0.8 }}>
                        {player.odds}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected players summary */}
      {totalSelected > 0 && (
        <div className="card-dark p-5 rounded-xl">
          <h4 className="font-serif text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: '#c9a84c' }}>
            Your Selections ({totalSelected}/12)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from(selectedIds).map(id => {
              const player = players.find(p => p.id === id);
              if (!player) return null;
              const tierConfig = TIER_CONFIG.find(t => t.tier === player.tier)!;
              return (
                <div key={id} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: tierConfig.color, color: '#1a2e1a' }}>
                    {player.tier}
                  </span>
                  <span className="font-serif text-sm truncate" style={{ color: 'rgba(245,239,224,0.8)' }}>
                    {player.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg p-4" style={{ background: 'rgba(230,60,60,0.1)', border: '1px solid rgba(230,60,60,0.3)' }}>
          <p className="font-serif text-sm" style={{ color: '#e63c3c' }}>{error}</p>
        </div>
      )}

      {deadline && (
        <p className="font-serif text-sm text-center" style={{ color: 'rgba(245,239,224,0.4)' }}>
          Picks lock when the tournament begins on {new Date(deadline).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      )}

      {!isLocked && (
        <button
          onClick={handleSubmit}
          disabled={!allValid || isSubmitting}
          className="btn-gold w-full py-4 text-lg font-serif"
        >
          {isSubmitting ? 'Submitting...' : allValid ? 'Confirm My Picks' : `Select ${12 - totalSelected} More Player${12 - totalSelected !== 1 ? 's' : ''}`}
        </button>
      )}

      {isLocked && (
        <div className="text-center py-4">
          <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.5)' }}>
            Picks are locked — tournament has begun
          </span>
        </div>
      )}
    </div>
  );
}
