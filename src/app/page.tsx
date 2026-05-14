'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Pill, Shield, MapPin, Clock, Truck, CreditCard,
  ChevronDown, ChevronUp, MessageCircle, FileText,
  ShoppingBag, Navigation, Lock, Euro, Search, Users,
} from 'lucide-react';

const FAQ_ITEMS = [
  { q: 'Comment fonctionne MediLivr ?', a: "Uploadez votre ordonnance, choisissez une pharmacie proche, payez en ligne et recevez vos médicaments chez vous. C'est simple et sécurisé." },
  { q: 'Mes données de santé sont-elles protégées ?', a: 'Oui, vos ordonnances sont chiffrées en AES-256. Seul le pharmacien peut les consulter. Le livreur ne voit jamais votre ordonnance, uniquement l\'adresse de livraison.' },
  { q: 'Comment est calculé le prix de la livraison ?', a: 'Le prix est basé sur la distance entre la pharmacie et votre adresse : un frais de base de 2€ + 0.50€ par kilomètre, avec un minimum de 3€.' },
  { q: 'Quels moyens de paiement sont acceptés ?', a: 'Nous acceptons les cartes bancaires (Visa, Mastercard) via notre partenaire de paiement sécurisé Stripe.' },
  { q: 'Puis-je suivre ma livraison en temps réel ?', a: 'Oui ! Une fois votre commande récupérée par le livreur, vous pouvez suivre sa position en temps réel sur la carte.' },
  { q: 'Comment devenir livreur MediLivr ?', a: "Inscrivez-vous en tant que livreur sur l'application. Une fois votre profil validé, vous pourrez accepter des missions de livraison et gagner de l'argent à votre rythme." },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-dark-900">Medi<span className="text-primary-500">Livr</span></span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/contact" className="btn-ghost text-sm">Contact</Link>
            <Link href="/auth/register?role=PHARMACY" className="btn-ghost text-sm flex items-center gap-1.5">
              <Search className="h-4 w-4" /> Vous êtes pharmacien ?
            </Link>
            <Link href="/auth/login" className="btn-ghost text-sm">Connexion</Link>
            <Link href="/auth/register" className="btn-primary !py-2.5 !px-5 text-sm">Commencer</Link>
          </div>
          <div className="md:hidden flex gap-2">
            <Link href="/auth/login" className="btn-ghost text-sm !px-3">Connexion</Link>
            <Link href="/auth/register" className="btn-primary !py-2 !px-4 text-sm">Inscription</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50/30" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-200/15 rounded-full blur-[80px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Shield className="h-4 w-4" />
              Données de santé chiffrées et sécurisées
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-dark-900 leading-[1.1] tracking-tight mb-6 animate-slide-up">
              Vos médicaments livrés à domicile{' '}
              <span className="gradient-text">7j/7 et 24h/24</span>
            </h1>

            <p className="text-lg md:text-xl text-dark-500 mb-10 max-w-2xl mx-auto animate-slide-up leading-relaxed">
              Envoyez votre ordonnance en toute confidentialité, choisissez votre pharmacie
              et recevez vos médicaments directement chez vous.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link href="/auth/register" className="btn-primary text-base !px-8 !py-4 flex items-center justify-center gap-2">
                <Pill className="h-5 w-5" /> Commander maintenant
              </Link>
              <Link href="#how-it-works" className="btn-secondary text-base !px-8 !py-4 flex items-center justify-center gap-2">
                Découvrir le service
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-12 text-sm text-dark-400">
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary-500" /> Chiffrement AES-256</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary-500" /> Livraison rapide</div>
              <div className="flex items-center gap-2"><Euro className="h-4 w-4 text-primary-500" /> Tarifs transparents</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-dark-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Comment ça marche ?</h2>
            <p className="section-subtitle">Recevez vos médicaments en 4 étapes simples</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: <Search className="h-7 w-7" />,
                step: '01',
                title: 'Choisissez la pharmacie',
                desc: 'Découvrez les pharmacies autour de vous grâce à la géolocalisation.',
                color: 'bg-primary-500',
              },
              {
                icon: <FileText className="h-7 w-7" />,
                step: '02',
                title: 'Envoyez votre ordonnance',
                desc: 'Photographiez ou uploadez votre ordonnance. Elle est chiffrée instantanément.',
                color: 'bg-accent-500',
              },
              {
                icon: <CreditCard className="h-7 w-7" />,
                step: '03',
                title: 'Payez en ligne',
                desc: 'Paiement sécurisé par carte. Le tarif est calculé selon la distance.',
                color: 'bg-primary-500',
              },
              {
                icon: <Navigation className="h-7 w-7" />,
                step: '04',
                title: 'Suivez la livraison',
                desc: 'Suivez votre livreur en temps réel. Il ne voit jamais votre ordonnance.',
                color: 'bg-accent-500',
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="card-hover text-center h-full">
                  <div className="text-xs font-bold text-dark-300 mb-4">{item.step}</div>
                  <div className={`w-14 h-14 ${item.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg text-dark-900 mb-2">{item.title}</h3>
                  <p className="text-dark-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Key Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Pourquoi choisir MediLivr ?</h2>
            <p className="section-subtitle">Une solution pensée pour votre santé et votre tranquillité</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: <Shield className="h-6 w-6" />, title: 'Données de santé sécurisées', desc: 'Vos ordonnances sont chiffrées en AES-256. Conformité RGPD et normes de santé.', accent: 'primary' },
              { icon: <MessageCircle className="h-6 w-6" />, title: 'Contact avec le pharmacien', desc: 'Le pharmacien reçoit votre ordonnance et peut vous contacter si besoin.', accent: 'accent' },
              { icon: <FileText className="h-6 w-6" />, title: 'Commande avec ordonnance', desc: 'Prenez en photo ou uploadez votre ordonnance directement depuis votre téléphone.', accent: 'primary' },
              { icon: <ShoppingBag className="h-6 w-6" />, title: 'Livraison à domicile', desc: "Recevez vos médicaments sans vous déplacer, idéal pour les personnes à mobilité réduite.", accent: 'accent' },
              { icon: <Clock className="h-6 w-6" />, title: 'Disponible 7j/7', desc: 'Commandez à tout moment. Les pharmacies de garde sont également disponibles.', accent: 'primary' },
              { icon: <Euro className="h-6 w-6" />, title: 'Tarifs transparents', desc: 'Prix calculé selon la distance. Pas de frais cachés. À partir de 3€.', accent: 'accent' },
            ].map((feature) => (
              <div key={feature.title} className="card-hover group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${
                  feature.accent === 'primary'
                    ? 'bg-primary-50 text-primary-500 group-hover:bg-primary-500 group-hover:text-white'
                    : 'bg-accent-50 text-accent-500 group-hover:bg-accent-500 group-hover:text-white'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-dark-900 mb-2">{feature.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section className="py-16 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-4">Votre vie privée est notre priorité</h2>
              <p className="text-dark-300 leading-relaxed mb-6">
                Votre ordonnance est chiffrée dès l&apos;envoi avec un algorithme de niveau militaire (AES-256-GCM).
                Seul votre pharmacien peut la déchiffrer. Le livreur ne transporte qu&apos;un colis scellé et ne voit
                que l&apos;adresse de livraison. Aucun accès aux données médicales.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-primary-400 text-sm"><Lock className="h-4 w-4" /> Chiffrement bout-en-bout</div>
                <div className="flex items-center gap-2 text-primary-400 text-sm"><Shield className="h-4 w-4" /> Conforme RGPD</div>
                <div className="flex items-center gap-2 text-primary-400 text-sm"><Users className="h-4 w-4" /> Accès restreint</div>
              </div>
            </div>
            <div className="w-48 h-48 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-3xl flex items-center justify-center">
              <Shield className="h-20 w-20 text-primary-400 animate-float" />
            </div>
          </div>
        </div>
      </section>

      {/* Become a Delivery Driver */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-accent-50 via-white to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="w-40 h-40 bg-accent-500 rounded-3xl flex items-center justify-center flex-shrink-0">
              <Truck className="h-16 w-16 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="section-title mb-4">Devenez livreur MediLivr</h2>
              <p className="text-dark-500 text-lg mb-6 leading-relaxed">
                Rejoignez notre équipe et gagnez de l&apos;argent à votre rythme en livrant des médicaments.
                Contribuez à un service essentiel pour les personnes vulnérables.
              </p>
              <Link href="/auth/register?role=DELIVERY" className="btn-accent inline-flex items-center gap-2">
                <Truck className="h-5 w-5" /> Rejoindre l&apos;équipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pharmacy CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row-reverse items-center gap-10">
            <div className="w-40 h-40 bg-primary-500 rounded-3xl flex items-center justify-center flex-shrink-0">
              <MapPin className="h-16 w-16 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="section-title mb-4">Vous êtes pharmacien ?</h2>
              <p className="text-dark-500 text-lg mb-6 leading-relaxed">
                Développez votre activité en proposant la livraison à domicile.
                Recevez les ordonnances de manière sécurisée et gérez vos commandes facilement.
              </p>
              <Link href="/auth/register?role=PHARMACY" className="btn-primary inline-flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Inscrire ma pharmacie
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-dark-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Questions fréquentes</h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-dark-100/60 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-dark-50/50 transition-colors"
                >
                  <span className="font-semibold text-dark-900 pr-4">{item.q}</span>
                  {openFaq === i ? <ChevronUp className="h-5 w-5 text-primary-500 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-dark-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-dark-500 leading-relaxed animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à vous faire livrer vos médicaments ?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Inscrivez-vous gratuitement et passez votre première commande en quelques minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-primary-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Créer mon compte
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 text-dark-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Pill className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">MediLivr</span>
              </div>
              <p className="text-sm leading-relaxed">Livraison sécurisée de médicaments à domicile. Vos données de santé sont notre priorité.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Service</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/register" className="hover:text-primary-400 transition-colors">Commander</Link></li>
                <li><Link href="/auth/register?role=PHARMACY" className="hover:text-primary-400 transition-colors">Espace pharmacie</Link></li>
                <li><Link href="/auth/register?role=DELIVERY" className="hover:text-primary-400 transition-colors">Devenir livreur</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">CGU-V</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Politique de confidentialité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Nous contacter</Link></li>
                <li>contact@medilivr.fr</li>
                <li>Paris, France</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-800 pt-6 text-center text-sm">
            <p>&copy; 2026 MediLivr. Tous droits réservés. Données de santé protégées conformément au RGPD.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
