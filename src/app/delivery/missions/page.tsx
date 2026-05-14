'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, ChevronRight, Euro } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  distance: number;
  createdAt: string;
  client: { name: string };
  pharmacy: { pharmacyName: string } | null;
}

export default function MissionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || []));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-900">Mes missions</h1>
      {orders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-dark-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="h-8 w-8 text-dark-300" />
          </div>
          <p className="text-dark-900 font-semibold mb-1">Aucune mission</p>
          <p className="text-dark-400 text-sm">Vos missions apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order.id} href={`/delivery/mission/${order.id}`} className="card-hover block">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-dark-900">{order.pharmacy?.pharmacyName} &rarr; {order.client.name}</p>
                  <p className="text-xs text-dark-400 mt-1">{new Date(order.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-bold text-primary-600 mt-1 flex items-center justify-end gap-0.5">
                      <Euro className="h-3.5 w-3.5" />{order.totalPrice?.toFixed(2)}
                    </p>
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
