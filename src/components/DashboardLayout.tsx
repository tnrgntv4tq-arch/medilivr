'use client';

import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import Sidebar from './Sidebar';

interface UserData { name: string; role: string; }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setUser(d.user));
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Sidebar />
      <div className="lg:pl-[240px] transition-all duration-300">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-[#f8f9fb]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-16 px-6 lg:px-8">
            <div className="flex-1 max-w-md ml-12 lg:ml-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark-400" />
                <input type="text" placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white rounded-xl border border-dark-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative w-9 h-9 bg-white rounded-xl border border-dark-100 flex items-center justify-center text-dark-400 hover:text-dark-600 hover:border-dark-200 transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">3</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-6 lg:px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
