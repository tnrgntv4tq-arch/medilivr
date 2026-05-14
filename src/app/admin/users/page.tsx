'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Users, Building2, Truck, UserCheck, UserX, Package } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  pharmacyName: string | null;
  isAvailable: boolean;
  createdAt: string;
  _count: { clientOrders: number; pharmacyOrders: number; deliveryOrders: number };
}

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Patient',
  PHARMACY: 'Pharmacie',
  DELIVERY: 'Livreur',
  ADMIN: 'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  CLIENT: 'bg-blue-50 text-blue-700',
  PHARMACY: 'bg-emerald-50 text-emerald-700',
  DELIVERY: 'bg-amber-50 text-amber-700',
  ADMIN: 'bg-purple-50 text-purple-700',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  CLIENT: <Users className="h-4 w-4" />,
  PHARMACY: <Building2 className="h-4 w-4" />,
  DELIVERY: <Truck className="h-4 w-4" />,
};

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('role') || '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter) params.set('role', filter);
    if (search) params.set('search', search);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .finally(() => setLoading(false));
  }, [filter, search]);

  const toggleAvailability = async (userId: string, current: boolean) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isAvailable: !current }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAvailable: !current } : u));
  };

  const orderCount = (u: UserItem) => {
    if (u.role === 'CLIENT') return u._count.clientOrders;
    if (u.role === 'PHARMACY') return u._count.pharmacyOrders;
    if (u.role === 'DELIVERY') return u._count.deliveryOrders;
    return 0;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-900">Utilisateurs</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-dark-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setLoading(true); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-dark-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['', 'CLIENT', 'PHARMACY', 'DELIVERY'].map(r => (
            <button
              key={r}
              onClick={() => { setFilter(r); setLoading(true); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === r ? 'bg-primary-500 text-white' : 'bg-white text-dark-500 border border-dark-100 hover:border-dark-200'
              }`}
            >
              {r ? ROLE_LABELS[r] : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dark-100/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-50 text-dark-400">
                  <th className="text-left px-5 py-3 font-medium">Utilisateur</th>
                  <th className="text-left px-5 py-3 font-medium">Rôle</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Contact</th>
                  <th className="text-center px-5 py-3 font-medium">Commandes</th>
                  <th className="text-center px-5 py-3 font-medium">Statut</th>
                  <th className="text-center px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-dark-50/50 hover:bg-dark-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-dark-900">{u.name}</p>
                      <p className="text-xs text-dark-400">{u.pharmacyName || u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] || ''}`}>
                        {ROLE_ICONS[u.role]} {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <p className="text-dark-600">{u.email}</p>
                      <p className="text-xs text-dark-400">{u.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-dark-600">
                        <Package className="h-3.5 w-3.5" /> {orderCount(u)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {u.isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <UserCheck className="h-3 w-3" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          <UserX className="h-3 w-3" /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleAvailability(u.id, u.isAvailable)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          u.isAvailable
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isAvailable ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="text-center py-12 text-dark-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
