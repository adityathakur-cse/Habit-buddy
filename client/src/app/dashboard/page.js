'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [todayCompleted, setTodayCompleted] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [focusedHours, setFocusedHours] = useState(0);
  const [focusInput, setFocusInput] = useState('');
  const [focusGoal] = useState(2.0);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Productivity');
  const [newReminder, setNewReminder] = useState('08:00');
  const [modalLoading, setModalLoading] = useState(false);

  // Helper for timezone-safe local YYYY-MM-DD
  const getLocalDate = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => getLocalDate(new Date()), []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error(e);
    }

    loadDashboardData(token);
  }, [router]);

  const loadDashboardData = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch habits
      const habitsRes = await fetch('http://localhost:5000/api/habits', { headers });
      if (habitsRes.ok) {
        const data = await habitsRes.json();
        setHabits(data);
      }

      // 2. Fetch consistency board with local date query
      const localToday = getLocalDate();
      const boardRes = await fetch(`http://localhost:5000/api/habits/board?date=${localToday}`, { headers });
      if (boardRes.ok) {
        const data = await boardRes.json();
        setHeatmapData(data.heatmap || []);
        setTodayCompleted(data.todayCompleted || []);
        setCurrentStreak(data.currentStreak || 0);
      }

      // 3. Fetch focus stats
      const focusRes = await fetch('http://localhost:5000/api/sessions/today', { headers });
      if (focusRes.ok) {
        const data = await focusRes.json();
        setFocusedHours(data.totalHours || 0);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle habit check-in for today
  const handleToggleHabit = async (habitId) => {
    const token = localStorage.getItem('token');
    const localToday = getLocalDate();
    try {
      const res = await fetch(`http://localhost:5000/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: localToday }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.completed) {
          setTodayCompleted((prev) => [...prev, habitId]);
          showToast('✅ Habit completed! Consistency updated.');
        } else {
          setTodayCompleted((prev) => prev.filter((id) => id !== habitId));
          showToast('Unmarked habit.');
        }

        // Refresh board
        refreshBoard(token);
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  // Direct date check-in (clicking any box or "+ Calendar")
  const handleDirectCheckIn = async (targetDate) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/habits/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: targetDate }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Consistency updated!');
        refreshBoard(token);

        // Also refresh habits if one was auto-created
        const habitsRes = await fetch('http://localhost:5000/api/habits', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (habitsRes.ok) {
          const hData = await habitsRes.json();
          setHabits(hData);
        }
      }
    } catch (err) {
      console.error('Failed direct check-in:', err);
    }
  };

  const refreshBoard = async (token) => {
    const localToday = getLocalDate();
    const boardRes = await fetch(`http://localhost:5000/api/habits/board?date=${localToday}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (boardRes.ok) {
      const bData = await boardRes.json();
      setHeatmapData(bData.heatmap || []);
      setTodayCompleted(bData.todayCompleted || []);
      setCurrentStreak(bData.currentStreak || 0);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Save Focused Hours manually
  const handleSaveFocusHours = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const hours = parseFloat(focusInput);
    if (isNaN(hours) || hours <= 0) return;

    try {
      const res = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ duration_minutes: hours * 60 }),
      });

      if (res.ok) {
        setFocusedHours((prev) => parseFloat((prev + hours).toFixed(1)));
        setFocusInput('');
        showToast(`Logged ${hours} focused hours!`);
      }
    } catch (err) {
      console.error('Failed to save focus hours:', err);
    }
  };

  // Create Habit
  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setModalLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          category: newCategory,
          reminder_time: newReminder,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setHabits((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        showToast('Habit added successfully!');
      }
    } catch (err) {
      console.error('Failed to create habit:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Build Weekday Consistency Board Heatmap matching Image 1
  // Row order: Wed (3), Thu (4), Fri (5), Sat (6), Sun (0), Mon (1), Tue (2)
  const weekdayRows = [
    { label: 'Wed', dayIndex: 3 },
    { label: 'Thu', dayIndex: 4 },
    { label: 'Fri', dayIndex: 5 },
    { label: 'Sat', dayIndex: 6 },
    { label: 'Sun', dayIndex: 0 },
    { label: 'Mon', dayIndex: 1 },
    { label: 'Tue', dayIndex: 2 },
  ];

  const columnsCount = 28; // 28 weeks of columns

  const heatmapMatrix = useMemo(() => {
    const daysMap = {};
    heatmapData.forEach((item) => {
      const dateKey = item.log_date.substring(0, 10);
      daysMap[dateKey] = parseInt(item.count, 10);
    });

    const today = new Date();
    // Align so current week ends on today's week
    // We construct 28 columns x 7 rows
    const matrix = weekdayRows.map(() => []);

    // Calculate dates for past columnsCount weeks
    const todayDay = today.getDay(); // 0 is Sun, 1 is Mon, etc.
    // Offset from current day to current week's Tuesday (last row)
    const dayOffsets = { 3: 0, 4: 1, 5: 2, 6: 3, 0: 4, 1: 5, 2: 6 };
    const currentWeekRowIndex = dayOffsets[todayDay] !== undefined ? dayOffsets[todayDay] : 0;

    for (let col = columnsCount - 1; col >= 0; col--) {
      weekdayRows.forEach((row, rIdx) => {
        const daysAgo = col * 7 + (currentWeekRowIndex - rIdx);
        const cellDate = new Date();
        cellDate.setDate(today.getDate() - daysAgo);

        const dateStr = getLocalDate(cellDate);
        const isFuture = cellDate > today;
        const count = daysMap[dateStr] || 0;

        matrix[rIdx].push({
          date: dateStr,
          count,
          isFuture,
          isToday: dateStr === todayStr,
        });
      });
    }

    return matrix;
  }, [heatmapData, todayStr]);

  const getColorClass = (count, isFuture, isToday) => {
    if (isFuture) return 'bg-[#16161b] opacity-40 border-transparent cursor-default';
    if (count === 0) return isToday ? 'bg-[#22222b] border-emerald-500/60' : 'bg-[#1a1a20] border-white/5 hover:border-emerald-500/40';
    if (count === 1) return 'bg-emerald-900 border-emerald-700/60';
    if (count === 2) return 'bg-emerald-700 border-emerald-500/60';
    if (count === 3) return 'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/40';
    return 'bg-[#10b981] border-emerald-300 shadow-md shadow-emerald-500/60';
  };

  const progressPercentage = Math.min(100, Math.round((focusedHours / focusGoal) * 100));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-gray-400 text-sm">Loading Consistency Board...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col selection:bg-emerald-500/30">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-sm shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Hello, {user?.username || 'Aditya'}! 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Consistency Board tracks every daily accomplishment. Click any block to log activity!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDirectCheckIn(todayStr)}
              className="px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <span>⚡</span> Quick Check-in
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <span>+</span> Add Habit
            </button>
          </div>
        </div>

        {/* 1. Consistency Board (Matching Image 1) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                Consistency Board
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Click any square to mark consistent or view daily activity
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Streak: {currentStreak} Days 🔥
              </span>
            </div>
          </div>

          {/* Consistency Heatmap Grid with Wed-Tue Weekday Labels */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px] flex gap-3">
              {/* Day Labels Column on Left */}
              <div className="flex flex-col justify-between py-0.5 text-[11px] font-semibold text-gray-400 pr-1 select-none">
                {weekdayRows.map((row) => (
                  <span key={row.label} className="h-4 leading-4 flex items-center">
                    {row.label}
                  </span>
                ))}
              </div>

              {/* Grid of Squares: 7 rows x columnsCount */}
              <div className="flex-1 flex flex-col justify-between gap-1.5">
                {heatmapMatrix.map((rowCells, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5">
                    {rowCells.map((cell, cIdx) => (
                      <div
                        key={cIdx}
                        onClick={() => !cell.isFuture && handleDirectCheckIn(cell.date)}
                        title={`${cell.date}: ${cell.count} completed log${cell.count === 1 ? '' : 's'}${cell.isToday ? ' (Today)' : ''}`}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] border transition-all cursor-pointer ${
                          !cell.isFuture ? 'hover:scale-125 hover:z-10' : ''
                        } ${getColorClass(cell.count, cell.isFuture, cell.isToday)}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Legend (Matching Image 1: Less [][][][][] More) */}
            <div className="flex items-center justify-between text-xs text-gray-400 mt-6 pt-4 border-t border-white/5 px-2">
              <span className="text-gray-400 text-xs">
                💡 Tip: Click on today ({todayStr}) or any past square to toggle consistency
              </span>
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="w-3.5 h-3.5 rounded-[3px] bg-[#1a1a20] border border-white/5" />
                <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-900" />
                <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-700" />
                <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-500" />
                <div className="w-3.5 h-3.5 rounded-[3px] bg-[#10b981]" />
                <span>More</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Today's Focused Hours & Quick Actions Row (Matching Image 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Card: Today's Focused Hours */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#121217] border border-white/10 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Today&apos;s Focused Hours</h3>
              <p className="text-xs text-gray-400 mb-5">Track focused study and deep work sessions</p>

              <div className="text-2xl sm:text-3xl font-black text-white mb-4">
                Today: <span className="text-blue-400">{focusedHours}</span> hours
              </div>

              <form onSubmit={handleSaveFocusHours} className="flex gap-3 mb-6">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Enter hours (e.g., 1.5)"
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition-colors shadow-md shadow-blue-500/20"
                >
                  Save
                </button>
              </form>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
                <span>Goal: {focusGoal} hours</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card: Quick Actions */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#121217] border border-white/10 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Quick Actions</h3>
              <p className="text-xs text-gray-400 mb-5">Shortcuts to log habits, timer, or calendar</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/session"
                className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-300 transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⏱️</span>
                <span className="font-bold text-sm text-white">+ New Session</span>
                <span className="text-[11px] text-gray-400 mt-0.5">Focus Countdown</span>
              </Link>

              <button
                onClick={() => setIsModalOpen(true)}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-300 transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎯</span>
                <span className="font-bold text-sm text-white">+ Add Habit</span>
                <span className="text-[11px] text-gray-400 mt-0.5">New Daily Goal</span>
              </button>

              <button
                onClick={() => handleDirectCheckIn(todayStr)}
                className="col-span-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 transition-all flex items-center justify-center gap-2 group"
              >
                <span className="text-lg">📅</span>
                <span className="font-bold text-sm text-white">+ Quick Calendar Check-in for Today</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Today's Habits Check-in Checklist */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#121217] border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Today&apos;s Habits Check-In ✅
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Check off habits completed today to illuminate your Consistency Board
              </p>
            </div>
            <Link
              href="/habits"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Manage All Habits ({habits.length}) &rarr;
            </Link>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-black/20 border border-white/5 border-dashed">
              <span className="text-4xl mb-3 block">🌱</span>
              <p className="text-gray-300 font-medium mb-1">No custom habits added yet</p>
              <p className="text-gray-500 text-xs mb-4">
                Click Quick Check-in above or Add Habit to start tracking your streak!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
              >
                + Add Habit
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => {
                const isCompleted = todayCompleted.includes(habit.id);
                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isCompleted
                        ? 'bg-emerald-950/25 border-emerald-500/50 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <div className="flex-1 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-300 font-medium">
                          {habit.category || 'Habit'}
                        </span>
                        {habit.reminder_time && (
                          <span className="text-[11px] text-gray-400">🔔 {habit.reminder_time.slice(0, 5)}</span>
                        )}
                      </div>
                      <h4
                        className={`font-semibold text-sm transition-all ${
                          isCompleted ? 'line-through text-gray-400' : 'text-white'
                        }`}
                      >
                        {habit.title}
                      </h4>
                      {habit.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{habit.description}</p>
                      )}
                    </div>

                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40 scale-105'
                          : 'bg-white/5 border border-white/20 text-transparent group-hover:border-emerald-500 group-hover:text-emerald-500/50'
                      }`}
                    >
                      ✓
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#14141a] border border-white/15 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-1">Create New Habit 🎯</h3>
            <p className="text-xs text-gray-400 mb-6">Add a recurring daily habit to your consistency tracker</p>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Habit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 20 pages"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Atomic Habits by James Clear"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Health">Health 💧</option>
                    <option value="Productivity">Productivity 💻</option>
                    <option value="Mindset">Mindset 📚</option>
                    <option value="Fitness">Fitness 🏃</option>
                    <option value="General">General ⭐</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Reminder Time</label>
                  <input
                    type="time"
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : 'Save Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
