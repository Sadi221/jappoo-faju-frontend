import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <Heart className="text-white" size={18} fill="white" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              JAPPOO FAJU
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 md:p-12 space-y-8">

          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">Politique de confidentialité</h1>
            <p className="text-slate-500 text-sm">Version 1.0 — Dernière mise à jour : Mai 2026</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
            <strong>JAPPOO FAJU</strong> est une initiative de l'association <strong>Développement Solidaire et Santé (DSS)</strong>,
            association française loi 1901, engagée dans l'amélioration de l'accès aux soins en Afrique de l'Ouest.{' '}
            <a href="https://www.dss-france.org" target="_blank" rel="noopener noreferrer" className="underline font-semibold">www.dss-france.org</a>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">1. Responsable du traitement</h2>
            <p className="text-slate-600 leading-relaxed">
              Le responsable du traitement des données collectées via la plateforme JAPPOO FAJU est :
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Association :</strong> Développement Solidaire &amp; Santé (DSS)</li>
              <li><strong>Représentant légal :</strong> Cheikh Mbaye</li>
              <li><strong>Adresse :</strong> SC MBAYE, 8 rue du Cirque, 75008 Paris, France</li>
              <li><strong>Email :</strong> <a href="mailto:cmbaye@dss-france.org" className="text-blue-600 hover:underline">cmbaye@dss-france.org</a></li>
              <li><strong>Site :</strong> <a href="https://jappoo-faju.org" className="text-blue-600 hover:underline">jappoo-faju.org</a></li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              DSS est soumise au <strong>Règlement Général sur la Protection des Données (RGPD — UE 2016/679)</strong> et,
              pour ses activités au Sénégal, à la <strong>loi n° 2008-12 du 25 janvier 2008</strong> sur la protection
              des données à caractère personnel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">2. Données collectées</h2>
            <p className="text-slate-600 leading-relaxed">Dans le cadre de l'utilisation de la plateforme JAPPOO FAJU, nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Donateurs :</strong> nom, prénom, adresse e-mail, numéro de téléphone, données de paiement (traitées par Stripe ou Wave), historique des dons</li>
              <li><strong>Agents hospitaliers :</strong> nom, prénom, email professionnel, téléphone professionnel, hôpital d'appartenance</li>
              <li><strong>Patients :</strong> pseudonyme uniquemen