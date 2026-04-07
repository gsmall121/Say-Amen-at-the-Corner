import Link from 'next/link';

interface MajorCardProps {
  id: string;
  name: string;
  year: number;
  venue: string;
  location: string;
  startDate: string | Date;
  endDate: string | Date;
  status: string;
  hasSubmittedPicks?: boolean;
  showActions?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  UPCOMING: { label: 'Coming Soon', color: 'rgba(245,239,224,0.5)', bg: 'rgba(245,239,224,0.08)' },
  PICKS_OPEN: { label: 'Picks Open', color: '#a0c878', bg: 'rgba(160,200,120,0.12)' },
  IN_PROGRESS: { label: 'Live', color: '#e63c3c', bg: 'rgba(230,60,60,0.12)' },
  COMPLETED: { label: 'Completed', color: '#c9a84c', bg: 'rgba(201,168,76,0.12)' },
};

const majorIcons: Record<string, React.ReactNode> = {
  'The Masters': (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.4"/>
      {/* Augusta tree */}
      <path d="M24 8 L30 20 L34 16 L28 30 L36 26 L24 40 L12 26 L20 30 L14 16 L18 20 Z" fill="#2e4a2e" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.6"/>
      <rect x="22" y="38" width="4" height="6" fill="#c9a84c" opacity="0.6"/>
    </svg>
  ),
  'PGA Championship': (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.4"/>
      {/* Wanamaker Trophy */}
      <path d="M20 12 L28 12 L30 20 Q34 24 30 28 L28 36 L20 36 L18 28 Q14 24 18 20 Z" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeOpacity="0.7"/>
      <path d="M20 12 L16 14 M28 12 L32 14" stroke="#c9a84c" strokeWidth="1.5" strokeOpacity="0.5"/>
      <rect x="20" y="36" width="8" height="3" fill="#c9a84c" opacity="0.5"/>
    </svg>
  ),
  'U.S. Open': (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.4"/>
      {/* US Open cup */}
      <path d="M16 14 L32 14 L30 30 Q28 34 24 34 Q20 34 18 30 Z" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeOpacity="0.7"/>
      <line x1="12" y1="14" x2="36" y2="14" stroke="#c9a84c" strokeWidth="1.5" strokeOpacity="0.5"/>
      <path d="M22 34 L22 38 L26 38 L26 34" stroke="#c9a84c" strokeWidth="1.5" strokeOpacity="0.5"/>
    </svg>
  ),
  'The Open Championship': (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.4"/>
      {/* Claret Jug */}
      <path d="M20 10 L28 10 Q32 10 32 14 L30 22 Q36 24 36 30 Q36 36 28 38 L20 38 Q12 36 12 30 Q12 24 18 22 L16 14 Q16 10 20 10 Z" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeOpacity="0.7"/>
      <path d="M30 22 L34 20" stroke="#c9a84c" strokeWidth="1.5" strokeOpacity="0.5"/>
    </svg>
  ),
};

function formatDateRange(start: string | Date, end: string | Date): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const month = startDate.toLocaleDateString('en-US', { month: 'long' });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = startDate.getFullYear();
  return `${month} ${startDay}-${endDay}, ${year}`;
}

export default function MajorCard({
  id,
  name,
  year,
  venue,
  location,
  startDate,
  endDate,
  status,
  hasSubmittedPicks,
  showActions = true,
}: MajorCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.UPCOMING;
  const icon = majorIcons[name];
  const dateRange = formatDateRange(startDate, endDate);

  return (
    <div className="card-green p-6 hover:border-gold-600/40 transition-all duration-300 group" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
          {icon}
        </div>
        <span
          className="text-xs font-serif px-3 py-1 rounded-full uppercase tracking-wider"
          style={{ color: statusInfo.color, background: statusInfo.bg, border: `1px solid ${statusInfo.color}30` }}
        >
          {statusInfo.label}
          {status === 'IN_PROGRESS' && (
            <span className="inline-block w-2 h-2 rounded-full ml-2 animate-pulse" style={{ background: '#e63c3c' }} />
          )}
        </span>
      </div>

      <h3 className="font-serif text-xl font-bold mb-1 group-hover:text-gold-400 transition-colors" style={{ color: '#c9a84c' }}>
        {name}
      </h3>
      <p className="font-serif text-sm mb-1" style={{ color: 'rgba(245,239,224,0.6)' }}>
        {venue}
      </p>
      <p className="font-serif text-sm mb-3" style={{ color: 'rgba(245,239,224,0.4)' }}>
        {location}
      </p>

      <div className="flex items-center gap-2 mb-5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="11" rx="1" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.6"/>
          <line x1="4" y1="1" x2="4" y2="4" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.6"/>
          <line x1="10" y1="1" x2="10" y2="4" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.6"/>
          <line x1="1" y1="6" x2="13" y2="6" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.4"/>
        </svg>
        <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.7)' }}>
          {dateRange}
        </span>
      </div>

      {hasSubmittedPicks && (
        <div className="mb-4 flex items-center gap-2">
          <span style={{ color: '#a0c878', fontSize: '10px' }}>&#10003;</span>
          <span className="font-serif text-xs" style={{ color: '#a0c878' }}>Picks submitted</span>
        </div>
      )}

      {showActions && (
        <div className="flex gap-3">
          {status === 'PICKS_OPEN' && (
            <Link
              href={`/picks/${id}`}
              className="btn-gold text-sm py-2 px-4 flex-1 text-center"
            >
              {hasSubmittedPicks ? 'Edit Picks' : 'Make Picks'}
            </Link>
          )}
          {(status === 'IN_PROGRESS' || status === 'COMPLETED') && (
            <Link
              href={`/leaderboard/${id}`}
              className="btn-gold text-sm py-2 px-4 flex-1 text-center"
            >
              View Leaderboard
            </Link>
          )}
          {status === 'UPCOMING' && (
            <span
              className="font-serif text-sm py-2 px-4 flex-1 text-center rounded-lg"
              style={{ color: 'rgba(245,239,224,0.4)', background: 'rgba(245,239,224,0.05)', border: '1px solid rgba(245,239,224,0.1)' }}
            >
              Picks Open Soon
            </span>
          )}
        </div>
      )}
    </div>
  );
}
