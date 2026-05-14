'use client';

import { useState, useEffect, use } from 'react';
import { Package, MapPin, Phone, Clock, User, Wifi, WifiOff, Star, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import StatusBadge from '@/components/StatusBadge';
import StarRating from '@/components/StarRating';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types';
import { useTrackingSSE } from '@/hooks/useTrackingSSE';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Tracking {
  id: string;
  status: string;
  clientLat: number;
  clientLng: number;
  clientAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  pharmacyId: string | null;
  deliveryId: string | null;
  pharmacy: { id: string; lat: number; lng: number; pharmacyName: string; address: string } | null;
  delivery: { id: string; name: string; phone: string } | null;
}

interface ExistingReview {
  type: string;
  rating: number;
  comment: string | null;
}

const STEPS: OrderStatus[] = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

export default function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const sse = useTrackingSSE(id);

  const [existingReviews, setExistingReviews] = useState<ExistingReview[]>([]);
  const [pharmacyRating, setPharmacyRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [pharmacyComment, setPharmacyComment] = useState('');
  const [deliveryComment, setDeliveryComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/tracking/${id}`).then(r => r.json()).then(d => setTracking(d.tracking));
    fetch(`/api/reviews?orderId=${id}`).then(r => r.json()).then(d => {
      if (d.reviews) setExistingReviews(d.reviews);
    });
  }, [id]);

  useEffect(() => {
    if (!tracking || !sse.status) return;
    setTracking(prev => {
      if (!prev) return null;
      const updated: Tracking = {
        ...prev,
        deliveryLat: sse.deliveryLat ?? prev.deliveryLat,
        deliveryLng: sse.deliveryLng ?? prev.deliveryLng,
        status: sse.status ?? prev.status,
      };
      if (sse.delivery && prev.delivery) {
        updated.delivery = { ...prev.delivery, name: sse.delivery.name, phone: sse.delivery.phone };
      }
      return updated;
    });
  }, [sse.deliveryLat, sse.deliveryLng, sse.status, sse.delivery]);

  if (!tracking) return (
    <div className="text-center py-16 text-dark-400">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
    </div>
  );

  const currentStep = STEPS.indexOf(tracking.status as OrderStatus);
  const markers = [{ lat: tracking.clientLat, lng: tracking.clientLng, label: 'Vous', color: 'blue' }];
  if (tracking.pharmacy) markers.push({ lat: tracking.pharmacy.lat, lng: tracking.pharmacy.lng, label: tracking.pharmacy.pharmacyName, color: 'green' });
  if (tracking.deliveryLat && tracking.deliveryLng) markers.push({ lat: tracking.deliveryLat, lng: tracking.deliveryLng, label: 'Livreur', color: 'orange' });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">Suivi de commande</h1>
        <StatusBadge status={tracking.status} />
      </div>

      <div className="card p-0 overflow-hidden">
        <Map center={[tracking.clientLat, tracking.clientLng]} markers={markers} className="h-72" />
      </div>

      {/* Progress */}
      <div className="card">
        <h2 className="font-bold text-dark-900 mb-5">Progression</h2>
        <div className="relative">
          {/* Line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-dark-100" />
          <div className="absolute left-[15px] top-4 w-0.5 bg-primary-500 transition-all duration-500"
            style={{ height: `${Math.max(0, (currentStep / (STEPS.length - 1)) * 100)}%` }} />

          <div className="space-y-4 relative">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-300 ${
                  i < currentStep ? 'bg-primary-500 text-white' :
                  i === currentStep ? 'bg-primary-500 text-white ring-4 ring-primary-100' :
                  'bg-dark-100 text-dark-400'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-sm transition-colors ${i <= currentStep ? 'font-semibold text-dark-900' : 'text-dark-400'}`}>
                  {ORDER_STATUS_LABELS[s]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="card space-y-4">
        <h2 className="font-bold text-dark-900">Détails</h2>
        {tracking.pharmacy && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center mt-0.5">
              <Package className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-dark-900">{tracking.pharmacy.pharmacyName}</p>
              <p className="text-sm text-dark-400">{tracking.pharmacy.address}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-accent-50 rounded-lg flex items-center justify-center mt-0.5">
            <MapPin className="h-4 w-4 text-accent-600" />
          </div>
          <div>
            <p className="font-medium text-dark-900">Adresse de livraison</p>
            <p className="text-sm text-dark-400">{tracking.clientAddress}</p>
          </div>
        </div>
        {tracking.delivery && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mt-0.5">
              <User className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark-900">{tracking.delivery.name}</p>
              <a href={`tel:${tracking.delivery.phone}`} className="text-sm text-primary-600 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {tracking.delivery.phone}
              </a>
            </div>
          </div>
        )}
        {['IN_TRANSIT', 'PICKED_UP'].includes(tracking.status) && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl ${
            sse.isConnected ? 'text-primary-600 bg-primary-50' : 'text-amber-600 bg-amber-50'
          }`}>
            {sse.isConnected ? (
              <><Wifi className="h-3.5 w-3.5 animate-pulse-soft" /> Suivi en direct</>
            ) : (
              <><WifiOff className="h-3.5 w-3.5" /> Reconnexion...</>
            )}
          </div>
        )}
      </div>

      {/* Reviews section */}
      {tracking.status === 'DELIVERED' && (
        <div className="card space-y-5">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            <h2 className="font-bold text-dark-900">Votre avis</h2>
          </div>

          {/* Pharmacy review */}
          {tracking.pharmacy && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-dark-700">{tracking.pharmacy.pharmacyName}</p>
              {existingReviews.find(r => r.type === 'pharmacy') || reviewSuccess.includes('pharmacy') ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
                  <Star className="h-4 w-4 fill-emerald-500" />
                  Merci pour votre avis !
                  {existingReviews.find(r => r.type === 'pharmacy') && (
                    <StarRating value={existingReviews.find(r => r.type === 'pharmacy')!.rating} size="sm" readonly />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <StarRating value={pharmacyRating} onChange={setPharmacyRating} />
                  {pharmacyRating > 0 && (
                    <>
                      <textarea
                        value={pharmacyComment}
                        onChange={e => setPharmacyComment(e.target.value)}
                        placeholder="Un commentaire ? (optionnel)"
                        className="input text-sm min-h-[60px]"
                      />
                      <button
                        disabled={reviewSubmitting}
                        onClick={async () => {
                          setReviewSubmitting(true);
                          const res = await fetch('/api/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              orderId: id,
                              targetId: tracking.pharmacy!.id,
                              type: 'pharmacy',
                              rating: pharmacyRating,
                              comment: pharmacyComment,
                            }),
                          });
                          if (res.ok) setReviewSuccess(prev => [...prev, 'pharmacy']);
                          setReviewSubmitting(false);
                        }}
                        className="btn-primary text-sm flex items-center gap-2 !py-2"
                      >
                        <Send className="h-3.5 w-3.5" /> Envoyer
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delivery review */}
          {tracking.delivery && (
            <div className="space-y-3 pt-4 border-t border-dark-50">
              <p className="text-sm font-semibold text-dark-700">{tracking.delivery.name} (Livreur)</p>
              {existingReviews.find(r => r.type === 'delivery') || reviewSuccess.includes('delivery') ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
                  <Star className="h-4 w-4 fill-emerald-500" />
                  Merci pour votre avis !
                  {existingReviews.find(r => r.type === 'delivery') && (
                    <StarRating value={existingReviews.find(r => r.type === 'delivery')!.rating} size="sm" readonly />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <StarRating value={deliveryRating} onChange={setDeliveryRating} />
                  {deliveryRating > 0 && (
                    <>
                      <textarea
                        value={deliveryComment}
                        onChange={e => setDeliveryComment(e.target.value)}
                        placeholder="Un commentaire ? (optionnel)"
                        className="input text-sm min-h-[60px]"
                      />
                      <button
                        disabled={reviewSubmitting}
                        onClick={async () => {
                          setReviewSubmitting(true);
                          const res = await fetch('/api/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              orderId: id,
                              targetId: tracking.delivery!.id,
                              type: 'delivery',
                              rating: deliveryRating,
                              comment: deliveryComment,
                            }),
                          });
                          if (res.ok) setReviewSuccess(prev => [...prev, 'delivery']);
                          setReviewSubmitting(false);
                        }}
                        className="btn-primary text-sm flex items-center gap-2 !py-2"
                      >
                        <Send className="h-3.5 w-3.5" /> Envoyer
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
