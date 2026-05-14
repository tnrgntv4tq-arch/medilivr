'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, MapPin, FileText, Shield, Lock, Eye } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface OrderDetail {
  id: string;
  status: string;
  totalPrice: number;
  distance: number;
  notes: string | null;
  createdAt: string;
  paid: boolean;
  client: { name: string; phone: string; address: string };
}

export default function PharmacyOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(d => setOrder(d.order));
  }, [id]);

  const viewPrescription = async () => {
    try {
      const res = await fetch(`/api/prescriptions/${id}`);
      if (!res.ok) return;
      const blob = await res.blob();
      setPrescriptionUrl(URL.createObjectURL(blob));
    } catch { /* ignore */ }
  };

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setOrder(prev => prev ? { ...prev, status } : null);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return (
    <div className="text-center py-16 text-dark-400">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      Chargement...
    </div>
  );

  const nextAction: Record<string, { label: string; status: string; style: string }> = {
    PENDING: { label: 'Accepter la commande', status: 'ACCEPTED', style: 'btn-primary' },
    ACCEPTED: { label: 'Commencer la préparation', status: 'PREPARING', style: 'btn-primary' },
    PREPARING: { label: 'Marquer comme prête', status: 'READY', style: 'btn-success' },
  };

  const action = nextAction[order.status];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-dark-500 hover:text-dark-700 transition-colors text-sm">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">Commande</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Patient info */}
      <div className="card space-y-4">
        <h2 className="font-bold text-dark-900">Informations patient</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-dark-50 flex items-center justify-center"><User className="h-4 w-4 text-dark-400" /></div><span className="text-dark-700">{order.client.name}</span></div>
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-dark-50 flex items-center justify-center"><Phone className="h-4 w-4 text-dark-400" /></div><a href={`tel:${order.client.phone}`} className="text-primary-600">{order.client.phone}</a></div>
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-dark-50 flex items-center justify-center"><MapPin className="h-4 w-4 text-dark-400" /></div><span className="text-dark-700">{order.client.address || 'Non renseignée'}</span></div>
        </div>
        {order.notes && (
          <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700 border border-blue-100">
            <strong>Note :</strong> {order.notes}
          </div>
        )}
      </div>

      {/* Prescription */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-dark-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" /> Ordonnance
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
            <Lock className="h-3.5 w-3.5" /> AES-256
          </div>
        </div>

        {prescriptionUrl ? (
          <div className="relative">
            <img src={prescriptionUrl} alt="Ordonnance" className="max-w-full rounded-2xl border border-dark-100" />
            <div className="absolute top-3 right-3 bg-primary-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <Shield className="h-3 w-3" /> Déchiffrée
            </div>
          </div>
        ) : (
          <button onClick={viewPrescription}
            className="w-full p-6 border-2 border-dashed border-primary-200 rounded-2xl text-center hover:bg-primary-50/30 transition-all duration-200 group">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
              <Eye className="h-6 w-6 text-primary-500" />
            </div>
            <p className="font-semibold text-primary-600">Déchiffrer et consulter l&apos;ordonnance</p>
            <p className="text-xs text-dark-400 mt-1">Vous seul pouvez accéder à ce document</p>
          </button>
        )}
      </div>

      {/* Pricing */}
      <div className="card">
        <div className="flex justify-between text-sm mb-2"><span className="text-dark-500">Distance</span><span className="text-dark-700">{order.distance} km</span></div>
        <div className="flex justify-between text-sm mb-2"><span className="text-dark-500">Paiement</span>
          <span className={`font-medium ${order.paid ? 'text-emerald-600' : 'text-amber-600'}`}>{order.paid ? 'Payé' : 'En attente'}</span>
        </div>
        <div className="border-t border-dark-100 pt-3 mt-3 flex justify-between">
          <span className="font-bold text-dark-900">Total</span>
          <span className="font-bold text-primary-600 text-lg">{order.totalPrice?.toFixed(2)} &euro;</span>
        </div>
      </div>

      {/* Actions */}
      {action && (
        <div className="flex gap-3">
          {order.status === 'PENDING' && (
            <button onClick={() => updateStatus('CANCELLED')} disabled={loading} className="btn-danger flex-1">
              Refuser
            </button>
          )}
          <button onClick={() => updateStatus(action.status)} disabled={loading} className={`${action.style} flex-1`}>
            {loading ? 'Chargement...' : action.label}
          </button>
        </div>
      )}

      {order.status === 'READY' && (
        <div className="p-4 bg-purple-50 rounded-2xl text-center text-purple-700 text-sm border border-purple-100">
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          En attente d&apos;un livreur...
        </div>
      )}
    </div>
  );
}
