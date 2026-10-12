'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';

export default function SessionPage() {
  // Plan a Habit Block State
  const [email, setEmail] = useState('');
  const [planHabit, setPlanHabit] = useState('');
  const [planTime, setPlanTime] = useState('09:00');
  const [duration, setDuration] = useState('30');
  const [enableReminder, setEnableReminder] = useState(false);
  const [planSuccess, setPlanSuccess] = useState('');

  // Focus Countdown Timer State
  const [focusHabit, setFocusHabit] = useState('');
  const [hoursInput, setHoursInput] = useState('0');
  const [minutesInput, setMinutesInput] = useState('25');
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
  const [sessionCompletedMsg, setSessionCompletedMsg] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.email) setEmail(u.email);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Timer Tick Effect
  useEffect(() => {
    if (isTimerRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, secondsRemaining]);

  const handleTimerComplete = async () => {
    setIsTimerRunning(false);
    setSessionCompletedMsg('🎉 Focus Session Completed and Logged!');

    // Log completed session to PostgreSQL
    const token = localStorage.getItem('token');
    const totalMins = Math.round(timerTotalSeconds / 60) || 1;
    try {
      await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          duration_minutes: totalMins,
          habit_name: focusHabit || 'Focus Session',
        }),
      });
    } catch (err) {
      console.error('Failed to log session', err);
    }
  };

  const handleStartCountdown = (e) => {
    e.preventDefault();
    const h = parseInt(hoursInput, 10) || 0;
    const m = parseInt(minutesInput, 10) || 0;
    const totalSecs = h * 3600 + m * 60;

    if (totalSecs <= 0) return;

    setTimerTotalSeconds(totalSecs);
    setSecondsRemaining(totalSecs);
    setIsTimerRunning(true);
    setSessionCompletedMsg('');
  };

  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(null);
    setSessionCompletedMsg('');
  };

  const formatCountdownTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Plan a Habit Block Form
  const handleSaveHabitPlan = async (e) => {
    e.preventDefault();
    if (!planHabit.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: planHabit.trim(),
          description: `Scheduled for ${duration} mins with reminder`,
          reminder_time: planTime,
          category: 'Focus Block',
        }),
      });

      if (res.ok) {
        setPlanSuccess('✅ Habit Block scheduled and saved to your routine!');
        setPlanHabit('');
        setTimeout(() => setPlanSuccess(''), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Focus & Session Planner ⏱️</h1>
          <p className="text-gray-400 text-sm mt-2">
            Schedule dedicated habit blocks and enter deep work mode with countdown timers.
          </p>
        </div>

        {/* Dual Cards Grid (Matching Image 3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Card 1: Plan a Habit Block */}
          <div className="p-8 rounded-3xl bg-[#14141a] border border-white/10 shadow-xl">
            <h2 className="text-2xl font-bold text-emerald-400 text-center mb-6">
              Plan a Habit Block
            </h2>

            {planSuccess && (
              <div className="p-3 mb-6 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center">
                {planSuccess}
              </div>
            )}

            <form onSubmit={handleSaveHabitPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Your Email (to get reminder)</label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Habit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reading or Deep Coding"
                  value={planHabit}
                  onChange={(e) => setPlanHabit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Scheduled Time</label>
                <input
                  type="time"
                  required
                  value={planTime}
                  onChange={(e) => setPlanTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  required
                  placeholder="Duration (minutes)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 pb-2">
                <input
                  type="checkbox"
                  id="enableReminder"
                  checked={enableReminder}
                  onChange={(e) => setEnableReminder(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-black/40 border-white/20"
                />
                <label htmlFor="enableReminder" className="text-xs text-gray-300 font-medium cursor-pointer">
                  Enable Reminder Notification
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all"
              >
                Save Habit Plan
              </button>
            </form>
          </div>

          {/* Card 2: Set Your Focus Time (Interactive Countdown Timer) */}
          <div className="p-8 rounded-3xl bg-[#14141a] border border-white/10 shadow-xl">
            <h2 className="text-2xl font-bold text-blue-500 text-center mb-6">
              Set Your Focus Time
            </h2>

            {sessionCompletedMsg && (
              <div className="p-3 mb-6 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold text-center">
                {sessionCompletedMsg}
              </div>
            )}

            {secondsRemaining === null ? (
              <form onSubmit={handleStartCountdown} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Habit / Task</label>
                  <input
                    type="text"
                    placeholder="Enter Habit (e.g. Study, Workout)"
                    value={focusHabit}
                    onChange={(e) => setFocusHabit(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      placeholder="Hours"
                      value={hoursInput}
                      onChange={(e) => setHoursInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Minutes</label>
                    <input
                      type="number"
                      min="1"
                      max="59"
                      placeholder="Minutes"
                      value={minutesInput}
                      onChange={(e) => setMinutesInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 text-center font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
                  >
                    Start Countdown 🚀
                  </button>
                </div>
              </form>
            ) : (
              /* Live Countdown Timer View */
              <div className="flex flex-col items-center py-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                  {focusHabit || 'Focus Session'}
                </span>

                <div className="text-6xl sm:text-7xl font-mono font-black text-white tracking-widest my-4">
                  {formatCountdownTime(secondsRemaining)}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/10 mb-8">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                    style={{
                      width: `${
                        timerTotalSeconds > 0
                          ? Math.round(((timerTotalSeconds - secondsRemaining) / timerTotalSeconds) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={handleToggleTimer}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                      isTimerRunning
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isTimerRunning ? 'Pause ⏸️' : 'Resume ▶️'}
                  </button>

                  <button
                    onClick={handleResetTimer}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-semibold text-sm transition-colors border border-white/10"
                  >
                    Cancel / Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
