'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  username: string;
  avatar: string;
}

export function DashboardNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('[v0] Fetch user error:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  };

  return (
    <nav className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">Bot Dashboard</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/admin"
          className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          Admin Panel
        </Link>
        <Link
          href="/dashboard/settings"
          className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          Settings
        </Link>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-700">
        {user && (
          <div className="mb-4 p-3 rounded-lg bg-slate-700">
            <p className="text-sm text-slate-300">{user.username}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
