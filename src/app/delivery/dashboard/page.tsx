'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, MapPin, Package, Navigation, Euro, ArrowUpRight, CheckCircle, Clock, Zap } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  distance: number;
  clientAddress: string;
  clientLat: number;
  clientLng: number;
  client: { name: string; address: string };
  pharmacy: { pharmacyName: string; address: string; lat: number; lng: number } | null;
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

export default function DeliveryDashboard() {
  const [available, setAvailable] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [myLat, setMyLat] = useState(48.8566);
  const [myLng, setMyLng] = useState(2.3522);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => { setMyLat(pos.coords.latitude); setMyLng(pos.coords.longitude); });

    const fetchData = () => {
      Promise.all([
        fetch('/api/orders/available').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
      ]).then(([avail, mine]) => {
        setAvailable(avail.orders || []);
        const all = mine.orders || [];
        setAllOrders(all);
        setMyOrders(all.filter((o: Order) => !['DELIVERED', 'CANCELLED'].includes(o.status)));
      }).finally(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const delivered = allOrders.filter(o => o.status === 'DELIVERED');
  const totalEarned = delivered.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const totalKm = delivered.reduce((s, o) => s + (o.distance || 0), 0);

  const markers = [
    { lat: myLat, lng: myLng, label: 'Ma position', color: 'blue' },
    ...available.map(o => ({ lat: o.pharmacy?.lat || 0, lng: o.pharmacy?.lng || 0, label: o.pharmacy?.pharmacyName || '', color: 'green' as string })),
    ...myOrders.map(o => ({ lat: o.clientLat, lng: o.clientLng, label: o.client.name, color: 'orange' as string })),
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Espace Livreur</h1>
        <p className="text-dark-400 text-sm mt-0.5">Trouvez des missions et suivez vos gains</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Euro className="h-5 w-5 text-primary-200" />
            <ArrowUpRight className="h-4 w-4 text-primary-200" />
          </div>
          <p className="text-2xl font-bold">{totalEarned.toFixed(2)} &euro;</p>
          <p className="text-xs text-primary-100 mt-0.5">Gains totaux</p>
          <div className="mt-3"><MiniBarChart values={[3, 5, 2, 7, 4, 6, 5]} color="bg-white" /></div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-dark-100/60">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center"><CheckCircle className="h-5 w-5 text-emerald-500" /></div>
            <ArrowUpRight className="h-4 w-4 text-dark-200" />
          </div>
          <p className="text-2xl font-bold text-dark-900">{delivered.length}</p>
          <p className="text-xs text-dark-400 mt-0.5">Livraisons</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-dark-100/60">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><Navigation className="h-5 w-5 text-blue-500" /></div>
            <ArrowUpRight className="h-4 w-4 text-dark-200" />
          </div>
          <p className="text-2xl font-bold text-dark-900">{totalKm.toFixed(1)}</p>
          <p className="text-xs text-dark-400 mt-0.5">Km parcourus</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-dark-100/60">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center"><Zap className="h-5 w-5 text-amber-500" /></div>
            <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">{available.length}</span>
          </div>
          <p className="text-2xl font-bold text-dark-900">{available.length}</p>
          <p className="text-xs text-dark-400 mt-0.5">Disponibles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-dark-100/60 overflow-hidden">
          <div className="p-4 pb-2 flex items-center justify-between">
            <h2 className="font-bold text-dark-900 text-sm">Carte en direct</h2>
            <div className="flex items-center gap-3 text-[10px] text-dark-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Vous</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Pharmacies</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Clients</span>
            </div>
          </div>
          <Map center={[myLat, myLng]} markers={markers} className="h-72" />
        </div>

        {/* Active missions */}
        <div className="bg-white rounded-2xl border border-dark-100/60">
          <div className="p-4 pb-2 flex items-center justify-between">
            <h2 className="font-bold text-dark-900 text-sm">Mes missions</h2>
            <Clock className="h-4 w-4 text-dark-300" />
          </div>
          <div className="px-4 pb-4">
            {myOrders.length > 0 ? myOrders.map(order => (
              <Link key={order.id} href={`/delivery/mission/${order.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-50/50 transition-colors">
                <div className="w-9 h-9 bg-accent-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-accent-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-dark-900 truncate">{order.pharmacy?.pharmacyName}</p>
                  <p className="text-[10px] text-dark-400 truncate">&rarr; {order.client.name}</p>
                </div>
                <StatusBadge status={order.status} />
              </Link>
            )) : (
              <p className="text-xs text-dark-400 text-center py-6">Aucune mission active</p>
            )}
          </div>
        </div>
      </div>

      {/* Available missions */}
      <div className="bg-white rounded-2xl border border-dark-100/60">
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-500" />
            <h2 className="font-bold text-dark-900">Missions disponibles</h2>
            {available.length > 0 && <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">{available.length}</span>}
          </div>
        </div>
        {available.length === 0 ? (
          <div className="px-5 pb-8 text-center">
            <div className="w-14 h-14 bg-dark-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Truck className="h-7 w-7 text-dark-300" />
            </div>
            <p className="text-sm text-dark-400">Aucune mission disponible</p>
            <p className="text-[10px] text-dark-300 mt-1">Mise à jour automatique</p>
          </div>
        ) : (
          <div className="px-5 pb-4 space-y-2">
            {available.map(order => (
              <Link key={order.id} href={`/delivery/mission/${order.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-50/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-900">{order.pharmacy?.pharmacyName} &rarr; {order.client.name}</p>
                    <p className="text-xs text-dark-400">{order.distance} km &middot; {order.pharmacy?.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary-600">{order.totalPrice?.toFixed(2)} &euro;</span>
                  <ArrowUpRight className="h-4 w-4 text-dark-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
