'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string;
  accessCode: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { picks: number };
}

export default function AdminUserTable({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const resp = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, accessCode }),
      });

      const data = await resp.json();
      if (!resp.ok) { setError(data.error || 'Failed to create user'); return; }

      setName('');
      setAccessCode('');
      setShowForm(false);

      const usersResp = await fetch('/api/admin/users');
      const usersData = await usersResp.json();
      if (usersData.users) setUsers(usersData.users);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  }

  function copyCode(id: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Suggest a code from the name
  function suggestCode() {
    if (!name) return;
    const suggested = name.split(' ').map(w => w[0]).join('').toUpperCase() +
      Math.floor(Math.random() * 90 + 10);
    setAccessCode(suggested);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-bold" style={{ color: '#c9a84c' }}>
          Pool Members ({users.filter(u => u.role !== 'ADMIN').length})
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setError(null); }}
          className="btn-gold text-sm py-2 px-5"
        >
          {showForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-5 rounded-xl" style={{ background: 'rgba(10,26,10,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <h3 className="font-serif text-base font-bold mb-4" style={{ color: 'rgba(245,239,224,0.9)' }}>
            Add New Member
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-serif text-sm mb-1" style={{ color: 'rgba(245,239,224,0.6)' }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-3 rounded-lg font-serif text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block font-serif text-sm mb-1" style={{ color: 'rgba(245,239,224,0.6)' }}>
                Access Code
                <button type="button" onClick={suggestCode} className="ml-2 text-xs" style={{ color: 'rgba(201,168,76,0.6)' }}>
                  (suggest one)
                </button>
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value.toUpperCase())}
                required
                className="w-full p-3 rounded-lg font-serif text-sm tracking-widest"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c', outline: 'none' }}
                placeholder="e.g. TIGER7"
              />
            </div>
          </div>
          <p className="font-serif text-xs mb-4" style={{ color: 'rgba(245,239,224,0.35)' }}>
            Share this code with the member — they type it on the login page to enter the pool.
          </p>
          {error && <p className="font-serif text-sm mb-4" style={{ color: '#e63c3c' }}>{error}</p>}
          <button type="submit" disabled={creating} className="btn-gold text-sm py-2 px-6">
            {creating ? 'Creating...' : 'Add Member'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
              {['Name', 'Access Code', 'Picks', 'Added', ''].map(h => (
                <th key={h} className="font-serif text-left py-3 px-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.7)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="leaderboard-row" style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                <td className="py-3 px-4">
                  <span className="font-serif text-sm font-bold" style={{ color: '#f5efe0' }}>{user.name}</span>
                  {user.role === 'ADMIN' && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>Admin</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="font-serif text-sm tracking-widest font-bold" style={{ color: '#c9a84c' }}>
                    {user.accessCode}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.6)' }}>{user._count.picks}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.4)' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => copyCode(user.id, user.accessCode)}
                    className="text-xs font-serif px-3 py-1 rounded"
                    style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)' }}
                  >
                    {copiedId === user.id ? 'Copied!' : 'Copy Code'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
