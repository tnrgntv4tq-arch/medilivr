'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pill, Send, Mail, MapPin, Clock, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de l\'envoi');
        return;
      }
      setSent(true);
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50/30">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-dark-900">Medi<span className="text-primary-500">Livr</span></span>
          </Link>
          <Link href="/" className="btn-ghost text-sm flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-3">Contactez-nous</h1>
            <p className="text-dark-500 text-lg max-w-xl mx-auto">
              Une question, une suggestion ou besoin d&apos;aide ? Notre équipe vous répond rapidement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl border border-dark-100/60 p-6 text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Mail className="h-5 w-5 text-primary-500" />
              </div>
              <h3 className="font-semibold text-dark-900 mb-1">Email</h3>
              <p className="text-sm text-dark-500">contact@medilivr.fr</p>
            </div>
            <div className="bg-white rounded-2xl border border-dark-100/60 p-6 text-center">
              <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-5 w-5 text-accent-500" />
              </div>
              <h3 className="font-semibold text-dark-900 mb-1">Adresse</h3>
              <p className="text-sm text-dark-500">Paris, France</p>
            </div>
            <div className="bg-white rounded-2xl border border-dark-100/60 p-6 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-dark-900 mb-1">Réponse</h3>
              <p className="text-sm text-dark-500">Sous 24 heures</p>
            </div>
          </div>

          {sent ? (
            <div className="bg-white rounded-2xl border border-dark-100/60 p-12 text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-dark-900 mb-2">Message envoyé !</h2>
              <p className="text-dark-500 mb-6">Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.</p>
              <Link href="/" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-dark-100/60 p-6 sm:p-8 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-dark-50/50 rounded-xl border border-dark-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-dark-50/50 rounded-xl border border-dark-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                    placeholder="jean@exemple.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Sujet</label>
                <select
                  required
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-dark-50/50 rounded-xl border border-dark-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                >
                  <option value="">Choisir un sujet...</option>
                  <option value="Question générale">Question générale</option>
                  <option value="Problème de commande">Problème de commande</option>
                  <option value="Devenir partenaire">Devenir partenaire (pharmacie/livreur)</option>
                  <option value="Problème technique">Problème technique</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-dark-50/50 rounded-xl border border-dark-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
                  placeholder="Décrivez votre demande..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi en cours...</>
                ) : (
                  <><Send className="h-5 w-5" /> Envoyer le message</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
