'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Pill, User, Mail, Lock, Phone, MapPin, Building2, Truck, ArrowRight, Locate } from 'lucide-react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'CLIENT';

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: defaultRole,
    address: '', lat: 48.8566, lng: 2.3522,
    pharmacyName: '', pharmacyLicense: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const router = useRouter();

  const update = (field: string, value: string | number) => setForm(f => ({ ...f, [field]: value }));

  const geolocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { update('lat', pos.coords.latitude); update('lng', pos.coords.longitude); setLocating(false); },
      () => setLocating(false)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      window.location.href = `/${data.user.role.toLowerCase()}/dashboard`;
    } catch {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'CLIENT', label: 'Patient', icon: <User className="h-5 w-5" />, desc: 'Me faire livrer', color: 'primary' },
    { value: 'PHARMACY', label: 'Pharmacie', icon: <Building2 className="h-5 w-5" />, desc: 'Gérer les commandes', color: 'primary' },
    { value: 'DELIVERY', label: 'Livreur', icon: <Truck className="h-5 w-5" />, desc: 'Livrer les médicaments', color: 'accent' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-0 w-60 h-60 bg-accent-500/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative flex flex-col justify-center p-12 text-white">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold">MediLivr</span>
          </Link>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Rejoignez MediLivr
          </h2>
          <p className="text-dark-400 text-lg leading-relaxed mb-8">
            Que vous soyez patient, pharmacien ou livreur, créez votre compte et accédez à la livraison de médicaments sécurisée.
          </p>
          <div className="space-y-4 text-sm">
            {[
              'Ordonnances chiffrées AES-256',
              'Paiement sécurisé par Stripe',
              'Suivi GPS en temps réel',
            ].map(t => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-400" />
                </div>
                <span className="text-dark-300">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Medi<span className="text-primary-500">Livr</span></span>
          </div>

          <h1 className="text-3xl font-bold text-dark-900 mb-2">Créer un compte</h1>
          <p className="text-dark-500 mb-6">Commencez à utiliser MediLivr en quelques minutes</p>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="label">Je suis</label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => update('role', r.value)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all duration-200 ${
                      form.role === r.value
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-dark-100 hover:border-dark-200'
                    }`}>
                    <div className={`mx-auto mb-1.5 ${form.role === r.value ? 'text-primary-500' : 'text-dark-400'}`}>{r.icon}</div>
                    <div className="text-xs font-bold text-dark-900">{r.label}</div>
                    <div className="text-[10px] text-dark-400 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-dark-400" />
                  <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="input pl-12" placeholder="Jean Dupont" required />
                </div>
              </div>
              <div>
                <label className="label">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-4 h-5 w-5 text-dark-400" />
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="input pl-12" placeholder="06 12 34 56 78" required />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-dark-400" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input pl-12" placeholder="votre@email.com" required />
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-dark-400" />
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="input pl-12" placeholder="Minimum 6 caractères" minLength={6} required />
              </div>
            </div>

            <div>
              <label className="label">Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-5 w-5 text-dark-400" />
                <input type="text" value={form.address} onChange={e => update('address', e.target.value)} className="input pl-12 pr-24" placeholder="Votre adresse" />
                <button type="button" onClick={geolocate} disabled={locating}
                  className="absolute right-2 top-2 flex items-center gap-1 px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                  <Locate className={`h-3.5 w-3.5 ${locating ? 'animate-spin' : ''}`} />
                  {locating ? '...' : 'Localiser'}
                </button>
              </div>
            </div>

            {form.role === 'PHARMACY' && (
              <div className="space-y-4 p-5 bg-primary-50/50 rounded-2xl border border-primary-100">
                <p className="text-sm font-semibold text-primary-700">Informations pharmacie</p>
                <div>
                  <label className="label">Nom de la pharmacie</label>
                  <input type="text" value={form.pharmacyName} onChange={e => update('pharmacyName', e.target.value)} className="input" placeholder="Pharmacie du Centre" required />
                </div>
                <div>
                  <label className="label">N° de licence</label>
                  <input type="text" value={form.pharmacyLicense} onChange={e => update('pharmacyLicense', e.target.value)} className="input" placeholder="PH-XX-XXXXX" required />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-4">
              {loading ? 'Inscription...' : <><span>Créer mon compte</span><ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
