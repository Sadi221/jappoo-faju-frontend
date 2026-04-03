import axios from 'axios';

// ========== CONFIGURATION API URL ==========
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jappoo-faju-backend-production-b1f1.up.railway.app';

console.log('🔗 API URL:', API_BASE_URL);

// Instance axios configurée
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter le token JWT si disponible
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== AUTHENTIFICATION ==========

export const authAPI = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
  },
};

// ========== DEMANDES MÉDICALES ==========

export const medicalRequestsAPI = {
  // Récupérer toutes les demandes (avec filtres optionnels)
  getAll: async (params = {}) => {
    const response = await api.get('/medical-requests', { params });
    return response.data;
  },

  // Récupérer une demande spécifique
  getById: async (id) => {
    const response = await api.get(`/medical-requests/${id}`);
    return response.data;
  },

  // Créer une demande (HOSPITAL_AGENT seulement)
  create: async (requestData) => {
    const response = await api.post('/medical-requests/', requestData);
    return response.data;
  },

  // Valider une demande (ADMIN seulement)
  validate: async (requestId) => {
    const response = await api.patch(`/medical-requests/${requestId}/validate`);
    return response.data;
  },

  // Rejeter une demande (ADMIN seulement)
  reject: async (requestId) => {
    const response = await api.patch(`/medical-requests/${requestId}/reject`);
    return response.data;
  },

  // Prolonger la date limite (ADMIN seulement)
  extend: async (requestId, newExpiryDate) => {
    // FastAPI n'accepte pas le format avec Z (UTC suffix) — on strip le Z
    const dateStr = newExpiryDate.replace('Z', '');
    const response = await api.patch(`/medical-requests/${requestId}/extend`, {
      new_expiry_date: dateStr
    });
    return response.data;
  },
};

// ========== DONATIONS ==========

export const donationsAPI = {
  // Créer une donation
  create: async (donationData) => {
    const response = await api.post('/donations/', donationData);
    return response.data;
  },

  // Récupérer une donation
  getById: async (id) => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  // Lister les dons reçus pour une demande médicale
  getByRequest: async (requestId) => {
    const response = await api.get(`/donations/by-request/${requestId}`);
    return response.data;
  },
};

// ========== PAYMENTS API ==========

export const paymentsAPI = {
  /**
   * Créer une donation (étape 1)
   */
  createDonation: async (donationData) => {
    const response = await api.post('/donations/', donationData);
    return response.data;
  },

  /**
   * Initier un paiement Wave (étape 2)
   */
  initiateWavePayment: async (paymentData) => {
    const response = await api.post('/payments/wave/initiate', paymentData);
    return response.data;
  },

  /**
   * Vérifier le statut d'un paiement
   */
  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Obtenir toutes les donations d'un utilisateur
   */
  getMyDonations: async () => {
    const response = await api.get('/donations/');
    return response.data;
  }
};

// ========== HÔPITAUX ==========

export const hospitalsAPI = {
  // Créer le profil hôpital de l'agent connecté
  create: async (hospitalData) => {
    const response = await api.post('/hospitals/', hospitalData);
    return response.data;
  },

  // Récupérer l'hôpital de l'agent connecté
  getMyHospital: async () => {
    const response = await api.get('/hospitals/me');
    return response.data;
  },

  // Récupérer un hôpital par ID
  getById: async (id) => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  },

  // Lister tous les hôpitaux (ADMIN)
  getAll: async () => {
    const response = await api.get('/hospitals/');
    return response.data;
  },

  // Vérifier un hôpital (ADMIN)
  verify: async (id) => {
    const response = await api.patch(`/hospitals/${id}/verify`);
    return response.data;
  },

  // Rejeter un hôpital (ADMIN)
  reject: async (id) => {
    const response = await api.patch(`/hospitals/${id}/reject`);
    return response.data;
  },
};

// ========== STATISTIQUES (pour la landing page) ==========

export const statsAPI = {
  // Récupérer les stats globales
  getGlobalStats: async () => {
    try {
      // Récupérer toutes les demandes ACTIVE
      const activeRequests = await medicalRequestsAPI.getAll({ status: 'ACTIVE' });
      
      // Calculer les stats
      const totalRequests = activeRequests.length;
      const totalNeeded = activeRequests.reduce((sum, req) => sum + req.amount_needed, 0);
      const totalRaised = activeRequests.reduce((sum, req) => sum + req.amount_raised, 0);
      
      return {
        totalRequests,
        totalNeeded,
        totalRaised,
        percentageRaised: totalNeeded > 0 ? (totalRaised / totalNeeded) * 100 : 0,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalRequests: 0,
        totalNeeded: 0,
        totalRaised: 0,
        percentageRaised: 0,
      };
    }
  },
};

export default api;