'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold-600/30" style={{ background: 'rgba(10, 26, 10, 0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {/* Golf pin SVG */}
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="#c9a84c"/>
              <circle cx="14" cy="14" r="7" fill="#1a2e1a"/>
              <path d="M14 7v14M14 7l5 4-5 4" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="leading-tight">
              <div className="text-gold-600 font-serif font-bold text-sm sm:text-base tracking-wide" style={{ color: '#c9a84c' }}>
                SAY AMEN
              </div>
              <div className="text-gold-400/70 font-serif text-xs tracking-widest uppercase" style={{ color: 'rgba(201,168,76,0.6)' }}>
                AT THE CORNER
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {session ? (
              <>
                <Link href="/dashboard" className="text-cream/80 hover:text-gold-600 font-serif text-sm transition-colors" style={{ color: 'rgba(245,239,224,0.8)' }}>
                  Dashboard
                </Link>
                <Link href="/leaderboard/season" className="text-cream/80 hover:text-gold-600 font-serif text-sm transition-colors" style={{ color: 'rgba(245,239,224,0.8)' }}>
                  Season Standings
                </Link>
                {(session.user as any)?.role === 'ADMIN' && (
                  <Link href="/admin" className="font-serif text-sm transition-colors" style={{ color: '#c9a84c' }}>
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3 border-l border-gold-600/20 pl-6" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
                  <span className="text-cream/60 font-serif text-sm" style={{ color: 'rgba(245,239,224,0.6)' }}>
                    {session.user?.name}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="btn-outline-gold text-sm py-2 px-4"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="btn-gold text-sm py-2 px-5">
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#c9a84c' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gold-600/20" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
            {session ? (
              <div className="flex flex-col gap-4">
                <Link href="/dashboard" className="font-serif text-sm px-2 py-1" style={{ color: 'rgba(245,239,224,0.8)' }} onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/leaderboard/season" className="font-serif text-sm px-2 py-1" style={{ color: 'rgba(245,239,224,0.8)' }} onClick={() => setMobileMenuOpen(false)}>
                  Season Standings
                </Link>
                {(session.user as any)?.role === 'ADMIN' && (
                  <Link href="/admin" className="font-serif text-sm px-2 py-1" style={{ color: '#c9a84c' }} onClick={() => setMobileMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <div className="pt-3 border-t border-gold-600/20" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
                  <p className="font-serif text-sm mb-2 px-2" style={{ color: 'rgba(245,239,224,0.6)' }}>{session.user?.name}</p>
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false); }}
                    className="btn-outline-gold text-sm py-2 px-4 ml-2"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-gold text-sm py-2 px-5 inline-block" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
