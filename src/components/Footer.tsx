import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#0a1a0a', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-3" style={{ color: '#c9a84c' }}>
              Say Amen at the Corner
            </h3>
            <p className="font-serif text-sm leading-relaxed" style={{ color: 'rgba(245,239,224,0.5)' }}>
              The premier golf major pool for the 2026 season. Named after the legendary 16th hole at Augusta National.
            </p>
            {/* Golf hole SVG illustration */}
            <div className="mt-4">
              <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Fairway */}
                <ellipse cx="60" cy="45" rx="55" ry="12" fill="rgba(30,74,30,0.4)" />
                {/* Green */}
                <ellipse cx="85" cy="38" rx="22" ry="10" fill="rgba(46,90,46,0.6)" />
                {/* Flag pole */}
                <line x1="85" y1="38" x2="85" y2="15" stroke="#c9a84c" strokeWidth="1.5"/>
                {/* Flag */}
                <path d="M85 15 L100 20 L85 25 Z" fill="#c9a84c"/>
                {/* Water hazard */}
                <ellipse cx="30" cy="42" rx="18" ry="6" fill="rgba(30,60,100,0.4)" />
                <path d="M15 42 Q22 38 30 42 Q38 46 45 42" stroke="rgba(100,150,200,0.3)" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              2026 Majors
            </h4>
            <ul className="space-y-2">
              {[
                { name: 'The Masters', date: 'April 9-12', venue: 'Augusta National' },
                { name: 'PGA Championship', date: 'May 21-24', venue: 'Quail Hollow' },
                { name: 'U.S. Open', date: 'June 18-21', venue: 'Shinnecock Hills' },
                { name: 'The Open Championship', date: 'July 16-19', venue: 'Royal Portrush' },
              ].map((major) => (
                <li key={major.name}>
                  <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.6)' }}>
                    {major.name}
                  </span>
                  <span className="font-serif text-xs ml-2" style={{ color: 'rgba(201,168,76,0.5)' }}>
                    {major.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-serif text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              Pool Rules
            </h4>
            <ul className="space-y-2">
              {[
                '12 players per major',
                'Best 10 of 12 count',
                '4 tiers by odds',
                'Earnings-based scoring',
                'Season leaderboard',
              ].map((rule) => (
                <li key={rule} className="flex items-center gap-2">
                  <span style={{ color: '#c9a84c', fontSize: '8px' }}>&#9670;</span>
                  <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.6)' }}>
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gold-divider mt-8 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.3)' }}>
            &copy; 2026 Say Amen at the Corner. All rights reserved.
          </p>
          <p className="font-serif text-xs italic" style={{ color: 'rgba(201,168,76,0.4)' }}>
            &ldquo;A tradition unlike any other.&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
