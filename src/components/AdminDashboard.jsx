import React, { useState, useEffect } from 'react';
import { Heart, LogOut, User, CheckCircle, XCircle, AlertTriangle, TrendingUp, Clock, Ban, Building2 } from 'lucide-react';
import { medicalRequestsAPI, authAPI, hospitalsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING');

  // Charger l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        
        if (userData.role !== 'ADMIN') {
          navigate('/');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'utilisateur:', err);
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  // Charger toutes les demandes + hôpitaux
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requestsData, hospitalsData] = await Promise.all([
          medicalRequestsAPI.getAll({ status: 'ALL', limit: 100 }),
          hospitalsAPI.getAll(),
        ]);
        setAllRequests(requestsData);
        setHospitals(hospitalsData);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleVerifyHospital = async (hospitalId) => {
    setActionLoading(hospitalId);
    try {
      await hospitalsAPI.verify(hospitalId);
      setHospitals(prev => prev.map(h => h.id === hospitalId ? { ...h, is_verified: true } : h));
    } catch (err) {
      console.error('Erreur vérification hôpital:', err);
      alert('Erreur lors de la vérification');
    } finally {
      setActionLoading(null);
    }
  };

  // Statistiques
  const stats = {
    pending: allRequests.filter(r => r.status === 'PENDING').length,
    active: allRequests.filter(r => r.status === 'ACTIVE').length,
    rejected: allRequests.filter(r => r.status === 'REJECTED').length,
    completed: allRequests.filter(r => r.status === 'COMPLETED').length,
  };

  const pendingRequests = allRequests.filter(r => r.status === 'PENDING');
  const filteredRequests = activeTab === 'ALL' ? allRequests : allRequests.filter(r => r.status === activeTab);

  // Gérer la déconnexion
  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  // Valider une demande
  const handleValidate = async (requestId) => {
    setActionLoading(requestId);
    try {
      await medicalRequestsAPI.validate(requestId);
      // Recharger les demandes
      const data = await medicalRequestsAPI.getAll();
      setAllRequests(data);
      setShowConfirm(null);
    } catch (err) {
      console.error('Erreur lors de la validation:', err);
      alert('Erreur lors de la validation de la demande');
    } finally {
      setActionLoading(null);
    }
  };

  // Rejeter une demande
  const handleReject = async (requestId) => {
    setActionLoading(requestId);
    try {
      await medicalRequestsAPI.reject(requestId);
      // Recharger les demandes
      const data = await medicalRequestsAPI.getAll();
      setAllRequests(data);
      setShowConfirm(null);
    } catch (err) {
      console.error('Erreur lors du rejet:', err);
      alert('Erreur lors du rejet de la demande');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <Heart className="text-white" size={20} fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                JAPPOO FAJU
              </h1>
              <p className="text-xs text-slate-500">Dashboard Admin</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-purple-50 px-4 py-2 rounded-xl">
              <User size={20} className="text-purple-600" />
              <span className="font-semibold text-purple-700">{user?.full_name || 'Admin'}</span>
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
        {/* Statistiques */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-800 mb-6">Tableau de bord</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {/* En attente */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-yellow-600" size={32} />
                <span className="text-3xl font-black text-yellow-600">{stats.pending}</span>
              </div>
              <p className="text-slate-600 font-semibold">En attente</p>
            </div>

            {/* Actives */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-green-600" size={32} />
                <span className="text-3xl font-black text-green-600">{stats.active}</span>
              </div>
              <p className="text-slate-600 font-semibold">Actives</p>
            </div>

            {/* Rejetées */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <Ban className="text-red-600" size={32} />
                <span className="text-3xl font-black text-red-600">{stats.rejected}</span>
              </div>
              <p className="text-slate-600 font-semibold">Rejetées</p>
            </div>

            {/* Complétées */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-blue-600" size={32} />
                <span className="text-3xl font-black text-blue-600">{stats.completed}</span>
              </div>
              <p className="text-slate-600 font-semibold">Complétées</p>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'PENDING', label: 'En attente', count: stats.pending, color: 'yellow' },
            { key: 'ACTIVE', label: 'Actives', count: stats.active, color: 'green' },
            { key: 'COMPLETED', label: 'Complétées', count: stats.completed, color: 'blue' },
            { key: 'REJECTED', label: 'Rejetées', count: stats.rejected, color: 'red' },
            { key: 'HOSPITALS', label: 'Hôpitaux', count: hospitals.length, color: 'purple' },
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === key
                  ? `bg-${color}-600 text-white shadow-lg`
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === key ? 'bg-white/20' : `bg-${color}-100 text-${color}-700`
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Liste des demandes */}
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-6">
            {activeTab === 'PENDING' ? `Demandes en attente de validation (${pendingRequests.length})` : `Demandes — ${activeTab} (${filteredRequests.length})`}
          </h2>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <CheckCircle className="mx-auto mb-4 text-green-400" size={64} />
              <p className="text-slate-600 text-lg">Aucune demande ici</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredRequests.map((request) => {
                const percentage = (request.amount_raised / request.amount_needed) * 100;
                
                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-yellow-200"
                  >
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-bold text-slate-800">{request.medical_need}</h3>
                            <AlertTriangle
                              size={20}
                              className={
                                request.urgency_level === 'CRITICAL' ? 'text-red-600' :
                                request.urgency_level === 'HIGH' ? 'text-orange-600' :
                                request.urgency_level === 'MEDIUM' ? 'text-yellow-600' :
                                'text-blue-600'
                              }
                            />
                          </div>
                          <p className="text-sm text-slate-500">{request.patient_pseudonym}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                          En attente
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600">{request.description}</p>

                      {/* Montant */}
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Montant demandé</p>
                        <p className="text-2xl font-black text-purple-600">
                          {request.amount_needed.toLocaleString()} FCFA
                        </p>
                      </div>

                      {/* Informations supplémentaires */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Urgence</p>
                          <p className="font-semibold text-slate-700">{request.urgency_level}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Créée le</p>
                          <p className="font-semibold text-slate-700">
                            {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      {/* Actions — seulement pour les demandes PENDING */}
                      {request.status === 'PENDING' && (
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => setShowConfirm({ id: request.id, action: 'reject' })}
                            disabled={actionLoading === request.id}
                            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-all disabled:opacity-50"
                          >
                            <XCircle size={20} />
                            <span>Rejeter</span>
                          </button>
                          <button
                            onClick={() => setShowConfirm({ id: request.id, action: 'validate' })}
                            disabled={actionLoading === request.id}
                            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50"
                          >
                            <CheckCircle size={20} />
                            <span>Valider</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section hôpitaux */}
      {activeTab === 'HOSPITALS' && (
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-6">
            Hôpitaux enregistrés ({hospitals.length})
          </h2>
          {hospitals.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <Building2 className="mx-auto mb-4 text-slate-400" size={64} />
              <p className="text-slate-600">Aucun hôpital enregistré</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 size={20} className="text-purple-600" />
                        <h3 className="text-lg font-bold text-slate-800">{hospital.name}</h3>
                      </div>
                      <p className="text-sm text-slate-500">{hospital.address}</p>
                      <p className="text-sm text-slate-500">{hospital.phone}</p>
                      <p className="text-xs text-slate-400 mt-1">N° {hospital.registration_number}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      hospital.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {hospital.is_verified ? '✓ Vérifié' : 'En attente'}
                    </span>
                  </div>

                  {!hospital.is_verified && (
                    <button
                      onClick={() => handleVerifyHospital(hospital.id)}
                      disabled={actionLoading === hospital.id}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      {actionLoading === hospital.id ? 'Vérification...' : 'Vérifier cet hôpital'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className={`p-6 text-white rounded-t-3xl ${
              showConfirm.action === 'validate' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-500' 
                : 'bg-gradient-to-r from-red-600 to-pink-500'
            }`}>
              <h2 className="text-2xl font-bold">
                {showConfirm.action === 'validate' ? 'Valider la demande ?' : 'Rejeter la demande ?'}
              </h2>
            </div>

            <div className="p-6">
              <p className="text-slate-600 mb-6">
                {showConfirm.action === 'validate' 
                  ? 'Cette demande sera publiée et visible par tous les donateurs.' 
                  : 'Cette demande sera définitivement rejetée et ne pourra plus être validée.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => showConfirm.action === 'validate' 
                    ? handleValidate(showConfirm.id) 
                    : handleReject(showConfirm.id)
                  }
                  disabled={actionLoading}
                  className={`flex-1 py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 ${
                    showConfirm.action === 'validate'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg'
                      : 'bg-gradient-to-r from-red-600 to-pink-500 hover:shadow-lg'
                  }`}
                >
                  {actionLoading ? 'Traitement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
