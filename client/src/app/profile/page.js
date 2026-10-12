'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadProfile(token);
  }, [router]);

  const loadProfile = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setUsername(data.user.username);
        setEmail(data.user.email);
        setStats(data.stats);
      } else {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          setUser(u);
          setUsername(u.username);
          setEmail(u.email);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('Server connection error while saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      }
    } catch (err) {
      console.error('Failed to delete account', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <span className="text-gray-400">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
        <div className="rounded-3xl bg-[#14141a] border border-white/10 shadow-2xl overflow-hidden">
          {/* Yellow Top Banner (Matching Screenshot 2) */}
          <div className="h-32 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 relative">
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
              <div className="w-28 h-28 rounded-full border-4 border-[#14141a] bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-4xl font-extrabold text-white shadow-2xl">
                {username ? username.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>

          {/* User Name & Email Header */}
          <div className="pt-18 pb-6 px-8 text-center border-b border-white/10">
            <h1 className="text-2xl font-black text-white">{username || 'Aditya Thakur'}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{email || 'aditya@gmail.com'}</p>

            {/* Quick Stats Pill */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-6 pt-4 border-t border-white/5 text-center">
                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <div className="text-lg font-bold text-emerald-400">{stats.totalHabits}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Habits</div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <div className="text-lg font-bold text-blue-400">{stats.totalFocusHours}h</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Focus Time</div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <div className="text-lg font-bold text-purple-400">{stats.totalCompletedDays}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Logs Done</div>
                </div>
              </div>
            )}
          </div>

          {/* Form Body */}
          <div className="p-8">
            {successMsg && (
              <div className="p-3.5 mb-6 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold text-center">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 mb-6 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-semibold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">Full Name / Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Profile Avatar Upload preview placeholder */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">Profile Avatar</label>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                    {username ? username.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Default Avatar Active</div>
                    <div className="text-[11px] text-gray-400">JPG, GIF or PNG, Max size 2MB</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Matching Screenshot 2) */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-5 py-2.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-sm font-semibold transition-all flex items-center gap-1.5"
                >
                  <span>🗑️</span> Delete Account
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <span>💾</span> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
