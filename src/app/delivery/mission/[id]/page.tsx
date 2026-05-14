'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, User, Navigation, CheckCircle, Package, Shield, Euro, Locate } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Mission {
  id: string;
  status: string;
  totalPrice: number;
  distance: number;
  clientAddress: string;
  clientLat: number;
  clientLng: number;
  client: { name: string; phone: string; address: string };
  pharmacy: { pharmacyName: string; address: string; lat: number; lng: number } | null;
  delivery: { name: string } | null;
}

export default function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(false);
  const [myLat, setMyLat] = useState(48.8566);
  const [myLng, setMyLng] = useState(2.3522);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(d => setMission(d.order));
  }, [id]);

  const updatePosition = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setMyLat(pos.coords.latitude);
      setMyLng(pos.coords.longitude);
      fetch(`/api/tracking/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      });
    });
  }, [id]);

  useEffect(() => {
    if (!mission || !['PICKED_UP', 'IN_TRANSIT'].includes(mission.status)) return;
    updatePosition();
    const interval = setInterval(updatePosition, 10000);
    return () => clearInterval(interval);
  }, [mission, updatePosition]);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setMission(prev => prev ? { ...prev, status } : null);
      if (status === 'DELIVERED') router.push('/delivery/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (!mission) return (
    <div className="text-center py-16 text-dark-400">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      Chargement...
    </div>
  );

  const markers = [];
  if (mission.pharmacy) markers.push({ lat: mission.pharmacy.lat, lng: mission.pharmacy.lng, label: mission.pharmacy.pharmacyName, color: 'green' });
  markers.push({ lat: mission.clientLat, lng: mission.clientLng, label: mission.client.name, color: 'red' });
  markers.push({ lat: myLat, lng: myLng, label: 'Ma position', color: 'blue' });

  const actions: Record<string, { label: string; status: string; icon: React.ReactNode; style: string }> = {
    READY: { label: 'Accepter la mission', status: 'PICKED_UP', icon: <Package className="h-5 w-5" />, style: 'btn-primary' },
    PICKED_UP: { label: 'Démarrer la livraison', status: 'IN_TRANSIT', icon: <Navigation className="h-5 w-5" />, style: 'btn-accent' },
    IN_TRANSIT: { label: 'Marquer comme livré', status: 'DELIVERED', icon: <CheckCircle className="h-5 w-5" />, style: 'btn-success' },
  };

  const action = actions[mission.status];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-dark-500 hover:text-dark-700 transition-colors text-sm">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">Mission</h1>
        <StatusBadge status={mission.status} />
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden">
        <Map center={[myLat, myLng]} markers={markers} className="h-72" />
      </div>

      {/* Route */}
      <div className="card space-y-3 p-0">
        <div className="p-4 flex items-start gap-3 border-b border-dark-50">
          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center mt-0.5">
            <Package className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">Récupérer à</p>
            <p className="font-semibold text-dark-900">{mission.pharmacy?.pharmacyName}</p>
            <p className="text-sm text-dark-400">{mission.pharmacy?.address}</p>
          </div>
        </div>
        <div className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-accent-50 rounded-lg flex items-center justify-center mt-0.5">
            <MapPin className="h-4 w-4 text-accent-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-accent-600 uppercase tracking-wide">Livrer à</p>
            <p className="font-semibold text-dark-900">{mission.client.name}</p>
            <p className="text-sm text-dark-400">{mission.clientAddress || mission.client.address}</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dark-50 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-dark-400" />
          </div>
          <div>
            <p className="font-semibold text-dark-900 text-sm">{mission.client.name}</p>
            <p className="text-xs text-dark-400">Client</p>
          </div>
        </div>
        <a href={`tel:${mission.client.phone}`} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors">
          <Phone className="h-4 w-4" /> Appeler
        </a>
      </div>

      {/* Earnings */}
      <div className="card flex justify-between items-center">
        <div>
          <p className="text-xs text-dark-400 uppercase tracking-wide">Rémunération</p>
          <p className="text-2xl font-bold text-primary-600 flex items-center gap-1">
            <Euro className="h-5 w-5" />{mission.totalPrice?.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-dark-400 uppercase tracking-wide">Distance</p>
          <p className="text-lg font-bold text-dark-900">{mission.distance} km</p>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
        <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Les données médicales du patient sont protégées. Vous n&apos;avez pas accès à l&apos;ordonnance.
        </p>
      </div>

      {/* Action button */}
      {action && (
        <button onClick={() => updateStatus(action.status)} disabled={loading}
          className={`${action.style} w-full flex items-center justify-center gap-2 text-lg !py-4`}>
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Chargement...</>
          ) : (
            <>{action.icon} {action.label}</>
          )}
        </button>
      )}

      {['PICKED_UP', 'IN_TRANSIT'].includes(mission.status) && (
        <div className="flex items-center justify-center gap-2 text-xs text-dark-400">
          <Locate className="h-3.5 w-3.5 animate-pulse-soft" /> Position GPS transmise au client
        </div>
      )}
    </div>
  );
}
