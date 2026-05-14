'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, MapPin, CreditCard, Camera, FileText, ChevronRight, ChevronLeft, Check, Shield, Locate, Search, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Pharmacy {
  id: string;
  pharmacyName: string;
  address: string;
  lat: number;
  lng: number;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    const data = await res.json();
    return data.display_name || '';
  } catch {
    return '';
  }
}

async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    return await res.json();
  } catch {
    return [];
  }
}

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(48.8566);
  const [lng, setLng] = useState(2.3522);
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/pharmacies').then(r => r.json()).then(d => setPharmacies(d.pharmacies || []));
    handleLocate();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        const addr = await reverseGeocode(newLat, newLng);
        if (addr) setAddress(addr);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      const results = await searchAddress(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 400);
  };

  const selectSuggestion = (s: AddressSuggestion) => {
    setAddress(s.display_name);
    setLat(parseFloat(s.lat));
    setLng(parseFloat(s.lon));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleMapClick = async (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    const addr = await reverseGeocode(newLat, newLng);
    if (addr) setAddress(addr);
  };

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const calcDistance = useCallback(() => {
    if (!selectedPharmacy) return;
    const R = 6371;
    const dLat = (selectedPharmacy.lat - lat) * Math.PI / 180;
    const dLng = (selectedPharmacy.lng - lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(selectedPharmacy.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistance(Math.round(dist * 100) / 100);
    setPrice(Math.round(Math.max(3, 2 + dist * 0.5) * 100) / 100);
  }, [selectedPharmacy, lat, lng]);

  useEffect(() => { calcDistance(); }, [calcDistance]);

  const handleSubmit = async () => {
    if (!file || !selectedPharmacy) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('prescription', file);
      formData.append('pharmacyId', selectedPharmacy.id);
      formData.append('clientAddress', address);
      formData.append('clientLat', lat.toString());
      formData.append('clientLng', lng.toString());
      if (notes) formData.append('notes', notes);

      const res = await fetch('/api/orders', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      const payRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.order.id }),
      });
      const payData = await payRes.json();

      if (payData.url) {
        window.location.href = payData.url;
      } else {
        window.location.href = `/client/track/${data.order.id}`;
      }
    } catch {
      setError('Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Ordonnance', icon: <FileText className="h-4 w-4" /> },
    { num: 2, label: 'Pharmacie', icon: <MapPin className="h-4 w-4" /> },
    { num: 3, label: 'Paiement', icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-900">Nouvelle commande</h1>

      {/* Progress */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 w-full justify-center ${
              step > s.num ? 'bg-primary-500 text-white' :
              step === s.num ? 'bg-primary-50 text-primary-700 border border-primary-200' :
              'bg-dark-50 text-dark-400'
            }`}>
              {step > s.num ? <Check className="h-4 w-4" /> : s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-6 h-0.5 mx-1 ${step > s.num ? 'bg-primary-500' : 'bg-dark-200'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100">{error}</div>}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card space-y-6">
          <div>
            <h2 className="text-lg font-bold text-dark-900">Votre ordonnance</h2>
            <div className="flex items-center gap-1.5 text-xs text-primary-600 mt-1">
              <Shield className="h-3.5 w-3.5" /> Chiffrée en AES-256 - Seul le pharmacien pourra la voir
            </div>
          </div>

          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              preview ? 'border-primary-300 bg-primary-50/30' : 'border-dark-200 hover:border-primary-400 hover:bg-primary-50/20'
            }`}
          >
            {preview ? (
              <div>
                <img src={preview} alt="Ordonnance" className="max-h-52 mx-auto rounded-xl shadow-sm mb-4" />
                <p className="text-sm text-primary-600 font-semibold flex items-center justify-center gap-1.5">
                  <Check className="h-4 w-4" /> Ordonnance ajoutée
                </p>
                <button onClick={() => { setFile(null); setPreview(null); }} className="text-xs text-dark-400 mt-2 hover:text-dark-600">
                  Changer de fichier
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-dark-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-dark-300" />
                </div>
                <p className="text-dark-600 font-medium mb-1">Glissez votre ordonnance ici</p>
                <p className="text-dark-400 text-sm mb-4">ou</p>
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm !py-2.5 !px-5">
                  <Camera className="h-4 w-4" /> Prendre une photo / Choisir un fichier
                  <input type="file" accept="image/*,.pdf" capture="environment" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="label">Notes pour le pharmacien (optionnel)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input min-h-[80px]" placeholder="Ex: dosage spécifique, allergies..." />
          </div>

          <button disabled={!file} onClick={() => setStep(2)}
            className="btn-primary w-full flex items-center justify-center gap-2">
            Continuer <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Step 2: Pharmacy */}
      {step === 2 && (
        <div className="card space-y-6">
          <h2 className="text-lg font-bold text-dark-900">Choisissez votre pharmacie</h2>

          <div>
            <label className="label">Adresse de livraison</label>
            <div className="relative" ref={suggestionsRef}>
              <Search className="absolute left-4 top-4 h-5 w-5 text-dark-400" />
              <input
                type="text"
                value={address}
                onChange={e => handleAddressChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="input pl-12 pr-24"
                placeholder="Tapez votre adresse..."
              />
              <button
                type="button"
                onClick={handleLocate}
                disabled={locating}
                className="absolute right-2 top-2 flex items-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
              >
                {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Locate className="h-3.5 w-3.5" />}
                {locating ? 'GPS...' : 'Localiser'}
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-dark-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-primary-50 transition-colors flex items-start gap-3 border-b border-dark-50 last:border-0"
                    >
                      <MapPin className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                      <span className="text-dark-700 line-clamp-2">{s.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {address && (
              <p className="text-xs text-primary-600 mt-1.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {address.length > 80 ? address.slice(0, 80) + '...' : address}
              </p>
            )}
          </div>

          <Map
            center={[lat, lng]}
            className="h-48"
            markers={[
              { lat, lng, label: 'Vous', color: 'blue' },
              ...pharmacies.map(p => ({ lat: p.lat || 0, lng: p.lng || 0, label: p.pharmacyName || '', color: 'green' })),
            ]}
            onMapClick={handleMapClick}
          />

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {pharmacies.length === 0 ? (
              <p className="text-dark-400 text-sm text-center py-6">Aucune pharmacie disponible</p>
            ) : pharmacies.map(p => (
              <button key={p.id} onClick={() => setSelectedPharmacy(p)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  selectedPharmacy?.id === p.id
                    ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                    : 'border-dark-100 hover:border-dark-200'
                }`}>
                <p className="font-semibold text-dark-900">{p.pharmacyName}</p>
                <p className="text-sm text-dark-500">{p.address}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <ChevronLeft className="h-5 w-5" /> Retour
            </button>
            <button disabled={!selectedPharmacy || !address} onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Continuer <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="card space-y-6">
          <h2 className="text-lg font-bold text-dark-900">Récapitulatif</h2>

          <div className="space-y-3 p-5 bg-dark-50/50 rounded-2xl">
            <div className="flex justify-between text-sm"><span className="text-dark-500">Pharmacie</span><span className="font-semibold text-dark-900">{selectedPharmacy?.pharmacyName}</span></div>
            <div className="flex justify-between text-sm"><span className="text-dark-500">Livraison</span><span className="font-medium text-dark-700 text-right max-w-[60%] truncate">{address}</span></div>
            <div className="flex justify-between text-sm"><span className="text-dark-500">Distance</span><span className="font-medium">{distance} km</span></div>
            <div className="flex justify-between text-sm"><span className="text-dark-500">Frais de base</span><span>2.00 &euro;</span></div>
            <div className="flex justify-between text-sm"><span className="text-dark-500">Frais distance ({distance} km &times; 0.50&euro;)</span><span>{distance ? (distance * 0.5).toFixed(2) : '0.00'} &euro;</span></div>
            <div className="border-t border-dark-200 pt-3 flex justify-between">
              <span className="text-lg font-bold text-dark-900">Total</span>
              <span className="text-lg font-bold text-primary-600">{price?.toFixed(2)} &euro;</span>
            </div>
          </div>

          <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-primary-800 text-sm">Ordonnance protégée</p>
                <p className="text-primary-600 text-xs mt-0.5">Chiffrée AES-256. Seul le pharmacien peut la consulter. Le livreur n&apos;y aura jamais accès.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <ChevronLeft className="h-5 w-5" /> Retour
            </button>
            <button disabled={loading} onClick={handleSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Traitement...</>
              ) : (
                <><CreditCard className="h-5 w-5" /> Payer {price?.toFixed(2)} &euro;</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
