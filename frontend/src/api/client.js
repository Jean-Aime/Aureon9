import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'aureon9_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/api/auth/register', data),
  login: (email, password) => apiClient.post('/api/auth/login', { email, password }),
};

// Members API
export const membersAPI = {
  getAll: () => apiClient.get('/api/members'),
  getById: (id) => apiClient.get(`/api/members/${id}`),
  update: (id, data) => apiClient.patch(`/api/members/${id}`, data),
  getCapabilities: (id) => apiClient.get(`/api/members/${id}/capabilities`),
  getPreferences: (id) => apiClient.get(`/api/members/${id}/preferences`),
  updatePreferences: (id, data) => apiClient.patch(`/api/members/${id}/preferences`, data),
  getPerformance: (id) => apiClient.get(`/api/members/${id}/performance`),
  getUpgradePath: (id) => apiClient.get(`/api/members/${id}/upgrade-path`),
  getNotifications: (id) => apiClient.get(`/api/members/${id}/notifications`),
};

// Verification Records API
export const verificationAPI = {
  getAll: () => apiClient.get('/api/verification-records'),
  getById: (id) => apiClient.get(`/api/verification-records/${id}`),
  create: (data) => apiClient.post('/api/verification-records', data),
  update: (id, data) => apiClient.patch(`/api/verification-records/${id}`, data),
};

// Documents API
export const documentsAPI = {
  getAll: () => apiClient.get('/api/documents'),
  create: (data) => apiClient.post('/api/documents', data),
  getUploadUrl: (data) => apiClient.post('/api/documents/upload-url', data),
  uploadBinary: (uploadUrl, file, contentType) =>
    apiClient.post(uploadUrl, file, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
      },
    }),
  finalizeUpload: (data) => apiClient.post('/api/documents/finalize-upload', data),
  updateReviewStatus: (id, data) => apiClient.patch(`/api/documents/${id}/review-status`, data),
  delete: (id) => apiClient.delete(`/api/documents/${id}`),
};

// Wallets API
export const walletsAPI = {
  getWallet: (memberProfileId) => apiClient.get(`/api/wallets/${memberProfileId}`),
  getEarnings: (memberProfileId) => apiClient.get(`/api/wallets/${memberProfileId}/earnings`),
  createTransaction: (data) => apiClient.post('/api/wallet-transactions', data),
};

// Referrals API
export const referralsAPI = {
  getAll: () => apiClient.get('/api/referrals'),
  getById: (id) => apiClient.get(`/api/referrals/${id}`),
  create: (data) => apiClient.post('/api/referrals', data),
};

// Opportunities API
export const opportunitiesAPI = {
  getAll: () => apiClient.get('/api/opportunities'),
  create: (data) => apiClient.post('/api/opportunities', data),
  update: (id, data) => apiClient.patch(`/api/opportunities/${id}`, data),
};

// Opportunity Applications API
export const opportunityApplicationsAPI = {
  getAll: () => apiClient.get('/api/opportunity-applications'),
  getByMemberId: (memberId) => apiClient.get(`/api/members/${memberId}/opportunity-applications`),
  create: (data) => apiClient.post('/api/opportunity-applications', data),
  update: (id, data) => apiClient.put(`/api/opportunity-applications/${id}`, data),
};

// Reference Data API
export const referenceAPI = {
  getParticipantClasses: () => apiClient.get('/api/participant-classes'),
  getTiers: () => apiClient.get('/api/tiers'),
};

// Audit Logs API
export const auditAPI = {
  getAll: () => apiClient.get('/api/audit-logs'),
  create: (data) => apiClient.post('/api/audit-logs', data),
};

export const reviewQueueAPI = {
  getAll: (params) => apiClient.get('/api/review-queue', { params }),
  approve: (data) => apiClient.post('/api/review-queue/approve', data),
  reject: (data) => apiClient.post('/api/review-queue/reject', data),
  escalate: (data) => apiClient.post('/api/review-queue/escalate', data),
  assignReviewer: (data) => apiClient.post('/api/review-queue/assign-reviewer', data),
  requestMoreDocs: (data) => apiClient.post('/api/review-queue/request-more-docs', data),
};

export const adminPanelAPI = {
  getUsers: () => apiClient.get('/api/admin/users'),
  getConfig: () => apiClient.get('/api/admin/panel-config'),
  updateChannels: (channels) => apiClient.patch('/api/admin/panel-config/channels', { channels }),
  updateTemplates: (templates) => apiClient.patch('/api/admin/panel-config/templates', { templates }),
  updateTimers: (timers, retryPolicy) => apiClient.patch('/api/admin/panel-config/timers', { timers, retryPolicy }),
  updateRewardRules: (rewardRules) => apiClient.patch('/api/admin/panel-config/reward-rules', { rewardRules }),
  updateGovernanceRules: (deliveryRules, escalationRules) =>
    apiClient.patch('/api/admin/panel-config/governance-rules', { deliveryRules, escalationRules }),
  getAnalytics: () => apiClient.get('/api/admin/panel-analytics'),
};

export default apiClient;
