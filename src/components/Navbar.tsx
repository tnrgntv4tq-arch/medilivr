'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Pill, LogOut, User, Menu, X, LayoutDashboard, Package, MapPin, Truck, List } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  role: string;
  email: string;
}

const NAV_ITEMS: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  CLIENT: [
    { label: 'Tableau de bord', href: '/client/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Nouvelle commande', href: '/client/new-order', icon: <Package className="h-4 w-4" /> },
    { label: 'Mes commandes', href: '/client/orders', icon: <List className="h-4 w-4" /> },
  ],
  PHARMACY: [
    { label: 'Tableau de bord', href: '/pharmacy/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Commandes', href: '/pharmacy/orders', icon: <Package className="h-4 w-4" /> },
  ],
  DELIVERY: [
    { label: 'Tableau de bord', href: '/delivery/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Mes missions', href: '/delivery/missions', icon: <Truck className="h-4 w-4" /> },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Patient',
  PHARMACY: 'Pharmacie',
  DELIVERY: 'Livreur',
};

const ROLE_COLORS: Record<string, string> = {
  CLIENT: 'bg-primary-50 text-primary-700',
  PHARMACY: 'bg-blue-50 text-blue-700',
  DELIVERY: 'bg-accent-50 text-accent-700',
};

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setUser(d.user));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const navItems = user ? NAV_ITEMS[user.role] || [] : [];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-dark-100/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href={user ? `/${user.role.toLowerCase()}/dashboard` : '/'} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Pill className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-dark-900">Medi<span className="text-primary-500">Livr</span></span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-dark-500 hover:text-dark-700 hover:bg-dark-50'
                    }`}>
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
                <span className="text-sm text-dark-600 font-medium">{user.name}</span>
                <button onClick={logout} className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Déconnexion">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
              <button className="md:hidden p-2 text-dark-600 hover:bg-dark-50 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden border-t border-dark-100/60 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  pathname === item.href ? 'bg-primary-50 text-primary-600' : 'text-dark-600'
                }`}>
                {item.icon} {item.label}
              </Link>
            ))}
            <hr className="my-2 border-dark-100" />
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-dark-400" />
                <span className="text-sm text-dark-600">{user.name}</span>
              </div>
              <button onClick={logout} className="text-red-500 text-sm font-medium">Déconnexion</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
