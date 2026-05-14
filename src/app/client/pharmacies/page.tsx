'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Star, Phone, Navigation, SlidersHorizontal, X, Building2, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Pharmacy {
  id: string;
  pharmacyName: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  avgRating: number | null;
  reviewCount: number;
  distance: number | null;
}

type SortOption = 'distance' | 'rating' | 'name';

export default function PharmaciesPage() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (locating) return;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (minRating > 0) params.set('minRating', minRating.toString());
    params.set('sortBy', sortBy);
    if (userLat !== null && userLng !== null) {
      params.set('lat', userLat.toString());
      params.set('lng', userLng.toString());
    }
    setLoading(true);
    fetch(`/api/pharmacies?${params}`)
      .then(r => r.json())
      .then(d => setPharmacies(d.pharmacies || []))
      .finally(() => setLoading(false));
  }, [search, sortBy, minRating, userLat, userLng, locating]);

  const handleSearch = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(value), 300);
  };

  const mapCenter: [number, number] = userLat !== null && userLng !== null
    ? [userLat, userLng]
    : [48.8566, 2.3522];

  const mapMarkers = [
    ...(userLat !== null && userLng !== null
      ? [{ lat: userLat, lng: userLng, label: 'Vous', color: 'blue' }]
      : []),
    ...pharmacies.map(p => ({
      lat: p.lat || 0,
      lng: p.lng || 0,
      label: p.pharmacyName || '',
      color: selectedId === p.id ? 'red' : 'green',
    })),
  ];

  const activeFilters = (minRating > 0 ? 1 : 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Pharmacies</h1>
        <p className="text-dark-400 text-sm mt-0.5">Trouvez la pharmacie idéale près de chez vous</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-dark-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou adresse..."
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-dark-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showFilters || activeFilters > 0
              ? 'bg-primary-500 text-white'
              : 'bg-white text-dark-500 border border-dark-100 hover:border-dark-200'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtres</span>
          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-dark-100/60 p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-dark-900 text-sm">Filtres & tri</h3>
            {activeFilters > 0 && (
              <button
                onClick={() => { setMinRating(0); }}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Réinitialiser
              </button>
            )}
          </div>

          {/* Sort */}
          <div>
            <p className="text-xs font-medium text-dark-400 uppercase tracking-wide mb-2">Trier par</p>
            <div className="flex gap-2 flex-wrap">
              {([
                { key: 'distance', label: 'Distance', icon: <Navigation className="h-3.5 w-3.5" /> },
                { key: 'rating', label: 'Note', icon: <Star className="h-3.5 w-3.5" /> },
                { key: 'name', label: 'Nom', icon: <Building2 className="h-3.5 w-3.5" /> },
              ] as { key: SortOption; label: string; icon: React.ReactNode }[]).map(s => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    sortBy === s.key
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-50 text-dark-500 hover:bg-dark-100'
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Min rating */}
          <div>
            <p className="text-xs font-medium text-dark-400 uppercase tracking-wide mb-2">Note minimum</p>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    minRating === r
                      ? 'bg-amber-500 text-white'
                      : 'bg-dark-50 text-dark-500 hover:bg-dark-100'
                  }`}
                >
                  {r === 0 ? 'Toutes' : <><Star className="h-3 w-3 fill-current" /> {r}+</>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-dark-100/60">
        <Map center={mapCenter} className="h-52" markers={mapMarkers} />
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-dark-400">
          {loading ? 'Chargement...' : `${pharmacies.length} pharmacie${pharmacies.length !== 1 ? 's' : ''} trouvée${pharmacies.length !== 1 ? 's' : ''}`}
        </p>
        {sortBy === 'distance' && userLat === null && (
          <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">GPS non disponible</p>
        )}
      </div>

      {loading || locating ? (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-dark-400">{locating ? 'Localisation en cours...' : 'Recherche...'}</p>
        </div>
      ) : pharmacies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dark-100/60 text-center py-16">
          <Building2 className="h-8 w-8 text-dark-300 mx-auto mb-2" />
          <p className="text-dark-400 text-sm">Aucune pharmacie trouvée</p>
          {(search || minRating > 0) && (
            <button
              onClick={() => { setSearch(''); setMinRating(0); }}
              className="text-primary-500 text-sm mt-2 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div ref={listRef} className="space-y-3">
          {pharmacies.map(p => (
            <div
              key={p.id}
              onMouseEnter={() => setSelectedId(p.id)}
              onMouseLeave={() => setSelectedId(null)}
              className={`bg-white rounded-2xl border p-5 transition-all duration-200 ${
                selectedId === p.id
                  ? 'border-primary-300 shadow-md shadow-primary-100/50'
                  : 'border-dark-100/60 hover:border-dark-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-dark-900">{p.pharmacyName}</h3>
                    <p className="text-xs text-dark-400 mt-0.5 flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" /> {p.address}
                    </p>
                  </div>
                </div>
                {p.distance !== null && (
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                    {p.distance < 1 ? `${Math.round(p.distance * 1000)} m` : `${p.distance} km`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {p.avgRating !== null ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.avgRating} ({p.reviewCount} avis)
                  </span>
                ) : (
                  <span className="text-xs text-dark-400">Pas encore d&apos;avis</span>
                )}
                <a
                  href={`tel:${p.phone}`}
                  className="flex items-center gap-1 text-xs text-dark-500 hover:text-primary-500 transition-colors"
                >
                  <Phone className="h-3 w-3" /> {p.phone}
                </a>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => router.push(`/client/new-order?pharmacyId=${p.id}`)}
                  className="flex-1 btn-primary !py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  Commander ici
                </button>
                {p.lat && p.lng && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary !py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    <span className="hidden sm:inline">Itinéraire</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
