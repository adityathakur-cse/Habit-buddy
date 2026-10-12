'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Habits', href: '/habits' },
    { name: 'Session', href: '/session' },
    { name: 'Reviews', href: '/reviews' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/85 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-lg shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            🎯
          </span>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-300">
            HabitBuddy
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Badge & Profile & Logout */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all text-sm group"
          >
            <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </span>
            <span className="font-medium text-gray-200 group-hover:text-white">
              {user?.username || 'Profile'}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
