'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchHabits(token);
  }, [router]);

  const fetchHabits = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/habits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (err) {
      console.error('Failed to fetch habits', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-[#0a0a0a]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-400 mt-2">Here is your habit tracking dashboard.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold"
          >
            Logout
          </button>
        </header>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Habits</h2>
            <button className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold shadow-lg shadow-blue-500/25">
              + New Habit
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center p-12 rounded-2xl bg-white/5 border border-white/10 border-dashed">
              <p className="text-gray-400 mb-4">You haven't created any habits yet.</p>
              <button className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-blue-500/30 underline-offset-4">
                Create your first habit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => (
                <div key={habit.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{habit.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{habit.description || 'No description provided.'}</p>
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                    <span className="bg-black/30 px-3 py-1 rounded-full">{habit.category || 'Uncategorized'}</span>
                    {habit.reminder_time && <span>🔔 {habit.reminder_time}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
