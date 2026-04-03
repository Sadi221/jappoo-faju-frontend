import React, { useState, useEffect } from 'react';
import { Heart, Search, Filter, LogOut, User, TrendingUp, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { medicalRequestsAPI, donationsAPI, authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Charger l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'utilisateur:', err);
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  // Charger toutes les demandes ACTIVE
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await medicalRequestsAPI.getAll({ status: 'ACTIVE' });
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error('Erreur lors du chargement des demandes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Filtrer et rechercher
  useEffect(() => {
    let filtered = requests;

    // Filtre par urgence
    if (filterUrgency !== 'ALL') {
      filtered = filtered.filter(req => req.urgency_level === filterUrgency);
    }

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.patient_pseudonym.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.medical_need.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [searchTerm, filterUrgency, requests]);

  // Gérer la déconnexion
  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  // Gérer la donation
  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    try {
      setDonationLoading(true);
      await donationsAPI.create({
        medical_request_id: selectedRequest.id,
        amount: parseFloat(donationAmount),
        payment_method: 'WAVE', // Par défaut pour l'instant
      });
      
      setDonationSuccess(true);
      
      // Recharger les demandes après 2 secondes
      setTimeout(() => {
        setSelectedRequest(null);
        setDonationAmount('');
        setDonationSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la donation:', err);
      alert('Erreur lors de la donation. Veuillez réessayer.');
    } finally {
      setDonationLoading(false);
    }
  };

  // Calculer les jours restants
  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <Heart className="text-white" size={20} fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                JAPPOO FAJU
              </h1>
              <p className="text-xs text-slate-500">Dashboard Donateur</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-100 px-4 py-2 rounded-xl">
              <User size={20} className="text-slate-600" />
              <span className="font-semibold text-slate-700">{user?.full_name || 'Chargement...'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Déconnexion"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Barre de recherche et filtres */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par patient, type de besoin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtre urgence */}
            <div className="flex gap-2">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((urgency) => (
                <button
                  key={urgency}
                  onClick={() => setFilterUrgency(urgency)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    filterUrgency === urgency
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
                  }`}
                >
                  {urgency === 'ALL' ? 'Tous' : urgency === 'CRITICAL' ? 'Critique' : urgency === 'HIGH' ? 'Élevé' : urgency === 'MEDIUM' ? 'Moyen' : 'Faible'}
                </button>
              ))}
            </div>
          </div>

          {/* Compteur */}
          <div className="text-slate-600">
            <span className="font-bold text-blue-600">{filteredRequests.length}</span> demande(s) trouvée(s)
          </div>
        </div>

        {/* Liste des demandes */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="h-6 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded mb-4"></div>
                <div className="h-2 bg-slate-200 rounded mb-2"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="mx-auto mb-4 text-slate-400" size={64} />
            <p className="text-slate-600 text-lg">Aucune demande trouvée</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => {
              const daysLeft = getDaysLeft(request.expiry_date);
              const percentage = (request.amount_raised / request.amount_needed) * 100;

              return (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group border border-blue-100"
                >
                  {/* Barre de couleur selon urgence */}
                  <div className={`h-2 ${
                    request.urgency_level === 'CRITICAL' ? 'bg-red-500' :
                    request.urgency_level === 'HIGH' ? 'bg-orange-500' :
                    request.urgency_level === 'MEDIUM' ? 'bg-yellow-500' :
                    'bg-blue-400'
                  }`}></div>

                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        request.urgency_level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        request.urgency_level === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        request.urgency_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {request.urgency_level} {daysLeft !== null && `• ${daysLeft}J`}
                      </span>
                      <Heart className="text-slate-300 group-hover:text-red-500 transition-all cursor-pointer" size={20} />
                    </div>

                    {/* Infos */}
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{request.medical_need}</h3>
                      <p className="text-sm text-slate-500">{request.patient_pseudonym}</p>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{request.description}</p>
                    </div>

                    {/* Progression */}
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-blue-600">
                          {request.amount_raised.toLocaleString()} FCFA
                        </span>
                        <span className="text-slate-500">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Objectif: {request.amount_needed.toLocaleString()} FCFA
                      </p>
                    </div>

                    {/* Bouton */}
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform group-hover:scale-105"
                    >
                      Faire un don
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de donation */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white relative">
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-2">Faire un don</h2>
              <p className="text-blue-100">{selectedRequest.patient_pseudonym}</p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {donationSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Don réussi !</h3>
                  <p className="text-slate-600">Merci pour votre générosité ❤️</p>
                </div>
              ) : (
                <>
                  {/* Info demande */}
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-600 mb-1">Besoin médical</p>
                    <p className="font-bold text-slate-800">{selectedRequest.medical_need}</p>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Collecté</span>
                        <span className="font-semibold">{selectedRequest.amount_raised.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-600">Objectif</span>
                        <span className="font-semibold">{selectedRequest.amount_needed.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-600">Restant</span>
                        <span className="font-semibold text-blue-600">
                          {(selectedRequest.amount_needed - selectedRequest.amount_raised).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Montant de votre don (FCFA)
                    </label>
                    <input
                      type="number"
                      min="100"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                      placeholder="Ex: 5000"
                    />
                  </div>

                  {/* Suggestions */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1000, 5000, 10000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount.toString())}
                        className="py-2 px-4 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-semibold transition-all"
                      >
                        {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDonate}
                      disabled={donationLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                    >
                      {donationLoading ? 'Traitement...' : 'Confirmer'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
