import axios from 'axios';

// ========== CONFIGURATION API URL ==========
// PROTECTION TRIPLE CONTRE HTTP
const RAW_URL = import.meta.env.VITE_API_BASE_URL || 'https://jappoo-faju-backend-production-b1f1.up.railway.app';
const HTTPS_URL = RAW_URL.replace(/^http:/, 'https:');
const API_BASE_URL = HTTPS_URL;

// DEBUG: Affiche l'URL utilisée
console.log('🔗 API URL:', API_BASE_URL);

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT si disponible
api.interceptors.request.use(
  (config) => {
    // SÉCURITÉ: Force HTTPS dans l'URL finale
    if (config.url && !config.url.startsWith('http')) {
      config.url = API_BASE_URL + config.url;
    }
    if (config.url && config.url.startsWith('http:')) {
      config.url = config.url.replace('http:', 'https:');
      console.warn('⚠️  URL forcée en HTTPS:', config.url);
    }
    
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
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
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
    const response = await api.get('/api/medical-requests', { params });
    return response.data;
  },

  // Récupérer une demande spécifique
  getById: async (id) => {
    const response = await api.get(`/api/medical-requests/${id}`);
    return response.data;
  },

  // Créer une demande (HOSPITAL_AGENT seulement)
  create: async (requestData) => {
    const response = await api.post('/api/medical-requests/', requestData);
    return response.data;
  },

  // Valider une demande (ADMIN seulement)
  validate: async (requestId) => {
    const response = await api.patch(`/api/medical-requests/${requestId}/validate`);
    return response.data;
  },

  // Rejeter une demande (ADMIN seulement)
  reject: async (requestId) => {
    const response = await api.patch(`/api/medical-requests/${requestId}/reject`);
    return response.data;
  },
};

// ========== DONATIONS ==========

export const donationsAPI = {
  // Créer une donation
  create: async (donationData) => {
    const response = await api.post('/api/donations/', donationData);
    return response.data;
  },

  // Récupérer une donation
  getById: async (id) => {
    const response = await api.get(`/api/donations/${id}`);
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
