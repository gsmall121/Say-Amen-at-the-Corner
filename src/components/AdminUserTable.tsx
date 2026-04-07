'use client';

import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  inviteToken: string | null;
  createdAt: string;
  _count: { picks: number };
}

interface AdminUserTableProps {
  users: User[];
}

export default function AdminUserTable({ users: initialUsers }: AdminUserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const resp = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.error || 'Failed to create user');
        return;
      }

      setLastInviteLink(data.inviteLink);
      setName('');
      setEmail('');
      setShowForm(false);

      // Refresh users
      const usersResp = await fetch('/api/admin/users');
      const usersData = await usersResp.json();
      if (usersData.users) setUsers(usersData.users);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-bold" style={{ color: '#c9a84c' }}>
          Pool Members ({users.length})
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setLastInviteLink(null); setError(null); }}
          className="btn-gold text-sm py-2 px-5"
        >
          {showForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {lastInviteLink && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(160,200,120,0.1)', border: '1px solid rgba(160,200,120,0.3)' }}>
          <p className="font-serif text-sm font-bold mb-2" style={{ color: '#a0c878' }}>
            Invite link created! Share this link:
          </p>
          <div className="flex items-center gap-3">
            <code className="text-xs flex-1 p-2 rounded" style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(245,239,224,0.8)', wordBreak: 'break-all' }}>
              {lastInviteLink}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(lastInviteLink)}
              className="btn-outline-gold text-xs py-2 px-3 flex-shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      )}

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
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block font-serif text-sm mb-1" style={{ color: 'rgba(245,239,224,0.6)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg font-serif text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', color: '#f5efe0', outline: 'none' }}
                placeholder="email@example.com"
              />
            </div>
          </div>
          {error && (
            <p className="font-serif text-sm mb-4" style={{ color: '#e63c3c' }}>{error}</p>
          )}
          <button type="submit" disabled={creating} className="btn-gold text-sm py-2 px-6">
            {creating ? 'Creating...' : 'Create & Generate Invite Link'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
              {['Name', 'Email', 'Status', 'Picks', 'Joined', ''].map(h => (
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
                  <div>
                    <span className="font-serif text-sm font-bold" style={{ color: '#f5efe0' }}>{user.name}</span>
                    {user.role === 'ADMIN' && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>Admin</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.6)' }}>{user.email}</span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className="text-xs px-2 py-1 rounded-full font-serif"
                    style={{
                      background: user.isActive ? 'rgba(160,200,120,0.12)' : 'rgba(245,239,224,0.06)',
                      color: user.isActive ? '#a0c878' : 'rgba(245,239,224,0.4)',
                      border: `1px solid ${user.isActive ? 'rgba(160,200,120,0.3)' : 'rgba(245,239,224,0.1)'}`,
                    }}
                  >
                    {user.isActive ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-serif text-sm" style={{ color: 'rgba(245,239,224,0.6)' }}>{user._count.picks}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-serif text-xs" style={{ color: 'rgba(245,239,224,0.4)' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {!user.isActive && user.inviteToken && (
                    <button
                      onClick={() => {
                        const base = window.location.origin;
                        navigator.clipboard.writeText(`${base}/register/${user.inviteToken}`);
                      }}
                      className="text-xs font-serif px-3 py-1 rounded"
                      style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.2)' }}
                    >
                      Copy Invite
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
