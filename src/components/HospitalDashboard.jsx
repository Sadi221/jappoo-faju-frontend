import React, { useState, useEffect } from 'react';
import { Heart, LogOut, User, Plus, FileText, AlertTriangle, CheckCircle, X, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { medicalRequestsAPI, authAPI, hospitalsAPI, donationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [hospitalFormData, setHospitalFormData] = useState({ name: '', address: '', phone: '', registration_number: '' });
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donationsByRequest, setDonationsByRequest] = useState({});
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState('');

  // État du formulaire
  const [formData, setFormData] = useState({
    patient_pseudonym: '',
    medical_need: 'SURGERY',
    description: '',
    amount_needed: '',
    urgency_level: 'HIGH',
    expiry_date: '',
  });

  // Charger l'utilisateur connecté + son hôpital
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        if (userData.role !== 'HOSPITAL_AGENT') { navigate('/'); return; }

        try {
          const h = await hospitalsAPI.getMyHospital();
          setHospital(h);
        } catch {
          setHospital(null); // Pas encore de profil hôpital
        }
      } catch (err) {
        console.error('Erreur chargement utilisateur:', err);
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  // Charger les demandes filtrées par hôpital de l'agent
  useEffect(() => {
    const fetchRequests = async () => {
      if (!hospital) { setLoading(false); return; }
      try {
        setLoading(true);
        const data = await medicalRequestsAPI.getAll({ status: 'ALL', hospital_id: hospital.id });
        setRequests(data);
      } catch (err) {
        console.error('Erreur lors du chargement des demandes:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchRequests();
  }, [user, hospital]);

  // Charger les dons d'une demande au clic
  const toggleDonations = async (requestId) => {
    if (expandedRequest === requestId) {
      setExpandedRequest(null);
      return;
    }
    setExpandedRequest(requestId);
    if (!donationsByRequest[requestId]) {
      try {
        const data = await donationsAPI.getByRequest(requestId);
        setDonationsByRequest(prev => ({ ...prev, [requestId]: data }));
      } catch (err) {
        console.error('Erreur chargement dons:', err);
        setDonationsByRequest(prev => ({ ...prev, [requestId]: [] }));
      }
    }
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  // Créer le profil hôpital
  const handleCreateHospital = async (e) => {
    e.preventDefault();
    setHospitalLoading(true);
    try {
      const h = await hospitalsAPI.create(hospitalFormData);
      setHospital(h);
      setShowHospitalForm(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la création du profil hôpital');
    } finally {
      setHospitalLoading(false);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hospital) { alert("Veuillez d'abord créer votre profil hôpital."); return; }
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess(false);

    try {
      const requestData = {
        hospital_id: hospital.id,
        patient_pseudonym: formData.patient_pseudonym,
        medical_need: formData.medical_need,
        description: formData.description,
        amount_needed: parseFloat(formData.amount_needed),
        urgency_level: formData.urgency_level,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
      };

      await medicalRequestsAPI.create(requestData);
      
      setCreateSuccess(true);
      
      setTimeout(() => {
        setShowCreateForm(false);
        setFormData({
          patient_pseudonym: '',
          medical_need: 'SURGERY',
          description: '',
          amount_needed: '',
          urgency_level: 'HIGH',
          expiry_date: '',
        });
        setCreateSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      
      let errorMessage = 'Erreur lors de la création de la demande';
      
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } 
        else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
        }
        else {
          errorMessage = JSON.stringify(err.response.data.detail);
        }
      }
      
      setCreateError(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Complétée' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejetée' },
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
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
              <p className="text-xs text-slate-500">Dashboard Hôpital</p>
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

        {/* Bandeau profil hôpital */}
        {hospital ? (
          <div className="mb-6 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Établissement enregistré</p>
              <p className="font-bold text-slate-800">{hospital.name}</p>
              <p className="text-sm text-slate-500">{hospital.address}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              hospital.is_verified ? 'bg-green-100 text-green-700' :
              hospital.is_rejected ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {hospital.is_verified ? '✓ Vérifié' : hospital.is_rejected ? '✗ Rejeté — contactez l\'admin' : 'En attente de vérification'}
            </span>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center justify-between">
            <p className="text-yellow-800 font-semibold">
              ⚠️ Vous n'avez pas encore de profil hôpital. Créez-en un pour soumettre des demandes.
            </p>
            <button
              onClick={() => setShowHospitalForm(true)}
              className="ml-4 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-all whitespace-nowrap"
            >
              Créer mon profil
            </button>
          </div>
        )}

        {/* Bouton créer une demande */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Mes demandes d'aide</h2>
            <p className="text-slate-600">Gérez les demandes médicales de votre établissement</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={!hospital}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            <span>Nouvelle demande</span>
          </button>
        </div>

        {/* Liste des demandes */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="h-6 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded mb-4"></div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <FileText className="mx-auto mb-4 text-slate-400" size={64} />
            <p className="text-slate-600 text-lg mb-4">Aucune demande créée</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Créer ma première demande
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {requests.map((request) => {
              const percentage = (request.amount_raised / request.amount_needed) * 100;
              
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-blue-100"
                >
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{request.medical_need}</h3>
                        <p className="text-sm text-slate-500">{request.patient_pseudonym}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 line-clamp-2">{request.description}</p>

                    {/* Progression */}
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
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

                    {/* Urgence */}
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertTriangle
                        size={16}
                        className={
                          request.urgency_level === 'CRITICAL' ? 'text-red-600' :
                          request.urgency_level === 'HIGH' ? 'text-orange-600' :
                          request.urgency_level === 'MEDIUM' ? 'text-yellow-600' :
                          'text-blue-600'
                        }
                      />
                      <span className="text-slate-600">{request.urgency_level}</span>
                    </div>

                    {/* Bouton voir les dons */}
                    <button
                      onClick={() => toggleDonations(request.id)}
                      className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all text-sm font-semibold text-slate-600 hover:text-blue-600"
                    >
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>Dons reçus</span>
                      </div>
                      {expandedRequest === request.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* Liste des dons */}
                    {expandedRequest === request.id && (
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        {!donationsByRequest[request.id] ? (
                          <p className="text-sm text-slate-400 text-center py-2">Chargement...</p>
                        ) : donationsByRequest[request.id].length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-2">Aucun don reçu pour l'instant</p>
                        ) : (
                          donationsByRequest[request.id].map((don) => (
                            <div key={don.id} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{don.donor_name}</p>
                                <p className="text-xs text-slate-500">{new Date(don.created_at).toLocaleDateString('fr-FR')}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-green-600">{don.amount.toLocaleString()} FCFA</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  don.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                  don.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>{don.status}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal création profil hôpital */}
      {showHospitalForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white relative">
              <button onClick={() => setShowHospitalForm(false)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold">Profil de votre établissement</h2>
              <p className="text-blue-100 mt-1">Ces informations sont nécessaires pour valider vos demandes</p>
            </div>
            <form onSubmit={handleCreateHospital} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de l'établissement</label>
                <input required type="text" value={hospitalFormData.name}
                  onChange={e => setHospitalFormData({...hospitalFormData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Hôpital Principal de Dakar" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse</label>
                <input required type="text" value={hospitalFormData.address}
                  onChange={e => setHospitalFormData({...hospitalFormData, address: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Avenue Cheikh Anta Diop, Dakar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone</label>
                  <input required type="tel" value={hospitalFormData.phone}
                    onChange={e => setHospitalFormData({...hospitalFormData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+221 XX XXX XX XX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">N° d'enregistrement</label>
                  <input required type="text" value={hospitalFormData.registration_number}
                    onChange={e => setHospitalFormData({...hospitalFormData, registration_number: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: SN-HOP-2024-001" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowHospitalForm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={hospitalLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                  {hospitalLoading ? 'Création...' : 'Créer le profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de création */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white relative">
              <button
                onClick={() => setShowCreateForm(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-2">Nouvelle demande d'aide</h2>
              <p className="text-blue-100">Créez une demande pour un patient nécessitant une aide médicale</p>
            </div>

            <div className="p-6">
              {createSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Demande créée !</h3>
                  <p className="text-slate-600">Elle sera visible après validation par l'admin</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {createError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {createError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pseudonyme du patient
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.patient_pseudonym}
                      onChange={(e) => setFormData({ ...formData, patient_pseudonym: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Patient DK-2026-089"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Type de besoin médical
                    </label>
                    <select
                      required
                      value={formData.medical_need}
                      onChange={(e) => setFormData({ ...formData, medical_need: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SURGERY">Chirurgie</option>
                      <option value="MEDICATION">Médicaments</option>
                      <option value="EXAM">Examens médicaux</option>
                      <option value="KIT">Kit médical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description détaillée
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Décrivez la situation médicale et le besoin..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Montant nécessaire (FCFA)
                      </label>
                      <input
                        type="number"
                        required
                        min="1000"
                        value={formData.amount_needed}
                        onChange={(e) => setFormData({ ...formData, amount_needed: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="500000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Niveau d'urgence
                      </label>
                      <select
                        required
                        value={formData.urgency_level}
                        onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CRITICAL">Critique</option>
                        <option value="HIGH">Élevé</option>
                        <option value="MEDIUM">Moyen</option>
                        <option value="LOW">Faible</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date limite (optionnel)
                    </label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                    >
                      {createLoading ? 'Création...' : 'Créer la demande'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
