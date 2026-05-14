'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, ChevronDown, Filter, RefreshCw, MapPin, Clock, Euro, Calendar, RotateCcw } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { type OrderStatus } from '@/types';

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  distance: number;
  createdAt: string;
  clientAddress: string;
  notes: string | null;
  paid: boolean;
  pharmacy?: { id: string; pharmacyName: string; address: string };
}

type FilterKey = 'all' | 'active' | 'delivered' | 'cancelled';

const FILTERS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'Toutes', icon: <Package className="h-3.5 w-3.5" /> },
  { key: 'active', label: 'En cours', icon: <Clock className="h-3.5 w-3.5" /> },
  { key: 'delivered', label: 'Livrées', icon: <ChevronRight className="h-3.5 w-3.5" /> },
  { key: 'cancelled', label: 'Annulées', icon: <Filter className="h-3.5 w-3.5" /> },
];

const ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'IN_TRANSIT'];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function groupByMonth(orders: Order[]): { label: string; orders: Order[] }[] {
  const groups = new Map<string, Order[]>();
  for (const order of orders) {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(order);
    (groups.get(key) as Order[] & { _label?: string })._label = label;
  }
  return Array.from(groups.entries()).map(([, orders]) => ({
    label: (orders as Order[] & { _label?: string })._label || '',
    orders,
  }));
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (filter === 'active') return ACTIVE_STATUSES.includes(o.status as OrderStatus);
    if (filter === 'delivered') return o.status === 'DELIVERED';
    if (filter === 'cancelled') return o.status === 'CANCELLED';
    return true;
  });

  const grouped = groupByMonth(filtered);

  const counts = {
    all: orders.length,
    active: orders.filter(o => ACTIVE_STATUSES.includes(o.status as OrderStatus)).length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
  };

  const handleReorder = (order: Order) => {
    if (order.pharmacy) {
      const params = new URLSearchParams({ pharmacyId: order.pharmacy.id });
      router.push(`/client/new-order?${params.toString()}`);
    } else {
      router.push('/client/new-order');
    }
  };

  if (loading) return (
    <div className="text-center py-16 text-dark-400">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">Mes commandes</h1>
        <span className="text-sm text-dark-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white text-dark-500 border border-dark-100 hover:border-dark-200'
            }`}
          >
            {f.icon}
            {f.label}
            {counts[f.key] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.key ? 'bg-white/20' : 'bg-dark-50'
              }`}>
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-dark-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-dark-300" />
          </div>
          <p className="text-dark-900 font-semibold mb-1">Aucune commande</p>
          <p className="text-dark-400 text-sm mb-4">
            {filter === 'all' ? 'Vos commandes apparaîtront ici' : `Aucune commande ${FILTERS.find(f => f.key === filter)?.label.toLowerCase()}`}
          </p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-sm text-primary-500 font-medium hover:underline">
              Voir toutes les commandes
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-3.5 w-3.5 text-dark-300" />
                <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">{group.label}</span>
              </div>
              <div className="space-y-3">
                {group.orders.map(order => {
                  const isExpanded = expandedId === order.id;
                  const isActive = ACTIVE_STATUSES.includes(order.status as OrderStatus);

                  return (
                    <div key={order.id} className="card overflow-hidden">
                      {/* Header row — always visible */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="w-full text-left flex justify-between items-center"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-dark-900 truncate">
                            {order.pharmacy?.pharmacyName || 'Pharmacie'}
                          </p>
                          <p className="text-xs text-dark-400 mt-0.5">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3 pl-4">
                          <StatusBadge status={order.status} />
                          <span className="text-sm font-bold text-dark-900">{order.totalPrice?.toFixed(2)} &euro;</span>
                          <ChevronDown className={`h-4 w-4 text-dark-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-dark-50 space-y-3 animate-fade-in">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-start gap-2.5">
                              <MapPin className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[10px] text-dark-400 uppercase tracking-wide">Pharmacie</p>
                                <p className="text-sm text-dark-700">{order.pharmacy?.address || '—'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <MapPin className="h-4 w-4 text-accent-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[10px] text-dark-400 uppercase tracking-wide">Livraison</p>
                                <p className="text-sm text-dark-700 line-clamp-2">{order.clientAddress || '—'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-dark-500">
                            <span className="flex items-center gap-1.5">
                              <Euro className="h-3.5 w-3.5" /> {order.totalPrice?.toFixed(2)} €
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" /> {order.distance} km
                            </span>
                            <span className={`flex items-center gap-1.5 ${order.paid ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {order.paid ? '✓ Payée' : '⏳ Non payée'}
                            </span>
                          </div>

                          {order.notes && (
                            <div className="bg-dark-50/50 rounded-xl p-3">
                              <p className="text-[10px] text-dark-400 uppercase tracking-wide mb-1">Notes</p>
                              <p className="text-sm text-dark-600">{order.notes}</p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            {isActive && (
                              <Link
                                href={`/client/track/${order.id}`}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm !py-2.5"
                              >
                                <RefreshCw className="h-4 w-4" /> Suivre
                              </Link>
                            )}
                            {order.status === 'DELIVERED' && (
                              <button
                                onClick={() => handleReorder(order)}
                                className="btn-accent flex-1 flex items-center justify-center gap-2 text-sm !py-2.5"
                              >
                                <RotateCcw className="h-4 w-4" /> Recommander
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
