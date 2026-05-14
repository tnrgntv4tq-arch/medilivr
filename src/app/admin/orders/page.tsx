'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Euro, MapPin, Clock, User, ChevronDown } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { type OrderStatus } from '@/types';

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  distance: number;
  clientAddress: string;
  paid: boolean;
  notes: string | null;
  createdAt: string;
  client: { id: string; name: string; email: string };
  pharmacy: { id: string; name: string; pharmacyName: string } | null;
  delivery: { id: string; name: string } | null;
}

const STATUSES: { key: string; label: string }[] = [
  { key: '', label: 'Toutes' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'ACCEPTED', label: 'Acceptées' },
  { key: 'PREPARING', label: 'En préparation' },
  { key: 'READY', label: 'Prêtes' },
  { key: 'PICKED_UP', label: 'Récupérées' },
  { key: 'IN_TRANSIT', label: 'En livraison' },
  { key: 'DELIVERED', label: 'Livrées' },
  { key: 'CANCELLED', label: 'Annulées' },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || '');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    fetch(`/api/admin/orders?${params}`)
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">Commandes</h1>
        <span className="text-sm text-dark-400">{orders.length} résultat{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUSES.map(s => (
          <button
            key={s.key}
            onClick={() => { setFilter(s.key); setLoading(true); }}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filter === s.key ? 'bg-primary-500 text-white' : 'bg-white text-dark-500 border border-dark-100 hover:border-dark-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="h-8 w-8 text-dark-300 mx-auto mb-2" />
          <p className="text-dark-400 text-sm">Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-dark-100/60 p-5">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-dark-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-dark-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-dark-900 text-sm truncate">
                        #{order.id.slice(-8).toUpperCase()} — {order.client.name}
                      </p>
                      <p className="text-xs text-dark-400 truncate">
                        {order.pharmacy?.pharmacyName || '—'} · {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-bold text-dark-900 hidden sm:block">{order.totalPrice?.toFixed(2)} €</span>
                    <ChevronDown className={`h-4 w-4 text-dark-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-dark-50 space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-dark-400 uppercase tracking-wide">Client</p>
                          <p className="text-dark-700 font-medium">{order.client.name}</p>
                          <p className="text-xs text-dark-400">{order.client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-dark-400 uppercase tracking-wide">Pharmacie</p>
                          <p className="text-dark-700 font-medium">{order.pharmacy?.pharmacyName || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-dark-400 uppercase tracking-wide">Livreur</p>
                          <p className="text-dark-700 font-medium">{order.delivery?.name || 'Non assigné'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-dark-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {order.distance} km</span>
                      <span className="flex items-center gap-1"><Euro className="h-3.5 w-3.5" /> {order.totalPrice?.toFixed(2)} €</span>
                      <span className={order.paid ? 'text-emerald-600' : 'text-amber-600'}>
                        {order.paid ? '✓ Payée' : '⏳ Non payée'}
                      </span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleString('fr-FR')}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-dark-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-dark-500">{order.clientAddress}</p>
                    </div>

                    {order.notes && (
                      <div className="bg-dark-50/50 rounded-xl p-3">
                        <p className="text-[10px] text-dark-400 uppercase tracking-wide mb-1">Notes</p>
                        <p className="text-xs text-dark-600">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
