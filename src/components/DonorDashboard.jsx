import React, { useState, useEffect } from 'react';
import { Heart, Search, LogOut, User, AlertCircle, History, List, ExternalLink, Eye, EyeOff, Lock } from 'lucide-react';
import { medicalRequestsAPI, paymentsAPI, authAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import DonationModal from './DonationModal';
import { MEDICAL_NEED_LABELS, URGENCY_LABELS, DONATION_STATUS_LABELS, t } from '../utils/translations';

const URGENCY_COLORS = {
  CRITICAL: { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
  HIGH:     { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
  MEDIUM:   { bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  LOW:      { bar: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700' },
};

const DONATION_STATUS_CLS = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('cas');

  // Onglet cas actifs
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Onglet historique
  const [myDonations, setMyDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [donationsLoaded, setDonationsLoaded] = useState(false);

const [showPasswordModal, setShowPasswordModal] = useState(false);
const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
const [passwordLoading, setPasswordLoading] = useState(false);
const [passwordError, setPasswordError] = useState('');
const [passwordSuccess, setPasswordSuccess] = useState('');
const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);

const handleChangePassword = async (e) => {
  e.preventDefault();
  setPasswordError('');
  setPasswordSuccess('');
  if (passwordData.next !== passwordData.confirm) {
    setPasswordError('Les nouveaux mots de passe ne correspondent pas');
    return;
  }
  if (passwordData.next.length < 8) {
    setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères');
    return;
  }
  setPasswordLoading(true);
  try {
    await authAPI.changePassword(passwordData.current, passwordData.next);
    setPasswordSuccess('Mot de passe modifié avec succès !');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordData({ current: '', next: '', confirm: '' });
      setPasswordSuccess('');
    }, 2000);
  } catch (err) {
    setPasswordError(err.response?.data?.detail || 'Erreur lors du changement de mot de passe');
  } finally {
    setPasswordLoading(false);
  }
};

  // Charger l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch {
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  // Charger les demandes ACTIVE
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoadingRequests(true);
        const data = await medicalRequestsAPI.getAll({ status: 'ACTIVE' });
        setRequests(data);
        setFilteredRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
  }, []);

  // Charger les dons au premier clic sur l'onglet
  useEffect(() => {
    if (activeTab !== 'historique' || donationsLoaded) return;
    const fetchDonations = async () => {
      setLoadingDonations(true);
      try {
        const data = await paymentsAPI.getMyDonations();
        setMyDonations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDonations(false);
        setDonationsLoaded(true);
      }
    };
    fetchDonations();
  }, [activeTab, donationsLoaded]);

  // Filtres cas actifs
  useEffect(() => {
    let filtered = requests;
    if (filterUrgency !== 'ALL') filtered = filtered.filter(r => r.urgency_level === filterUrgency);
    if (searchTerm) filtered = filtered.filter(r =>
      r.patient_pseudonym.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.medical_need.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchTerm, filterUrgency, requests]);

  const handleLogout = () => { authAPI.logout(); navigate('/'); };

  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Stats dons
  const totalDonne = myDonations
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);

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
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">JAPPOO FAJU</h1>
              <p className="text-xs text-slate-500">Dashboard Donateur</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-100 px-4 py-2 rounded-xl">
              <User size={20} className="text-slate-600" />
              <span className="font-semibold text-slate-700">{user?.full_name || '...'}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Onglets */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab('cas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'cas' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <List size={16} />
            Cas actifs
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'cas' ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>
              {requests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'historique' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <History size={16} />
            Mes dons
            {donationsLoaded && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'historique' ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>
                {myDonations.length}
              </span>
            )}
          </button>
        </div>

        {/* ====== ONGLET CAS ACTIFS ====== */}
        {activeTab === 'cas' && (
          <>
            {/* Filtres */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher par patient, type de besoin..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(u => (
                    <button
                      key={u}
                      onClick={() => setFilterUrgency(u)}
                      className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                        filterUrgency === u ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
                      }`}
                    >
                      {u === 'ALL' ? 'Tous' : u === 'CRITICAL' ? 'Critique' : u === 'HIGH' ? 'Élevé' : u === 'MEDIUM' ? 'Moyen' : 'Faible'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-slate-500 text-sm">
                <span className="font-bold text-blue-600">{filteredRequests.length}</span> demande(s)
              </p>
            </div>

            {/* Cartes */}
            {loadingRequests ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
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
                {filteredRequests.map(request => {
                  const daysLeft = getDaysLeft(request.expiry_date);
                  const percentage = (request.amount_raised / request.amount_needed) * 100;
                  const colors = URGENCY_COLORS[request.urgency_level] || URGENCY_COLORS.LOW;

                  return (
                    <div key={request.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group border border-blue-100">
                      <div className={`h-2 ${colors.bar}`}></div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                            {t(URGENCY_LABELS, request.urgency_level)}{daysLeft !== null ? ` • ${daysLeft}J` : ''}
                          </span>
                          <Heart className="text-slate-300 group-hover:text-red-500 transition-all" size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 mb-1">{t(MEDICAL_NEED_LABELS, request.medical_need)}</h3>
                          <p className="text-sm text-slate-500">{request.patient_pseudonym}</p>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{request.description}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-blue-600">{Number(request.amount_raised).toLocaleString()} FCFA</span>
                            <span className="text-slate-500">{Math.round(percentage)}%</span>
                          </div>
                          <p className="text-xs text-slate-500">Objectif : {Number(request.amount_needed).toLocaleString()} FCFA</p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/cas/${request.id}`}
                            className="flex-1 py-3 text-center border-2 border-blue-200 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all text-sm"
                          >
                            Voir le détail
                          </Link>
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm"
                          >
                            Contribuer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ====== ONGLET HISTORIQUE ====== */}
        {activeTab === 'historique' && (
          <>
            {/* Stats rapides */}
            {!loadingDonations && myDonations.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
                  <p className="text-xs text-slate-500 mb-1">Total donné</p>
                  <p className="text-2xl font-black text-blue-600">{totalDonne.toLocaleString()} FCFA</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
                  <p className="text-xs text-slate-500 mb-1">Nombre de dons</p>
                  <p className="text-2xl font-black text-slate-800">{myDonations.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
                  <p className="text-xs text-slate-500 mb-1">Dons confirmés</p>
                  <p className="text-2xl font-black text-green-600">
                    {myDonations.filter(d => d.status === 'COMPLETED').length}
                  </p>
                </div>
              </div>
            )}

            {/* Liste */}
            {loadingDonations ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                    <div className="h-4 bg-slate-200 rounded mb-3 w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : myDonations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <History className="mx-auto mb-4 text-slate-300" size={64} />
                <p className="text-slate-600 text-lg font-semibold mb-2">Aucun don pour l'instant</p>
                <p className="text-slate-400 mb-6">Votre historique de dons apparaîtra ici</p>
                <button
                  onClick={() => setActiveTab('cas')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Voir les cas actifs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myDonations.map((donation, i) => {
                  const statusCls = DONATION_STATUS_CLS[donation.status] || DONATION_STATUS_CLS.PENDING;
                  return (
                    <div key={donation.id || i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusCls}`}>
                            {t(DONATION_STATUS_LABELS, donation.status)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(donation.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800">
                          {donation.medical_request?.patient_pseudonym || donation.medical_request_id}
                        </p>
                        {donation.medical_request?.medical_need && (
                          <p className="text-sm text-slate-500">{t(MEDICAL_NEED_LABELS, donation.medical_request.medical_need)}</p>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-xl font-black text-blue-600">{Number(donation.amount).toLocaleString()}</p>
                          <p className="text-xs text-slate-400">FCFA</p>
                        </div>
                        {donation.medical_request_id && (
                          <Link
                            to={`/cas/${donation.medical_request_id}`}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Voir la demande"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal donation */}
      {selectedRequest && (
        <DonationModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
      {/* Bouton changement mot de passe */}
<div className="max-w-4xl mx-auto px-4 pb-8 text-center">
  <button
    onClick={() => setShowPasswordModal(true)}
    className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
  >
    <Lock size={16} />
    Modifier mon mot de passe
  </button>
</div>

{/* Modal changement mot de passe */}
{showPasswordModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <Lock size={20} className="text-blue-600" />
        Modifier mon mot de passe
      </h2>

      {passwordError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {passwordError}
        </div>
      )}
      {passwordSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {passwordSuccess}
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe actuel</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nouveau mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showNew ? 'text' : 'password'}
              required
              minLength={8}
              value={passwordData.next}
              onChange={(e) => setPasswordData({ ...passwordData, next: e.target.value })}
              className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Minimum 8 caractères</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmer le nouveau mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              required
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordData({ current: '', next: '', confirm: '' }); }}
            className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={passwordLoading}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            {passwordLoading ? 'Modification...' : 'Modifier'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default DonorDashboard;
