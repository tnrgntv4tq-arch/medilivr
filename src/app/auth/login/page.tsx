'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pill, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      const role = data.user.role.toLowerCase();
      window.location.href = `/${role}/dashboard`;
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Pill className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">MediLivr</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Vos médicaments livrés en toute sécurité
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed">
            Ordonnances chiffrées, suivi en temps réel, paiement sécurisé.
            La livraison de médicaments nouvelle génération.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-dark-50/30">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Medi<span className="text-primary-500">Livr</span></span>
          </div>

          <h1 className="text-3xl font-bold text-dark-900 mb-2">Bon retour</h1>
          <p className="text-dark-500 mb-8">Connectez-vous à votre espace MediLivr</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-dark-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input pl-12" placeholder="votre@email.com" required />
              </div>
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-dark-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input pl-12" placeholder="Votre mot de passe" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? 'Connexion...' : <><span>Se connecter</span><ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-8">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
