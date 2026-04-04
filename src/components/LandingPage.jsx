import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Shield, Users, ChevronRight, ArrowRight, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { medicalRequestsAPI } from '../services/api';
import DonationModal from '../components/DonationModal';
import { MEDICAL_NEED_LABELS, URGENCY_LABELS, t } from '../utils/translations';

// Composant Logo JAPPOO FAJU
const JappooFajuLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" stroke="url(#mainGradient)" strokeWidth="3" fill="none" opacity="0.3" />
    <g opacity="0.9">
      <circle cx="30" cy="35" r="7" fill="url(#mainGradient)" />
      <path d="M 20 50 Q 30 45 40 50 L 40 65 Q 30 70 20 65 Z" fill="url(#mainGradient)" />
    </g>
    <g opacity="1">
      <circle cx="50" cy="30" r="8" fill="url(#accentGradient)" />
      <path d="M 38 48 Q 50 42 62 48 L 62 68 Q 50 74 38 68 Z" fill="url(#accentGradient)" />
    </g>
    <g opacity="0.9">
      <circle cx="70" cy="35" r="7" fill="url(#mainGradient)" />
      <path d="M 60 50 Q 70 45 80 50 L 80 65 Q 70 70 60 65 Z" fill="url(#mainGradient)" />
    </g>
    <g transform="translate(50, 55)">
      <path d="M 0 5 C -3 -2, -8 -4, -10 -2 C -12 0, -12 3, -10 6 L 0 15 L 10 6 C 12 3, 12 0, 10 -2 C 8 -4, 3 -2, 0 5 Z" fill="#EF4444" opacity="0.9" />
      <rect x="-1" y="2" width="2" height="6" fill="white" />
      <rect x="-3" y="4" width="6" height="2" fill="white" />
    </g>
    <path d="M 30 42 Q 40 50 50 48" stroke="url(#mainGradient)" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
    <path d="M 70 42 Q 60 50 50 48" stroke="url(#mainGradient)" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
    <circle cx="25" cy="20" r="2" fill="#10B981" opacity="0.6" />
    <circle cx="75" cy="20" r="2" fill="#10B981" opacity="0.6" />
    <circle cx="15" cy="50" r="2" fill="#06B6D4" opacity="0.6" />
    <circle cx="85" cy="50" r="2" fill="#06B6D4" opacity="0.6" />
  </svg>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [urgentCases, setUrgentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ FIX 1 — Charger les demandes ACTIVE sans renommer les champs
  useEffect(() => {
    const fetchUrgentCases = async () => {
      try {
        setLoading(true);
        const response = await medicalRequestsAPI.getAll({ status: 'ACTIVE', limit: 20 });

        // On conserve TOUS les champs originaux de l'API (dont l'UUID réel)
        // et on ajoute uniquement daysLeft calculé côté frontend
        const formattedCases = response.map(request => ({
          ...request,
          daysLeft: request.expiry_date
            ? Math.ceil((new Date(request.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
            : null
        }));

        setUrgentCases(formattedCases);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des demandes:', err);
        setError('Impossible de charger les demandes. Veuillez réessayer.');

        // ✅ FIX 1b — Fallback avec noms de champs originaux (id: null pour désactiver le bouton don)
        setUrgentCases([
          {
            id: null,
            patient_pseudonym: "Patient DK-2026-045",
            medical_need: "Dialyse rénale",
            description: "Patient en attente de dialyse rénale urgente.",
            amount_needed: 850000,
            amount_raised: 320000,
            urgency_level: "CRITICAL",
            hospital_id: "Hôpital Principal de Dakar",
            daysLeft: 3
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentCases();
  }, []);

  // Fonction pour ouvrir le modal de donation
  const handleDonateClick = (medicalRequest) => {
    setSelectedRequest(medicalRequest);
    setDonationModalOpen(true);
  };

  const stats = [
    { value: "15,000", label: "Vies à sauver", icon: Heart },
    { value: "100%", label: "Transparence", icon: Shield },
    { value: "50,000", label: "Donateurs visés", icon: Users }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "L'hôpital publie",
      description: "Un agent vérifié crée une demande avec documents médicaux",
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: "2",
      title: "Nous validons",
      description: "Notre équipe vérifie chaque demande avant publication",
      color: "from-purple-500 to-pink-500"
    },
    {
      step: "3",
      title: "Vous donnez",
      description: "Les fonds vont directement à l'hôpital ou à la pharmacie",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 font-['Inter'] overflow-hidden">
      {/* Header / Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-blue-100 z-50 transition-all duration-300"
           style={{ boxShadow: scrollY > 50 ? '0 10px 40px rgba(37, 99, 235, 0.1)' : 'none' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="transform hover:scale-110 transition-transform duration-300">
              <JappooFajuLogo size={48} />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                JAPPOO FAJU
              </h1>
              <p className="text-xs text-slate-500 -mt-1">Solidarité santé instantanée</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#comment" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Comment ça marche</a>
            <a href="#urgences" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Cas urgents</a>
            <a href="#impact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Notre impact</a>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/auth')} className="px-6 py-2.5 text-blue-600 font-semibold hover:bg-blue-50 rounded-xl transition-all">
              Connexion
            </button>
            <button onClick={() => navigate('/auth')} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:scale-105">
              Faire un don
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                <TrendingUp size={16} />
                <span>Lancement officiel - Rejoignez le mouvement</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Chaque don
                </span>
                <br />
                <span className="text-slate-800">sauve une vie</span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                JAPPOO FAJU connecte les hôpitaux sénégalais aux donateurs du monde entier.
                <span className="font-semibold text-slate-800"> 100% transparent.</span>
                <span className="font-semibold text-slate-800"> 0% de frais.</span>
                <span className="font-semibold text-slate-800"> Chaque franc compte.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/auth')} className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                  <Heart size={20} fill="white" />
                  <span>Faire un don maintenant</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>

                <button onClick={() => navigate('/auth')} className="px-8 py-4 bg-white border-2 border-blue-200 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center space-x-2">
                  <span>Je suis un hôpital</span>
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-blue-200">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="flex justify-center mb-2">
                      <stat.icon className="text-blue-600" size={24} />
                    </div>
                    <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Featured Urgent Case */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>

              <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold flex items-center space-x-2">
                    <Clock size={16} />
                    <span>CRITIQUE - 3 jours restants</span>
                  </span>
                  <Heart className="text-red-500 hover:scale-110 transition-transform cursor-pointer" size={24} />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Dialyse rénale urgente</h3>
                  <p className="text-slate-600">Patient DK-2026-045</p>
                  <p className="text-sm text-slate-500 mt-1">Hôpital Principal de Dakar</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">320,000 FCFA collectés</span>
                    <span className="font-bold text-blue-600">38%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000"
                         style={{ width: '38%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Objectif: 850,000 FCFA</span>
                    <span className="text-slate-500">530,000 FCFA restants</span>
                  </div>
                </div>

                {/* ✅ FIX 3 — Bouton hero card avec className et disabled si pas d'ID */}
                <button
                  onClick={() => {
                    if (urgentCases?.length > 0 && urgentCases[0].id) {
                      handleDonateClick(urgentCases[0]);
                    } else {
                      alert('Aucune demande médicale disponible pour le moment.');
                    }
                  }}
                  disabled={!urgentCases?.length || !urgentCases[0]?.id}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart size={20} fill="white" />
                  <span>Contribuer maintenant</span>
                </button>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white"></div>
                      ))}
                    </div>
                    <span className="text-slate-600 font-semibold">+127 donateurs</span>
                  </div>
                  <span className="text-blue-600 font-semibold">Vérifié ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Le Problème Section */}
      <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              La réalité des soins au Sénégal
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Des milliers de Sénégalais meurent chaque année faute de moyens pour se soigner.
              JAPPOO FAJU est né pour changer cela.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "60%", text: "des familles ne peuvent pas payer les soins d'urgence" },
              { number: "2,000+", text: "décès évitables chaque année par manque de financement" },
              { number: "500K FCFA", text: "coût moyen d'une intervention chirurgicale" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  {stat.number}
                </div>
                <p className="text-slate-300 text-lg">{stat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-800 mb-6">
              Comment fonctionne JAPPOO FAJU ?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Un système transparent et sécurisé qui garantit que chaque franc arrive à destination
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-red-200 -translate-y-1/2 z-0"></div>

            {howItWorks.map((item, i) => (
              <div key={i} className="relative z-10">
                <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 transform rotate-3`}>
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-12 text-white text-center">
            <div className="max-w-3xl mx-auto">
              <Shield className="mx-auto mb-6" size={48} />
              <h3 className="text-3xl font-black mb-4">100% Transparent, 0% de Frais</h3>
              <p className="text-xl text-blue-100 mb-8">
                Les fonds sont versés directement aux hôpitaux et pharmacies partenaires.
                Vous recevez une preuve de paiement vérifiée pour chaque don.
              </p>
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={24} />
                  <span className="font-semibold">Hôpitaux vérifiés</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={24} />
                  <span className="font-semibold">Reçus automatiques</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={24} />
                  <span className="font-semibold">Suivi en temps réel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cas Urgents */}
      <section id="urgences" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-800 mb-4">
                Cas urgents en ce moment
              </h2>
              <p className="text-xl text-slate-600">
                Ces patients ont besoin de votre aide aujourd'hui
              </p>
            </div>
            <a href="#urgences" className="px-6 py-3 bg-white border-2 border-blue-200 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all">
              Voir tous les cas →
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 animate-pulse">
                  <div className="h-2 bg-slate-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-6 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </div>
            ) : urgentCases.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-600 text-lg">Aucune demande urgente pour le moment.</p>
              </div>
            ) : (
              // ✅ FIX 2 — Utiliser les noms de champs originaux de l'API
              urgentCases.slice(0, 3).map((case_) => (
                <div key={case_.id ?? case_.patient_pseudonym} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 hover:shadow-2xl hover:-translate-y-1 transition-all group">
                  <div className={`h-2 ${case_.urgency_level === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`}></div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 ${case_.urgency_level === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} rounded-full text-xs font-bold`}>
                        {t(URGENCY_LABELS, case_.urgency_level)} • {case_.daysLeft ? `${case_.daysLeft}J restants` : 'En cours'}
                      </span>
                      <Heart className="text-slate-300 group-hover:text-red-500 group-hover:scale-110 transition-all cursor-pointer" size={20} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{t(MEDICAL_NEED_LABELS, case_.medical_need)}</h3>
                      <p className="text-sm text-slate-500">{case_.patient_pseudonym}</p>
                      <p className="text-xs text-slate-400 mt-1">{case_.hospital_id}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                          style={{ width: `${Math.min((case_.amount_raised / case_.amount_needed) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-blue-600">
                          {case_.amount_raised?.toLocaleString()} FCFA
                        </span>
                        <span className="text-slate-500">
                          sur {case_.amount_needed?.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/cas/${case_.id}`}
                        className="flex-1 py-3 text-center border-2 border-blue-200 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all text-sm"
                      >
                        Voir le détail
                      </Link>
                      <button
                        onClick={() => handleDonateClick(case_)}
                        disabled={!case_.id}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Contribuer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
               }}>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Heart className="mx-auto mb-8 text-white animate-pulse" size={64} fill="white" />
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Rejoignez le mouvement
          </h2>
          <p className="text-2xl text-blue-100 mb-12">
            Ensemble, nous pouvons sauver des milliers de vies
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-10 py-5 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105">
              Devenir donateur
            </button>
            <button className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all">
              Je suis un hôpital
            </button>
          </div>

          <p className="mt-8 text-blue-100 text-sm">
            Déjà membre ? <a href="#" className="underline font-semibold hover:text-white">Connectez-vous</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Heart size={20} fill="white" />
                </div>
                <span className="text-xl font-black">JAPPOO FAJU</span>
              </div>
              <p className="text-slate-400 text-sm">
                La plateforme de solidarité médicale qui sauve des vies au Sénégal.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Comment ça marche</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Faire un don</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cas urgents</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Devenir partenaire</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Transparence</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>contact@jappoofaju.sn</li>
                <li>+221 33 XXX XX XX</li>
                <li>Dakar, Sénégal</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <p>© 2026 JAPPOO FAJU. Tous droits réservés.</p>
            <p>Fait avec ❤️ pour le Sénégal</p>
          </div>
        </div>
      </footer>

      {/* Modal de donation */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        medicalRequest={selectedRequest}
      />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
