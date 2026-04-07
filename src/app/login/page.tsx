'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        accessCode: code.toUpperCase().trim(),
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid access code. Contact the commissioner if you need help.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,120 Q360,60 720,100 Q1080,140 1440,80 L1440,200 L0,200 Z" fill="rgba(26,46,26,0.4)"/>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="font-serif font-bold mb-2" style={{ fontSize: '2rem', color: '#c9a84c' }}>
              Say Amen at the Corner
            </h1>
          </Link>
          <p className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.4)', letterSpacing: '0.15em' }}>
            2026 GOLF MAJOR POOL
          </p>
        </div>

        <div className="card-dark p-8 rounded-2xl">
          <h2 className="font-serif text-2xl font-bold mb-2 text-center" style={{ color: '#f5efe0' }}>
            Enter Your Code
          </h2>
          <p className="font-serif text-sm text-center mb-8" style={{ color: 'rgba(245,239,224,0.4)' }}>
            Enter the access code the commissioner sent you
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                required
                autoComplete="off"
                autoFocus
                spellCheck={false}
                className="w-full p-5 rounded-lg font-serif text-2xl text-center tracking-widest transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#c9a84c',
                  outline: 'none',
                  letterSpacing: '0.25em',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid rgba(201,168,76,0.7)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(201,168,76,0.3)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="YOURCODE"
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg" style={{ background: 'rgba(230,60,60,0.1)', border: '1px solid rgba(230,60,60,0.3)' }}>
                <p className="font-serif text-sm text-center" style={{ color: '#e63c3c' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.trim().length === 0}
              className="btn-gold w-full py-4 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                    <path d="M14 8C14 11.314 11.314 14 8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Entering the pool...
                </span>
              ) : 'Enter the Pool'}
            </button>
          </form>

          <div className="gold-divider mt-8 mb-6" />
          <p className="font-serif text-sm text-center" style={{ color: 'rgba(245,239,224,0.35)' }}>
            Don&apos;t have a code? Contact the commissioner.
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="font-serif text-sm hover:opacity-80 transition-opacity" style={{ color: 'rgba(201,168,76,0.5)' }}>
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
