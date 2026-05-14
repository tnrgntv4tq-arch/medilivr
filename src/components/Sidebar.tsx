'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Pill, LayoutDashboard, Package, Plus, List, Truck,
  Settings, LogOut, Bell, HelpCircle, ChevronLeft, ChevronRight,
  Building2, ClipboardList, Navigation, Users,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  role: string;
  email: string;
  pharmacyName?: string;
}

const MENU_ITEMS: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  CLIENT: [
    { label: 'Tableau de bord', href: '/client/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Pharmacies', href: '/client/pharmacies', icon: <Building2 className="h-5 w-5" /> },
    { label: 'Nouvelle commande', href: '/client/new-order', icon: <Plus className="h-5 w-5" /> },
    { label: 'Mes commandes', href: '/client/orders', icon: <List className="h-5 w-5" /> },
  ],
  PHARMACY: [
    { label: 'Tableau de bord', href: '/pharmacy/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Commandes', href: '/pharmacy/orders', icon: <ClipboardList className="h-5 w-5" /> },
  ],
  DELIVERY: [
    { label: 'Tableau de bord', href: '/delivery/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Mes missions', href: '/delivery/missions', icon: <Navigation className="h-5 w-5" /> },
  ],
  ADMIN: [
    { label: 'Tableau de bord', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Utilisateurs', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { label: 'Commandes', href: '/admin/orders', icon: <ClipboardList className="h-5 w-5" /> },
  ],
};

const MORE_ITEMS = [
  { label: 'Notifications', href: '#', icon: <Bell className="h-5 w-5" /> },
  { label: 'Aide', href: '#', icon: <HelpCircle className="h-5 w-5" /> },
  { label: 'Paramètres', href: '#', icon: <Settings className="h-5 w-5" /> },
];

export default function Sidebar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setUser(d.user));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const menuItems = user ? MENU_ITEMS[user.role] || [] : [];

  const roleIcon: Record<string, React.ReactNode> = {
    CLIENT: <Users className="h-4 w-4" />,
    PHARMACY: <Building2 className="h-4 w-4" />,
    DELIVERY: <Truck className="h-4 w-4" />,
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-dark-600"
      >
        {mobileOpen ? <ChevronLeft className="h-5 w-5" /> : <Pill className="h-5 w-5 text-primary-500" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen z-40 flex flex-col
        bg-dark-950 text-white transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Pill className="h-5 w-5 text-white" />
          </div>
          {!collapsed && <span className="text-lg font-bold tracking-tight">MediLivr</span>}
        </div>

        {/* Menu section */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-3 mb-3">Menu</p>}
          <nav className="space-y-1">
            {menuItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                      : 'text-dark-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-dark-500 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* More section */}
          <div className="mt-8">
            {!collapsed && <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-3 mb-3">Plus</p>}
            <nav className="space-y-1">
              {MORE_ITEMS.map(item => (
                <Link key={item.label} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-dark-500 group-hover:text-white flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 mx-3 mb-2 rounded-xl text-dark-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* User & Logout */}
        <div className="border-t border-white/5 p-3">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'} mb-2`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
              {initials}
            </div>
            {!collapsed && user && (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-[10px] text-dark-500 flex items-center gap-1">
                  {roleIcon[user.role]} {user.role === 'CLIENT' ? 'Patient' : user.role === 'PHARMACY' ? user.pharmacyName || 'Pharmacie' : 'Livreur'}
                </p>
              </div>
            )}
          </div>
          <button onClick={logout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all ${collapsed ? 'justify-center' : ''}`}
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
