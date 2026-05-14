'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  client: { name: string };
}

const FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'PENDING', label: 'Nouvelles' },
  { value: 'ACCEPTED', label: 'Acceptées' },
  { value: 'PREPARING', label: 'En cours' },
  { value: 'READY', label: 'Prêtes' },
  { value: 'DELIVERED', label: 'Livrées' },
];

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || []));
  }, []);

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-900">Toutes les commandes</h1>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === f.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-dark-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-dark-300" />
          </div>
          <p className="text-dark-500">Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <Link key={order.id} href={`/pharmacy/order/${order.id}`} className="card-hover block">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-dark-900">{order.client?.name}</p>
                  <p className="text-xs text-dark-400">{new Date(order.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-bold text-dark-900 mt-1">{order.totalPrice?.toFixed(2)} &euro;</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-dark-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
