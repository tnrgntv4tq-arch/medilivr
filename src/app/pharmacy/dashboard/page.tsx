'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, AlertCircle, ArrowUpRight, Eye, Bell, Euro, TrendingUp } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  notes: string | null;
  client: { name: string; phone: string; address: string };
}

function MiniBarChart({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[3px] h-10">
      {values.map((v, i) => (
        <div key={i} className={`w-[6px] rounded-full ${color}`} style={{ height: `${(v / max) * 100}%`, opacity: 0.4 + (v / max) * 0.6 }} />
      ))}
    </div>
  );
}

export default function PharmacyDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const pending = orders.filter(o => o.status === 'PENDING');
  const inProgress = orders.filter(o => ['ACCEPTED', 'PREPARING'].includes(o.status));
  const ready = orders.filter(o => o.status === 'READY');
  const delivered = orders.filter(o => o.status === 'DELIVERED');
  const revenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + (o.totalPrice || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Dashboard Overview</h1>
        <p className="text-dark-400 text-sm mt-0.5">Suivi de vos commandes en temps réel</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Nouvelles', value: pending.length, icon: <AlertCircle className="h-5 w-5" />, color: 'bg-amber-50 text-amber-500', ring: pending.length > 0 },
          { label: 'En cours', value: inProgress.length, icon: <Clock className="h-5 w-5" />, color: 'bg-blue-50 text-blue-500' },
          { label: 'Prêtes', value: ready.length, icon: <Package className="h-5 w-5" />, color: 'bg-purple-50 text-purple-500' },
          { label: 'Livrées', value: delivered.length, icon: <CheckCircle className="h-5 w-5" />, color: 'bg-emerald-50 text-emerald-500' },
          { label: 'Revenus', value: `${revenue.toFixed(0)}€`, icon: <Euro className="h-5 w-5" />, color: 'bg-primary-50 text-primary-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-dark-100/60">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center relative ${stat.color}`}>
                {stat.icon}
                {stat.ring && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />}
              </div>
              <ArrowUpRight className="h-4 w-4 text-dark-200" />
            </div>
            <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
            <p className="text-xs text-dark-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Orders list - 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pending */}
          {pending.length > 0 && (
            <div className="bg-white rounded-2xl border border-dark-100/60">
              <div className="flex items-center gap-2 p-5 pb-3">
                <Bell className="h-4 w-4 text-amber-500 animate-pulse-soft" />
                <h2 className="font-bold text-dark-900">Nouvelles commandes</h2>
                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">{pending.length}</span>
              </div>
              <div className="px-5 pb-4 space-y-2">
                {pending.map(order => <OrderRow key={order.id} order={order} isNew />)}
              </div>
            </div>
          )}

          {/* In progress + ready */}
          {(inProgress.length > 0 || ready.length > 0) && (
            <div className="bg-white rounded-2xl border border-dark-100/60">
              <div className="flex items-center justify-between p-5 pb-3">
                <h2 className="font-bold text-dark-900">En cours de traitement</h2>
                <Link href="/pharmacy/orders" className="text-xs text-primary-500 font-medium hover:underline">Tout voir</Link>
              </div>
              <div className="px-5 pb-4 space-y-2">
                {[...inProgress, ...ready].map(order => <OrderRow key={order.id} order={order} />)}
              </div>
            </div>
          )}

          {pending.length === 0 && inProgress.length === 0 && ready.length === 0 && (
            <div className="bg-white rounded-2xl border border-dark-100/60 p-8 text-center">
              <div className="w-14 h-14 bg-dark-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Package className="h-7 w-7 text-dark-300" />
              </div>
              <p className="font-semibold text-dark-900 mb-1">Aucune commande en attente</p>
              <p className="text-xs text-dark-400">Les nouvelles commandes apparaîtront ici</p>
            </div>
          )}
        </div>

        {/* Stats panel */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-primary-100">Revenus du mois</p>
              <TrendingUp className="h-4 w-4 text-primary-200" />
            </div>
            <p className="text-3xl font-bold">{revenue.toFixed(2)} &euro;</p>
            <div className="mt-4">
              <MiniBarChart values={[3, 5, 2, 7, 4, 8, 6, delivered.length || 1]} color="bg-white" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-dark-100/60 p-5">
            <h3 className="font-bold text-dark-900 mb-3 text-sm">Performance</h3>
            <div className="space-y-3">
              {[
                { label: 'Acceptées', pct: orders.length ? Math.round(((orders.length - orders.filter(o => o.status === 'CANCELLED').length) / orders.length) * 100) : 100, color: 'bg-primary-500' },
                { label: 'En préparation', pct: orders.length ? Math.round((inProgress.length / Math.max(orders.length, 1)) * 100) : 0, color: 'bg-blue-500' },
                { label: 'Livrées', pct: orders.length ? Math.round((delivered.length / orders.length) * 100) : 0, color: 'bg-emerald-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark-500">{item.label}</span>
                    <span className="font-bold text-dark-700">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-dark-50 rounded-full">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order, isNew }: { order: Order; isNew?: boolean }) {
  return (
    <Link href={`/pharmacy/order/${order.id}`}
      className={`flex items-center justify-between p-3 rounded-xl hover:bg-dark-50/50 transition-colors group ${isNew ? 'bg-amber-50/30' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isNew ? 'bg-amber-50' : 'bg-dark-50'}`}>
          <span className="text-sm font-bold text-dark-400">{order.client.name.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-dark-900">{order.client.name}</p>
          <p className="text-xs text-dark-400">{order.client.phone} &middot; {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={order.status} />
        <Eye className="h-4 w-4 text-dark-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
