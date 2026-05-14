'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Package, Clock, CheckCircle, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  distance: number;
  createdAt: string;
  pharmacy?: { pharmacyName: string; address: string };
}

function MiniBarChart({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[3px] h-10">
      {values.map((v, i) => (
        <div key={i} className={`w-[6px] rounded-full ${color} transition-all`} style={{ height: `${(v / max) * 100}%`, opacity: 0.4 + (v / max) * 0.6 }} />
      ))}
    </div>
  );
}

function ProgressRing({ percent, size = 56 }: { percent: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8ecf0" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#20ae6b" strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
}

export default function ClientDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setUserName(d.user.name.split(' ')[0]));
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  }, []);

  const active = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));
  const completed = orders.filter(o => o.status === 'DELIVERED');
  const totalSpent = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const deliveredPercent = orders.length > 0 ? Math.round((completed.length / orders.length) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Bonjour, {userName} !</h1>
          <p className="text-dark-400 text-sm mt-0.5">Voici un aperçu de vos livraisons</p>
        </div>
        <Link href="/client/new-order" className="btn-primary flex items-center gap-2 text-sm !rounded-xl">
          <Plus className="h-4 w-4" /> Nouvelle commande
        </Link>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total orders */}
        <div className="bg-white rounded-2xl p-5 border border-dark-100/60">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-dark-400 uppercase tracking-wide">Commandes</p>
              <p className="text-3xl font-bold text-dark-900 mt-1">{orders.length}</p>
            </div>
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-500" />
            </div>
          </div>
          <MiniBarChart values={[3, 5, 2, 7, 4, 6, orders.length || 1]} color="bg-primary-500" />
        </div>

        {/* Active */}
        <div className="bg-white rounded-2xl p-5 border border-dark-100/60">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-dark-400 uppercase tracking-wide">En cours</p>
              <p className="text-3xl font-bold text-dark-900 mt-1">{active.length}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {active.length > 0 ? 'En livraison' : 'Aucune'}
            </span>
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-2xl p-5 border border-dark-100/60">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-dark-400 uppercase tracking-wide">Livrées</p>
              <p className="text-3xl font-bold text-dark-900 mt-1">{completed.length}</p>
            </div>
            <div className="relative flex items-center justify-center">
              <ProgressRing percent={deliveredPercent} />
              <span className="absolute text-[10px] font-bold text-primary-600">{deliveredPercent}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <ArrowUpRight className="h-3 w-3" /> Taux de livraison
          </div>
        </div>

        {/* Total spent */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-primary-100 uppercase tracking-wide">Total dépensé</p>
              <p className="text-3xl font-bold mt-1">{totalSpent.toFixed(2)} &euro;</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <MiniBarChart values={[2, 4, 3, 5, 4, 6, 5]} color="bg-white" />
        </div>
      </div>

      {/* Active Orders + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Orders - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-dark-100/60">
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-dark-900">Commandes en cours</h2>
              {active.length > 0 && <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft" />}
            </div>
            <Link href="/client/orders" className="text-xs text-primary-500 font-medium hover:underline flex items-center gap-1">
              Tout voir <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {active.length > 0 ? (
            <div className="px-5 pb-5 space-y-2">
              {active.map(order => (
                <Link key={order.id} href={`/client/track/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-50/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark-900">{order.pharmacy?.pharmacyName || 'Pharmacie'}</p>
                      <p className="text-xs text-dark-400">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-bold text-dark-900">{order.totalPrice?.toFixed(2)} &euro;</span>
                    <ArrowUpRight className="h-4 w-4 text-dark-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 pb-8 text-center">
              <div className="w-14 h-14 bg-dark-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Package className="h-7 w-7 text-dark-300" />
              </div>
              <p className="text-sm text-dark-400 mb-4">Aucune commande en cours</p>
              <Link href="/client/new-order" className="text-sm text-primary-500 font-semibold hover:underline">
                Passer une commande
              </Link>
            </div>
          )}
        </div>

        {/* Activity panel */}
        <div className="bg-white rounded-2xl border border-dark-100/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark-900">Activité</h2>
            <Activity className="h-4 w-4 text-dark-300" />
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order, i) => (
              <div key={order.id} className="flex items-start gap-3">
                <div className="relative">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${order.status === 'DELIVERED' ? 'bg-emerald-500' : order.status === 'CANCELLED' ? 'bg-red-400' : 'bg-primary-500'}`} />
                  {i < Math.min(orders.length - 1, 4) && <div className="absolute top-3 left-[4px] w-0.5 h-8 bg-dark-100" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-dark-700">{order.pharmacy?.pharmacyName}</p>
                  <p className="text-[10px] text-dark-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    {' '}&middot; {order.totalPrice?.toFixed(2)} &euro;
                  </p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-xs text-dark-400 text-center py-4">Pas encore d&apos;activité</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
