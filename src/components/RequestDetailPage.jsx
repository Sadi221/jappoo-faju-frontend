import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ArrowLeft, AlertTriangle, Calendar, Building2, Share2, CheckCircle } from 'lucide-react';
import { medicalRequestsAPI } from '../services/api';
import DonationModal from './DonationModal';

const URGENCY_LABELS = { CRITICAL: 'Critique', HIGH: 'Élevé', MEDIUM: 'Moyen', LOW: 'Faible' };
const NEED_LABELS = { SURGERY: 'Chirurgie', MEDICATION: 'Médicaments', EXAM: 'Examens médicaux', KIT: 'Kit médical' };

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await medicalRequestsAPI.getById(id);
        setRequest(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center gap-4">
      <p className="text-2xl font-bold text-slate-700">Demande introuvable</p>
      <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
        Retour à l'accueil
      </Link>
    </div>
  );

  const percentage = Math.min((request.amount_raised / request.amount_needed) * 100, 100);
  const daysLeft = request.expiry_date
    ? Math.max(0, Math.ceil((new Date(request.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  const canDonate = request.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
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
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Bandeau urgence */}
        <div className={`h-2 rounded-full ${
          request.urgency_level === 'CRITICAL' ? 'bg-red-500' :
          request.urgency_level === 'HIGH' ? 'bg-orange-500' :
          request.urgency_level === 'MEDIUM' ? 'bg-yellow-400' : 'bg-blue-400'
        }`}></div>

        {/* Titre + partage */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className={
                request.urgency_level === 'CRITICAL' ? 'text-red-600' :
                request.urgency_level === 'HIGH' ? 'text-orange-500' :
                request.urgency_level === 'MEDIUM' ? 'text-yellow-500' : 'text-blue-500'
              } />
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                request.urgency_level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                request.urgency_level === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                request.urgency_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>
                Urgence {URGENCY_LABELS[request.urgency_level] || request.urgency_level}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-800">
              {NEED_LABELS[request.medical_need] || request.medical_need}
            </h1>
            <p className="text-slate-500 mt-1">Patient : {request.patient_pseudonym}</p>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 rounded-xl font-medium text-sm transition-all whitespace-nowrap"
          >
            {copied ? <CheckCircle size={16} className="text-green-500" /> : <Share2 size={16} />}
            {copied ? 'Copié !' : 'Partager'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Colonne principale */}
          <div className="md:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Description de la situation</h2>
              <p className="text-slate-600 leading-relaxed">{request.description}</p>
            </div>

            {/* Infos */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Type de besoin</p>
                <p className="font-semibold text-slate-800">{NEED_LABELS[request.medical_need] || request.medical_need}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Niveau d'urgence</p>
                <p className="font-semibold text-slate-800">{URGENCY_LABELS[request.urgency_level] || request.urgency_level}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Date de création</p>
                <p className="font-semibold text-slate-800">
                  {new Date(request.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {daysLeft !== null && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Jours restants</p>
                  <p className={`font-semibold ${daysLeft <= 3 ? 'text-red-600' : 'text-slate-800'}`}>
                    {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : 'Expiré'}
                  </p>
                </div>
              )}
            </div>

            {/* Document de preuve */}
            {request.proof_document_url && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                <h2 className="text-lg font-bold text-slate-800 mb-3">Document médical</h2>
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL || 'https://jappoo-faju-backend-production-b1f1.up.railway.app'}${request.proof_document_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 font-medium text-sm transition-all"
                >
                  Voir le document justificatif →
                </a>
              </div>
            )}
          </div>

          {/* Colonne don */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 sticky top-24">
              {/* Progression */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-blue-600 text-xl">
                    {Number(request.amount_raised).toLocaleString()} FCFA
                  </span>
                  <span className="text-slate-500 font-medium">{Math.round(percentage)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">
                  Objectif : {Number(request.amount_needed).toLocaleString()} FCFA
                </p>
              </div>

              {/* Statut */}
              {!canDonate && (
                <div className={`mb-4 px-3 py-2 rounded-xl text-sm font-semibold text-center ${
                  request.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  request.status === 'EXPIRED' ? 'bg-slate-100 text-slate-500' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {request.status === 'COMPLETED' ? 'Objectif atteint !' :
                   request.status === 'EXPIRED' ? 'Collecte terminée' :
                   'En cours de validation'}
                </div>
              )}

              {/* Bouton don */}
              <button
                onClick={() => setShowDonation(true)}
                disabled={!canDonate}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg"
              >
                {canDonate ? 'Contribuer maintenant' : 'Collecte fermée'}
              </button>

              {canDonate && (
                <p className="text-xs text-slate-400 text-center mt-3">
                  Paiement sécurisé via Wave
                </p>
              )}

              {/* Partage */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center mb-2">Partagez ce lien pour aider</p>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 rounded-xl text-sm font-medium transition-all"
                >
                  <Share2 size={14} />
                  {copied ? 'Lien copié !' : 'Copier le lien'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal donation */}
      {showDonation && (
        <DonationModal
          request={request}
          onClose={() => setShowDonation(false)}
        />
      )}
    </div>
  );
};

export default RequestDetailPage;
