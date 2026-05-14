'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Package, Euro, TrendingUp, Truck, Building2, UserCheck, ArrowUpRight, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  deliveredOrders: number;
  activeOrders: number;
  recentOrders: number;
  usersByRole: Record<string, number>;
  ordersLast7Days: Record<string, number>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptées',
  PREPARING: 'En préparation',
  READY: 'Prêtes',
  PICKED_UP: 'Récupérées',
  IN_TRANSIT: 'En livraison',
  DELIVERED: 'Livrées',
  CANCELLED: 'Annulées',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500',
  ACCEPTED: 'bg-blue-500',
  PREPARING: 'bg-indigo-500',
  READY: 'bg-purple-500',
  PICKED_UP: 'bg-orange-500',
  IN_TRANSIT: 'bg-cyan-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return null;

  const deliveryRate = stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Administration</h1>
        <p className="text-dark-400 text-sm mt-0.5">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-dark-100/60">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-dark-400 uppercase tracking-wide">Utilisateurs</p>
              <p className="text-3xl font-bold text-dark-900 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 text-xs text-dark-500">
            <span>{stats.usersByRole.CLIENT || 0} patients</span>
            <span>{stats.usersByRole.PHARMACY || 0} pharmacies</span>
            <span>{stats.usersByRole.DELIVERY || 0} livreurs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-dark-100/60">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-dark-400 uppercase tracking-wide">Commandes</p>
              <p className="text-3xl font-bold text-dark-900 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">{stats.activeOrders} en cours</span>
            <span className="text-dark-400">{stats.recentOrders} ce mois</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-primary-100 uppercase tracking-wide">Revenu total</p>
              <p className="text-3xl font-bold mt-1">{stats.totalRevenue.toFixed(2)} &euro;</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Euro className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary-100">
            <TrendingUp className="h-3 w-3" /> Paiements confirmés
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-dark-100/60">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-dark-400 uppercase tracking-wide">Taux de livraison</p>
              <p className="text-3xl font-bold text-dark-900 mt-1">{deliveryRate}%</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="text-xs text-dark-400">{stats.deliveredOrders} livrées sur {stats.totalOrders}</div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders by status */}
        <div className="bg-white rounded-2xl border border-dark-100/60 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark-900">Commandes (7 derniers jours)</h2>
            <Link href="/admin/orders" className="text-xs text-primary-500 font-medium hover:underline flex items-center gap-1">
              Tout voir <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.ordersLast7Days).map(([status, count]) => {
              const total = Object.values(stats.ordersLast7Days).reduce((s, c) => s + c, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-dark-500 w-28 truncate">{STATUS_LABELS[status] || status}</span>
                  <div className="flex-1 h-2 bg-dark-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${STATUS_COLORS[status] || 'bg-dark-300'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-dark-700 w-8 text-right">{count}</span>
                </div>
              );
            })}
            {Object.keys(stats.ordersLast7Days).length === 0 && (
              <p className="text-xs text-dark-400 text-center py-4">Aucune commande cette semaine</p>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-dark-100/60 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark-900">Accès rapide</h2>
            <Activity className="h-4 w-4 text-dark-300" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/users?role=CLIENT" className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <p className="text-sm font-semibold text-dark-900">{stats.usersByRole.CLIENT || 0} Patients</p>
              <p className="text-xs text-dark-400 mt-0.5">Gérer les comptes</p>
            </Link>
            <Link href="/admin/users?role=PHARMACY" className="p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group">
              <Building2 className="h-6 w-6 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-dark-900">{stats.usersByRole.PHARMACY || 0} Pharmacies</p>
              <p className="text-xs text-dark-400 mt-0.5">Gérer les pharmacies</p>
            </Link>
            <Link href="/admin/users?role=DELIVERY" className="p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group">
              <Truck className="h-6 w-6 text-amber-500 mb-2" />
              <p className="text-sm font-semibold text-dark-900">{stats.usersByRole.DELIVERY || 0} Livreurs</p>
              <p className="text-xs text-dark-400 mt-0.5">Gérer les livreurs</p>
            </Link>
            <Link href="/admin/orders?status=PENDING" className="p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors group">
              <Package className="h-6 w-6 text-red-500 mb-2" />
              <p className="text-sm font-semibold text-dark-900">{stats.activeOrders} En cours</p>
              <p className="text-xs text-dark-400 mt-0.5">Commandes actives</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
