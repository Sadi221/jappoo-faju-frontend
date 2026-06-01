import React, { useState, useEffect, useMemo } from 'react';
import { Heart, LogOut, User, Plus, FileText, AlertTriangle, CheckCircle, X, ChevronDown, ChevronUp, Users, Upload, Paperclip } from 'lucide-react';
import { medicalRequestsAPI, authAPI, hospitalsAPI, donationsAPI } from '../services/api';
import { MEDICAL_NEED_LABELS, URGENCY_LABELS, REQUEST_STATUS_LABELS, DONATION_STATUS_LABELS, t } from '../utils/translations';
import { useNavigate } from 'react-router-dom';

const EMPTY_FORM = {
  pseudonym: '',
  gender: 'M',
  age_range: '18-40',
  urgency_level: 'CRITIQUE',
  care_type: 'MEDICAMENTS',
  care_type_detail: '',
  total_cost: '',
  patient_contribution: '0',
  third_party_contribution: '0',
  prescription_ref: '',
  professional_status: 'ACTIF',
  income_range: 'LESS_50K',
  dependents: '0',
  social_support: [],
  case_summary: '',
  expiry_date: '',
};

const SOCIAL_SUPPORT_OPTIONS = [
  { value: 'BSF',         label: 'Bourse de Sécurité Familiale (BSF)' },
  { value: 'PLAN_SESAME', label: 'Plan Sésame (+ 60 ans)' },
  { value: 'CMU',         label: 'Couverture Maladie Universelle (CMU)' },
  { value: 'CT',          label: 'Collectivité Territoriale (CT)' },
  { value: 'DGAS',        label: 'DGAS (Action Sociale)' },
  { value: 'MUTUELLE',    label: 'Mutuelle de santé' },
  { value: 'AUCUN',       label: 'Aucune couverture' },
];

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
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofFileError, setProofFileError] = useState('');

  // Montant demandé calculé en temps réel
  const amountRequested = useMemo(() => {
    const total = parseFloat(formData.total_cost) || 0;
    const patient = parseFloat(formData.patient_contribution) || 0;
    const thirdParty = parseFloat(formData.third_party_contribution) || 0;
    return Math.max(0, total - patient - thirdParty);
  }, [formData.total_cost, formData.patient_contribution, formData.third_party_contribution]);

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
          setHospital(null);
        }
      } catch (err) {
        console.error('Erreur chargement utilisateur:', err);
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

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

  const toggleDonations = async (requestId) => {
    if (expandedRequest === requestId) { setExpandedRequest(null); return; }
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

  const handleLogout = () => { authAPI.logout(); navigate('/'); };

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setProofFileError('Format non supporté. Utilisez PDF, JPG ou PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProofFileError('Fichier trop volumineux (max 5 Mo).');
      return;
    }
    setProofFileError('');
    setProofFile(file);
  };

  const toggleSocialSupport = (value) => {
    setFormData(prev => {
      const current = prev.social_support;
      if (current.includes(value)) return { ...prev, social_support: current.filter(v => v !== value) };
      return { ...prev, social_support: [...current, value] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hospital) { alert("Veuillez d'abord créer votre profil hôpital."); return; }
    if (amountRequested <= 0) {
      setCreateError("Le montant demandé doit être supérieur à 0. Vérifiez le coût total et les contributions.");
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess(false);

    try {
      const payload = {
        hospital_id: hospital.id,
        pseudonym: formData.pseudonym.trim(),
        gender: formData.gender,
        age_range: formData.age_range,
        urgency_level: formData.urgency_level,
        care_type: formData.care_type,
        care_type_detail: formData.care_type_detail.trim() || undefined,
        total_cost: parseFloat(formData.total_cost),
        patient_contribution: parseFloat(formData.patient_contribution) || 0,
        third_party_contribution: parseFloat(formData.third_party_contribution) || 0,
        amount_requested: amountRequested,
        prescription_ref: formData.prescription_ref.trim() || undefined,
        professional_status: formData.professional_status,
        income_range: formData.income_range,
        dependents: formData.dependents,
        social_support: formData.social_support,
        case_summary: formData.case_summary.trim(),
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
      };

      const newRequest = await medicalRequestsAPI.create(payload);

      // Upload du document si sélectionné (étape 2 — après obtention de l'id)
      if (proofFile) {
        setUploadingProof(true);
        try {
          await medicalRequestsAPI.uploadFile(newRequest.id, proofFile);
        } catch (uploadErr) {
          console.error("Erreur upload document:", uploadErr);
          // La demande est créée — l'agent peut joindre le doc depuis la liste
        } finally {
          setUploadingProof(false);
        }
      }

      setCreateSuccess(true);
      setTimeout(() => {
        setShowCreateForm(false);
        setFormData(EMPTY_FORM);
        setProofFile(null);
        setCreateSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      let errorMessage = 'Erreur lors de la création de la demande';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
        } else {
          errorMessage = JSON.stringify(err.response.data.detail);
        }
      }
      setCreateError(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUploadProof = async (requestId, file) => {
    if (!file) return;
    setUploadingId(requestId);
    setUploadError('');
    try {
      await medicalRequestsAPI.uploadProof(requestId, file);
      const data = await medicalRequestsAPI.getAll({ status: 'ALL', hospital_id: hospital.id });
      setRequests(data);
    } catch (err) {
      setUploadError(err.response?.data?.detail || "Erreur lors de l'upload");
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING:   { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      ACTIVE:    { bg: 'bg-green-100',  text: 'text-green-700' },
      COMPLETED: { bg: 'bg-blue-100',   text: 'text-blue-700' },
      REJECTED:  { bg: 'bg-red-100',    text: 'text-red-700' },
      EXPIRED:   { bg: 'bg-slate-100',  text: 'text-slate-500' },
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        {t(REQUEST_STATUS_LABELS, status)}
      </span>
    );
  };

  const inputCls = "w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "block text-sm font-semibold text-slate-700 mb-2";
  const sectionTitleCls = "text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100";

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
              <p className="text-xs text-slate-500">Dashboard Hôpital</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-100 px-4 py-2 rounded-xl">
              <User size={20} className="text-slate-600" />
              <span className="font-semibold text-slate-700">{user?.full_name || 'Chargement...'}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Déconnexion">
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
            <button onClick={() => setShowHospitalForm(true)}
              className="ml-4 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-all whitespace-nowrap">
              Créer mon profil
            </button>
          </div>
        )}

        {/* Titre + bouton */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-800">Mes demandes d'aide</h2>
            <p className="text-slate-600">Gérez les demandes médicales de votre établissement</p>
          </div>
          <button onClick={() => setShowCreateForm(true)} disabled={!hospital}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
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
            <button onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              Créer ma première demande
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {requests.map((request) => {
              const percentage = (request.amount_raised / (request.amount_requested || request.amount_needed || 1)) * 100;
              return (
                <div key={request.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-blue-100">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-1">
                          {request.care_type || t(MEDICAL_NEED_LABELS, request.medical_need)}
                        </h3>
                        <p className="text-sm text-slate-500">{request.patient_pseudonym}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2">{request.case_summary || request.description}</p>

                    <div className="space-y-2">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                          style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-blue-600">
                          {request.amount_raised.toLocaleString()} FCFA
                        </span>
                        <span className="text-slate-500">{Math.round(percentage)}%</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Objectif : {(request.amount_requested || request.amount_needed || 0).toLocaleString()} FCFA
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <AlertTriangle size={16} className={
                        request.urgency_level === 'CRITIQUE' ? 'text-red-600' : 'text-orange-400'
                      } />
                      <span className="text-slate-600">
                        {request.urgency_level === 'CRITIQUE' ? 'Urgence critique' :
                         request.urgency_level === 'RELATIVE' ? 'Urgence relative' :
                         t(URGENCY_LABELS, request.urgency_level)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {request.proof_document_url ? (
                        <a href={`${import.meta.env.VITE_API_BASE_URL || 'https://jappoo-faju-backend-production-b1f1.up.railway.app'}${request.proof_document_url}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <Paperclip size={14} />
                          <span>Document joint</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Aucun document</span>
                      )}
                      {['PENDING', 'ACTIVE'].includes(request.status) && (
                        <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          uploadingId === request.id ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}>
                          <Upload size={13} />
                          <span>{uploadingId === request.id ? 'Upload...' : 'Joindre document'}</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
                            disabled={uploadingId === request.id}
                            onChange={e => handleUploadProof(request.id, e.target.files[0])} />
                        </label>
                      )}
                    </div>
                    {uploadError && uploadingId === null && (
                      <p className="text-xs text-red-500">{uploadError}</p>
                    )}

                    <button onClick={() => toggleDonations(request.id)}
                      className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all text-sm font-semibold text-slate-600 hover:text-blue-600">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>Dons reçus</span>
                      </div>
                      {expandedRequest === request.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

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
                                }`}>{t(DONATION_STATUS_LABELS, don.status)}</span>
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
                <label className={labelCls}>Nom de l'établissement</label>
                <input required type="text" value={hospitalFormData.name}
                  onChange={e => setHospitalFormData({...hospitalFormData, name: e.target.value})}
                  className={inputCls} placeholder="Ex: Hôpital Principal de Dakar" />
              </div>
              <div>
                <label className={labelCls}>Adresse</label>
                <input required type="text" value={hospitalFormData.address}
                  onChange={e => setHospitalFormData({...hospitalFormData, address: e.target.value})}
                  className={inputCls} placeholder="Ex: Avenue Cheikh Anta Diop, Dakar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Téléphone</label>
                  <input required type="tel" value={hospitalFormData.phone}
                    onChange={e => setHospitalFormData({...hospitalFormData, phone: e.target.value})}
                    className={inputCls} placeholder="+221 XX XXX XX XX" />
                </div>
                <div>
                  <label className={labelCls}>N° d'enregistrement</label>
                  <input required type="text" value={hospitalFormData.registration_number}
                    onChange={e => setHospitalFormData({...hospitalFormData, registration_number: e.target.value})}
                    className={inputCls} placeholder="Ex: SN-HOP-2024-001" />
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

      {/* Modal de création de demande */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white relative">
              <button onClick={() => setShowCreateForm(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-all">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-1">Nouvelle demande d'aide</h2>
              <p className="text-blue-100 text-sm">Formulaire de demande de prise en charge médicale</p>
            </div>

            <div className="p-6">
              {createSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Demande soumise !</h3>
                  <p className="text-slate-600 mb-2">
                    Elle sera examinée par le Chef du Service Social et le Référent Médical
                    avant publication.
                  </p>
                  {proofFile && (
                    <p className="text-sm text-blue-600 font-medium flex items-center justify-center gap-2">
                      <Paperclip size={14} /> Document joint : {proofFile.name}
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {createError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {createError}
                    </div>
                  )}

                  {/* ── Section 1 : Patient ── */}
                  <div>
                    <p className={sectionTitleCls}>1. Identification du patient</p>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Pseudonyme du patient <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.pseudonym}
                          onChange={e => setFormData({ ...formData, pseudonym: e.target.value })}
                          className={inputCls} placeholder="Ex: Patient DK-2026-089" minLength={3} maxLength={50} />
                        <p className="text-xs text-slate-400 mt-1">Identifiant anonymisé — jamais le nom réel</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Sexe <span className="text-red-500">*</span></label>
                          <div className="flex gap-3">
                            {[{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }].map(opt => (
                              <label key={opt.value} className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 rounded-xl cursor-pointer transition-all font-semibold text-sm ${
                                formData.gender === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'
                              }`}>
                                <input type="radio" name="gender" value={opt.value} checked={formData.gender === opt.value}
                                  onChange={e => setFormData({ ...formData, gender: e.target.value })} className="sr-only" />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}>Tranche d'âge <span className="text-red-500">*</span></label>
                          <select required value={formData.age_range}
                            onChange={e => setFormData({ ...formData, age_range: e.target.value })}
                            className={inputCls}>
                            <option value="0-18">Enfant / Adolescent (0–18 ans)</option>
                            <option value="18-40">Adulte (18–40 ans)</option>
                            <option value="40-60">Adulte (40–60 ans)</option>
                            <option value="60+">Sénior (60 ans et plus)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 2 : Soins ── */}
                  <div>
                    <p className={sectionTitleCls}>2. Nature des soins</p>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Niveau d'urgence <span className="text-red-500">*</span></label>
                        <div className="flex gap-3">
                          {[
                            { value: 'CRITIQUE', label: '🔴 Urgence critique', desc: 'Situation qui engage le pronostic vital' },
                            { value: 'RELATIVE', label: '🟠 Urgence relative', desc: 'Soins nécessaires sans danger immédiat' },
                          ].map(opt => (
                            <label key={opt.value} className={`flex-1 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                              formData.urgency_level === opt.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                            }`}>
                              <input type="radio" name="urgency_level" value={opt.value}
                                checked={formData.urgency_level === opt.value}
                                onChange={e => setFormData({ ...formData, urgency_level: e.target.value })} className="sr-only" />
                              <p className="font-semibold text-sm text-slate-800">{opt.label}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Type de soins <span className="text-red-500">*</span></label>
                          <select required value={formData.care_type}
                            onChange={e => setFormData({ ...formData, care_type: e.target.value })}
                            className={inputCls}>
                            <option value="MEDICAMENTS">Médicaments</option>
                            <option value="EXAMENS">Examens médicaux</option>
                            <option value="IMAGERIE">Imagerie (radio, scanner, IRM…)</option>
                            <option value="CHIRURGIE">Chirurgie</option>
                            <option value="CONSOMMABLES">Consommables médicaux</option>
                            <option value="AUTRE">Autre</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Précision (optionnel)</label>
                          <input type="text" value={formData.care_type_detail}
                            onChange={e => setFormData({ ...formData, care_type_detail: e.target.value })}
                            className={inputCls} placeholder="Ex: Dialyse rénale 3x/sem" maxLength={200} />
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>Référence ordonnance / prescription (optionnel)</label>
                        <input type="text" value={formData.prescription_ref}
                          onChange={e => setFormData({ ...formData, prescription_ref: e.target.value })}
                          className={inputCls} placeholder="Ex: ORD-2026-00789" maxLength={100} />
                      </div>

                      {/* Upload ordonnance */}
                      <div>
                        <label className={labelCls}>Joindre l'ordonnance / bon d'examen (optionnel)</label>
                        <div className={`border-2 border-dashed rounded-xl transition-all ${
                          proofFile ? 'border-blue-400 bg-blue-50' :
                          proofFileError ? 'border-red-300 bg-red-50' :
                          'border-slate-200 hover:border-blue-300 bg-slate-50'
                        }`}>
                          {!proofFile ? (
                            <label className="flex flex-col items-center gap-2 p-5 cursor-pointer">
                              <Upload size={26} className="text-slate-400" />
                              <span className="text-sm font-semibold text-slate-600">Cliquez pour sélectionner</span>
                              <span className="text-xs text-slate-400">PDF, JPG, PNG — max 5 Mo</span>
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                                onChange={handleFileSelect} />
                            </label>
                          ) : (
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Paperclip size={18} className="text-blue-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-700 truncate">{proofFile.name}</p>
                                  <p className="text-xs text-slate-400">{(proofFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                                </div>
                              </div>
                              <button type="button"
                                onClick={() => { setProofFile(null); setProofFileError(''); }}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all flex-shrink-0 ml-2">
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        {proofFileError && <p className="text-xs text-red-500 mt-1">{proofFileError}</p>}
                        <p className="text-xs text-slate-400 mt-1">Document anonymisé — aucun nom visible</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 3 : Finances ── */}
                  <div>
                    <p className={sectionTitleCls}>3. Évaluation financière</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={labelCls}>Coût total estimé (FCFA) <span className="text-red-500">*</span></label>
                          <input type="number" required min="1" value={formData.total_cost}
                            onChange={e => setFormData({ ...formData, total_cost: e.target.value })}
                            className={inputCls} placeholder="500 000" />
                        </div>
                        <div>
                          <label className={labelCls}>Part du patient (FCFA)</label>
                          <input type="number" min="0" value={formData.patient_contribution}
                            onChange={e => setFormData({ ...formData, patient_contribution: e.target.value })}
                            className={inputCls} placeholder="0" />
                        </div>
                        <div>
                          <label className={labelCls}>Part de tiers (FCFA)</label>
                          <input type="number" min="0" value={formData.third_party_contribution}
                            onChange={e => setFormData({ ...formData, third_party_contribution: e.target.value })}
                            className={inputCls} placeholder="0" />
                          <p className="text-xs text-slate-400 mt-1">Famille, assurance, ONG…</p>
                        </div>
                      </div>

                      {/* Montant demandé calculé */}
                      <div className={`p-4 rounded-xl border-2 ${amountRequested > 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                        <p className="text-sm font-semibold text-slate-600 mb-1">Montant demandé (calculé automatiquement)</p>
                        <p className={`text-2xl font-black ${amountRequested > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                          {amountRequested > 0 ? `${amountRequested.toLocaleString('fr-FR')} FCFA` : '—'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">= Coût total − Part patient − Part de tiers</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 4 : Contexte socio-économique ── */}
                  <div>
                    <p className={sectionTitleCls}>4. Contexte socio-économique</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={labelCls}>Situation professionnelle <span className="text-red-500">*</span></label>
                          <select required value={formData.professional_status}
                            onChange={e => setFormData({ ...formData, professional_status: e.target.value })}
                            className={inputCls}>
                            <option value="ACTIF">En activité</option>
                            <option value="SANS_EMPLOI">Sans emploi</option>
                            <option value="RETRAITE">Retraité(e)</option>
                            <option value="AUTRE">Autre</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Tranche de revenus <span className="text-red-500">*</span></label>
                          <select required value={formData.income_range}
                            onChange={e => setFormData({ ...formData, income_range: e.target.value })}
                            className={inputCls}>
                            <option value="LESS_50K">Moins de 50 000 FCFA/mois</option>
                            <option value="50K_150K">50 000 – 150 000 FCFA/mois</option>
                            <option value="MORE_150K">Plus de 150 000 FCFA/mois</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Personnes à charge <span className="text-red-500">*</span></label>
                          <select required value={formData.dependents}
                            onChange={e => setFormData({ ...formData, dependents: e.target.value })}
                            className={inputCls}>
                            <option value="0">Aucune</option>
                            <option value="1-3">1 à 3</option>
                            <option value="4-6">4 à 6</option>
                            <option value="7+">7 ou plus</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>Couvertures sociales (cochez toutes celles qui s'appliquent)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {SOCIAL_SUPPORT_OPTIONS.map(opt => (
                            <label key={opt.value} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all text-sm ${
                              formData.social_support.includes(opt.value)
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                                : 'border-slate-200 text-slate-600 hover:border-blue-300'
                            }`}>
                              <input type="checkbox" checked={formData.social_support.includes(opt.value)}
                                onChange={() => toggleSocialSupport(opt.value)} className="w-4 h-4 accent-blue-600" />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 5 : Résumé et date ── */}
                  <div>
                    <p className={sectionTitleCls}>5. Résumé et délai</p>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>
                          Résumé du cas <span className="text-red-500">*</span>
                          <span className="text-slate-400 font-normal ml-2">({formData.case_summary.length}/500 caractères)</span>
                        </label>
                        <textarea required rows={4} minLength={10} maxLength={500}
                          value={formData.case_summary}
                          onChange={e => setFormData({ ...formData, case_summary: e.target.value })}
                          className={inputCls}
                          placeholder="Décrivez la situation médicale et sociale du patient, le besoin précis et les circonstances qui rendent cette demande urgente..." />
                      </div>

                      <div>
                        <label className={labelCls}>Date limite de collecte (optionnel)</label>
                        <input type="date" value={formData.expiry_date}
                          onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                          className={inputCls} min={new Date().toISOString().split('T')[0]} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setShowCreateForm(false); setFormData(EMPTY_FORM); setProofFile(null); setProofFileError(''); setCreateError(''); }}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all">
                      Annuler
                    </button>
                    <button type="submit" disabled={createLoading || uploadingProof || amountRequested <= 0}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50">
                      {uploadingProof ? 'Upload document...' : createLoading ? 'Création...' : 'Soumettre la demande'}
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
