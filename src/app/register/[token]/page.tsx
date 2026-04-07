'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: { token: string };
}

export default function RegisterPage({ params }: PageProps) {
  const router = useRouter();
  const { token } = params;

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function validateToken() {
      try {
        const resp = await fetch(`/api/auth/validate-token?token=${token}`);
        const data = await resp.json();
        if (resp.ok && data.valid) {
          setTokenValid(true);
          setUserEmail(data.email || '');
          setName(data.name || '');
        } else {
          setTokenValid(false);
        }
      } catch {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    }
    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        router.push('/login?registered=1');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-bg">
        <div className="text-center">
          <div className="font-serif text-lg" style={{ color: 'rgba(245,239,224,0.6)' }}>Validating invite...</div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-bg px-4">
        <div className="text-center max-w-md">
          <h2 className="font-serif text-3xl font-bold mb-4" style={{ color: '#c9a84c' }}>
            Invalid Invite Link
          </h2>
          <p className="font-serif text-base mb-8" style={{ color: 'rgba(245,239,224,0.6)' }}>
            This invite link is invalid or has already been used. Contact the commissioner for a new invite.
          </p>
          <Link href="/login" className="btn-gold py-3 px-8">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-bg">
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
            Activate Your Account
          </h2>
          <p className="font-serif text-sm text-center mb-8" style={{ color: 'rgba(245,239,224,0.4)' }}>
            You&apos;ve been invited to join the pool
          </p>

          {userEmail && (
            <div className="mb-6 p-3 rounded-lg text-center" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <span className="font-serif text-sm" style={{ color: 'rgba(201,168,76,0.8)' }}>{userEmail}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-serif text-sm mb-2" style={{ color: 'rgba(245,239,224,0.7)' }}>
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-4 rounded-lg font-serif text-base"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block font-serif text-sm mb-2" style={{ color: 'rgba(245,239,224,0.7)' }}>
                Create Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full p-4 rounded-lg font-serif text-base"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block font-serif text-sm mb-2" style={{ color: 'rgba(245,239,224,0.7)' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full p-4 rounded-lg font-serif text-base"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                placeholder="Repeat your password"
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg" style={{ background: 'rgba(230,60,60,0.1)', border: '1px solid rgba(230,60,60,0.3)' }}>
                <p className="font-serif text-sm" style={{ color: '#e63c3c' }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base">
              {loading ? 'Activating...' : 'Activate My Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link href="/login" className="font-serif text-sm" style={{ color: 'rgba(201,168,76,0.5)' }}>
            Already have an account? Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
