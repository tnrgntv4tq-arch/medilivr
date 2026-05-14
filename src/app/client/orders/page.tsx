'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  distance: number;
  createdAt: string;
  pharmacy?: { pharmacyName: string; address: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-16 text-dark-400">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-900">Mes commandes</h1>
      {orders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-dark-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-dark-300" />
          </div>
          <p className="text-dark-900 font-semibold mb-1">Aucune commande</p>
          <p className="text-dark-400 text-sm">Vos commandes apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order.id} href={`/client/track/${order.id}`} className="card-hover block">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-900 truncate">{order.pharmacy?.pharmacyName || 'Pharmacie'}</p>
                  <p className="text-sm text-dark-400 truncate">{order.pharmacy?.address}</p>
                  <p className="text-xs text-dark-400 mt-1">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right pl-4 flex items-center gap-3">
                  <div>
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-bold text-dark-900 mt-1.5">{order.totalPrice?.toFixed(2)} &euro;</p>
                    <p className="text-xs text-dark-400">{order.distance} km</p>
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
