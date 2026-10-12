'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reminder, setReminder] = useState('08:00');
  const [category, setCategory] = useState('Productivity');
  const [selectedDays, setSelectedDays] = useState(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  const [saving, setSaving] = useState(false);

  const daysList = [
    { label: 'S', day: 'Sun' },
    { label: 'M', day: 'Mon' },
    { label: 'T', day: 'Tue' },
    { label: 'W', day: 'Wed' },
    { label: 'T', day: 'Thu' },
    { label: 'F', day: 'Fri' },
    { label: 'S', day: 'Sat' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
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

  const handleOpenAddModal = () => {
    setEditingHabitId(null);
    setTitle('');
    setDesc('');
    setReminder('08:00');
    setCategory('Productivity');
    setSelectedDays(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (habit) => {
    setEditingHabitId(habit.id);
    setTitle(habit.title);
    setDesc(habit.description || '');
    setReminder(habit.reminder_time ? habit.reminder_time.slice(0, 5) : '08:00');
    setCategory(habit.category || 'Productivity');
    setSelectedDays(habit.days_of_week ? habit.days_of_week.split(',') : ['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    setIsModalOpen(true);
  };

  const handleDeleteHabit = async (id) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/habits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHabits((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete habit', err);
    }
  };

  const handleSaveHabit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const token = localStorage.getItem('token');

    const habitPayload = {
      title: title.trim(),
      description: desc.trim(),
      reminder_time: reminder,
      category,
      days_of_week: selectedDays.join(','),
    };

    try {
      if (editingHabitId) {
        // Update
        const res = await fetch(`http://localhost:5000/api/habits/${editingHabitId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(habitPayload),
        });
        if (res.ok) {
          const updated = await res.json();
          setHabits((prev) => prev.map((h) => (h.id === editingHabitId ? updated : h)));
          setIsModalOpen(false);
        }
      } else {
        // Create
        const res = await fetch('http://localhost:5000/api/habits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(habitPayload),
        });
        if (res.ok) {
          const created = await res.json();
          setHabits((prev) => [created, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Failed to save habit', err);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Anytime';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m || '00'} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {/* Header (Matching Image 4) */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Habits 🎯</h1>
            <p className="text-gray-400 text-sm mt-1">Manage and organize your repeating daily routines</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <span>+</span> Add Habit
          </button>
        </div>

        {/* Habits Cards List */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading your habits...</div>
        ) : habits.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-[#121217] border border-white/10 border-dashed">
            <span className="text-5xl mb-4 block">📖</span>
            <h3 className="text-xl font-bold text-white mb-2">No Habits Found</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
              Create habits like &ldquo;Reading 30 mins&rdquo; or &ldquo;Morning Run&rdquo; to build your consistency streak.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm shadow-lg transition-all"
            >
              + Create First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const habitDays = habit.days_of_week ? habit.days_of_week.split(',') : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
              return (
                <div
                  key={habit.id}
                  className="p-6 rounded-2xl bg-[#14141a] border border-white/10 hover:border-white/20 transition-all shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{habit.title}</h3>
                        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          {formatTime(habit.reminder_time)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {habit.description || 'Daily consistency goal'}
                      </p>

                      {/* Days of week circles (Matching Image 4) */}
                      <div className="flex items-center gap-2 mt-4">
                        {daysList.map((d, index) => {
                          const isActive = habitDays.includes(d.label);
                          return (
                            <span
                              key={index}
                              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                                isActive
                                  ? 'bg-blue-600/20 border border-blue-500 text-blue-300'
                                  : 'bg-white/5 border border-white/10 text-gray-500'
                              }`}
                            >
                              {d.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEditModal(habit)}
                        className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="text-sm font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#14141a] border border-white/15 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-white mb-1">
              {editingHabitId ? 'Edit Habit ✏️' : 'Add New Habit 🎯'}
            </h3>
            <p className="text-xs text-gray-400 mb-6">Configure habit details and frequency schedule</p>

            <form onSubmit={handleSaveHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Habit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reading or Morning Run"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Read a book for at least 30 min"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Health">Health 💧</option>
                    <option value="Productivity">Productivity 💻</option>
                    <option value="Mindset">Mindset 📚</option>
                    <option value="Fitness">Fitness 🏃</option>
                    <option value="General">General ⭐</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Scheduled Time</label>
                  <input
                    type="time"
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Repeat Days</label>
                <div className="flex gap-2">
                  {daysList.map((d, index) => {
                    const isSelected = selectedDays.includes(d.label);
                    return (
                      <button
                        type="button"
                        key={index}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDays(selectedDays.filter((_, i) => i !== index));
                          } else {
                            setSelectedDays([...selectedDays, d.label]);
                          }
                        }}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
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
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingHabitId ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
