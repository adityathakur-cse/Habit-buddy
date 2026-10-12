import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Glow Accents */}
      <div className="fixed top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/20 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-purple-600/10 blur-[130px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0a]/75 border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              🎯
            </span>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
              HabitBuddy
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-white transition-colors">Analytics</a>
            <a 
              href="https://github.com/adityathakur-cse/Habit-buddy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              GitHub
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-purple-300 mb-8 backdrop-blur-sm animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Your Personal Habit & Consistency Engine
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Build habits that stick.{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-500">
            Master consistency every day.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10">
          HabitBuddy turns daily ambitions into lifelong routines. Track your streaks,
          log focused work sessions, and keep momentum with clean, distraction-free analytics.
        </p>

        {/* Call To Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Start Free Today 🚀
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-gray-200 border border-white/[0.1] transition-all flex items-center justify-center gap-2"
          >
            Go to Dashboard &rarr;
          </Link>
        </div>

        {/* Live UI Mockup Preview */}
        <div className="w-full max-w-4xl p-2 sm:p-4 rounded-3xl bg-white/[0.03] border border-white/[0.1] shadow-2xl backdrop-blur-xl relative">
          <div className="rounded-2xl bg-[#0e0e11] border border-white/[0.06] p-6 sm:p-8 text-left overflow-hidden">
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.07] mb-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-400">Live Dashboard Preview</div>
                <h3 className="text-xl font-bold text-white mt-1">Today&apos;s Focus & Habit Routines</h3>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Active Streak: 14 Days 🔥
              </div>
            </div>

            {/* Mock Habits List */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">💧</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-medium">Health</span>
                </div>
                <h4 className="font-semibold text-white">Drink 3L Water</h4>
                <p className="text-xs text-gray-400 mt-1">Daily hydration goal</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium">✓ Completed</span>
                  <span className="text-gray-500">Streak: 14d</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">💻</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 font-medium">Growth</span>
                </div>
                <h4 className="font-semibold text-white">Code for 45 Mins</h4>
                <p className="text-xs text-gray-400 mt-1">Full-stack project work</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium">✓ Completed</span>
                  <span className="text-gray-500">Streak: 21d</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">📚</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-medium">Mindset</span>
                </div>
                <h4 className="font-semibold text-white">Read 20 Pages</h4>
                <p className="text-xs text-gray-400 mt-1">Atomic Habits by James Clear</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-purple-400 font-medium">Pending today</span>
                  <span className="text-gray-500">Streak: 8d</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">Why HabitBuddy</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Everything you need to turn goals into second nature
            </h2>
            <p className="text-gray-400 mt-3 text-sm sm:text-base">
              Engineered with clean workflows, quick logging, and thoughtful analytics so tracking habits never feels like a chore.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Habit Tracking</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Add daily habits with custom categories and reminder times. Check off tasks in seconds with a responsive, frictionless interface.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🔥
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Streak Consistency</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Watch your momentum grow with unbroken streak counts. HabitBuddy visualizes progress so you stay motivated through hard days.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                ⏱️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Focus Time Integration</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Log deep work and study sessions directly alongside your habits. Pair discipline with focused execution for peak productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Simplicity First</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Three steps to a consistent routine
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-4xl font-black text-white/10 mb-4">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Create Your Routine</h3>
              <p className="text-gray-400 text-sm">
                Define the daily habits that move the needle — fitness, learning, wellness, or career tasks.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-4xl font-black text-white/10 mb-4">02</div>
              <h3 className="text-lg font-bold text-white mb-2">Check In Daily</h3>
              <p className="text-gray-400 text-sm">
                Log into your personalized dashboard, check off your completed items, and keep your streak alive.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-4xl font-black text-white/10 mb-4">03</div>
              <h3 className="text-lg font-bold text-white mb-2">See Lasting Results</h3>
              <p className="text-gray-400 text-sm">
                Small consistent actions compound over weeks and months into permanent, life-changing habits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-white/[0.06] bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-white/[0.03] border border-white/[0.1] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 blur-[100px] pointer-events-none -z-10" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Ready to build habits that last?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Join HabitBuddy today and experience how consistency transforms your daily routine. Free forever for individuals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In Instead &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.06] py-8 px-6 text-sm text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span className="font-semibold text-gray-300">HabitBuddy</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-gray-300 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-gray-300 transition-colors">Register</Link>
            <a
              href="https://github.com/adityathakur-cse/Habit-buddy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
