


import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('nebula_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('nebula_token');
      Cookies.remove('nebula_user');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: RegisterRequest) => api.post('/api/auth/register', data),
  login: (data: { identifier: string; password: string }) => api.post('/api/auth/login', data),
};

// ─── USERS ───────────────────────────────────────────────────────────────────
export const userApi = {
  getAllUsers: () => api.get('/api/users'),
  getUserById: (id: string) => api.get(`/api/users/${id}`),
  getMyProfile: () => api.get('/api/users/profile'),
  updateProfile: (data: any) => api.put('/api/users/profile', data),
  blockUser: (userId: string, reason: string, permanent: boolean) =>
    api.post('/api/users/block', { userId, reason, permanent }),
  promoteAdmin: (userId: string) => api.post(`/api/users/${userId}/promote-admin`),
  revokeAdmin: (userId: string) => api.post(`/api/users/${userId}/revoke-admin`),
};

// ─── ONBOARDING ─────────────────────────────────────────────────────────────
export const founderApi = {
  getProfile: () => api.get('/api/onboarding/founder'),
  saveProfile: (data: any) => api.put('/api/onboarding/founder', data),
  savePersonalInfo: (data: any) => api.put('/api/onboarding/founder', data),
  saveIdentity: (data: any) => api.put('/api/onboarding/founder', data),
  saveAddress: (data: any) => api.put('/api/onboarding/founder', data),
  saveBankGst: (data: any) => api.put('/api/onboarding/founder', data),
  savePitchDeck: (data: any) => api.put('/api/onboarding/founder', data),
  saveDeclaration: (data: any) => api.put('/api/onboarding/founder', data),
  getAll: () => api.get('/api/onboarding/founder/all'),
};

export const investorApi = {
  getProfile: () => api.get('/api/onboarding/investor'),
  saveProfile: (data: any) => api.put('/api/onboarding/investor', data),
  savePersonalInfo: (data: any) => api.put('/api/onboarding/investor', data),
  saveIdentity: (data: any) => api.put('/api/onboarding/investor', data),
  saveAddress: (data: any) => api.put('/api/onboarding/investor', data),
  saveBankGst: (data: any) => api.put('/api/onboarding/investor', data),
  saveInvestmentProfile: (data: any) => api.put('/api/onboarding/investor', data),
  saveDeclaration: (data: any) => api.put('/api/onboarding/investor', data),
  getAll: () => api.get('/api/onboarding/investor/all'),
};

export const mentorApi = {
  getProfile: () => api.get('/api/onboarding/mentor'),
  saveProfile: (data: any) => api.put('/api/onboarding/mentor', data),
  savePersonalInfo: (data: any) => api.put('/api/onboarding/mentor', data),
  getAll: () => api.get('/api/onboarding/mentor/all'),
  saveAll: () => api.get('/api/onboarding/mentor/all'),
};

export const influencerApi = {
  getProfile: () => api.get('/api/onboarding/influencer'),
  saveProfile: (data: any) => api.put('/api/onboarding/influencer', data),
  savePersonalInfo: (data: any) => api.put('/api/onboarding/influencer', data),
  getAll: () => api.get('/api/onboarding/influencer/all'),
};

// ─── CONNECTIONS ─────────────────────────────────────────────────────────────
// Backend: ConnectionController @ /api/connections
// GET  /api/connections/list          → accepted connections
// GET  /api/connections/pending       → pending requests for current user (received only)
// POST /api/connections/request/{id}  → send request
// PUT  /api/connections/accept/{id}   → accept
// PUT  /api/connections/reject/{id}   → reject
export const connectionApi = {
  getConnections: () => api.get('/api/connections/list'),
  getPendingRequests: () => api.get('/api/connections/pending'),
  sendRequest: (targetUserId: string) => api.post(`/api/connections/request/${targetUserId}`),
  acceptRequest: (connectionId: string) => api.put(`/api/connections/accept/${connectionId}`),
  rejectRequest: (connectionId: string) => api.put(`/api/connections/reject/${connectionId}`),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
// Backend: NotificationController @ /api/notifications
// GET  /api/notifications             → all notifications for current user
// GET  /api/notifications/unread-count
// PUT  /api/notifications/read-all
// PUT  /api/notifications/{id}/read
export const notificationApi = {
  getAll: () => api.get('/api/notifications'),
  markRead: (id: string) => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put('/api/notifications/read-all'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
};

// ─── CHAT ────────────────────────────────────────────────────────────────────
// Backend: ChatController @ /api/chat
// GET  /api/chat/history/{userId}?page=0&size=20
// POST /api/chat/send                 → { recipientId, content }
// POST /api/chat/send-media           → { recipientId, content?, attachmentUrl, attachmentName, attachmentMimeType, attachmentSize, messageType }
// POST /api/chat/read/{messageId}
export const chatApi = {
  getHistory: (userId: string, page = 0, size = 50) =>
    api.get(`/api/chat/history/${userId}`, { params: { page, size } }),
  sendMessage: (recipientId: string, content: string) =>
    api.post('/api/chat/send', { recipientId, content }),
  sendMedia: (data: {
    recipientId: string; content?: string; attachmentUrl: string;
    attachmentName: string; attachmentMimeType: string;
    attachmentSize: number; messageType: 'IMAGE' | 'DOCUMENT';
  }) => api.post('/api/chat/send-media', data),
  markRead: (messageId: string) => api.post(`/api/chat/read/${messageId}`),
  getQuota: (mentorId: string) => api.get(`/api/chat/quota/${mentorId}`),
};

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export const paymentApi = {
  createOrder: (planId: string) =>
    api.post('/api/payments/create-order', null, { params: { planId } }),
  capturePayment: (orderId: string, payerId: string) =>
    api.post('/api/payments/capture', null, { params: { orderId, payerId } }),
};

// ─── PLANS ───────────────────────────────────────────────────────────────────
export const planApi = {
  getAll: () => api.get('/api/plans'),
  create: (data: any) => api.post('/api/plans', data),
  update: (id: string, data: any) => api.put(`/api/plans/${id}`, data),
  delete: (id: string) => api.delete(`/api/plans/${id}`),
};

// ─── COHORTS ─────────────────────────────────────────────────────────────────
export const cohortApi = {
  getActive: () => api.get('/api/cohorts/active'),
  getById: (id: string) => api.get(`/api/cohorts/${id}`),
  getAll: () => api.get('/api/cohorts'),
  create: (data: any) => api.post('/api/cohorts', data),
  update: (id: string, data: any) => api.put(`/api/cohorts/${id}`, data),
  delete: (id: string) => api.delete(`/api/cohorts/${id}`),
  toggleStatus: (id: string) => api.patch(`/api/cohorts/${id}/toggle-status`),
};

// ─── EARNINGS ────────────────────────────────────────────────────────────────
export const earningsApi = {
  getSummary: () => api.get('/api/earnings/summary'),
  getAllPayments: () => api.get('/api/earnings/all-payments'),
};

// ─── OTP ─────────────────────────────────────────────────────────────────────
export const otpApi = {
  // Email OTP (requires auth)
  sendEmailVerify: () => api.post('/api/otp/send/email-verify'),
  verifyEmail: (otp: string) => api.post('/api/otp/verify/email', { otp }),
  // Phone OTP via Firebase ID token (requires auth)
  verifyFirebasePhone: (idToken: string) => api.post('/api/otp/verify/firebase-phone', { idToken }),
  // Phone OTP fallback via email delivery (requires auth)
  sendPhoneVerify: () => api.post('/api/otp/send/phone-verify'),
  verifyPhone: (otp: string) => api.post('/api/otp/verify/phone', { otp }),
  // Account deletion (requires auth)
  sendDeleteAccount: () => api.post('/api/otp/send/delete-account'),
  confirmDelete: (otp: string) => api.delete('/api/otp/confirm/delete-account', { data: { otp } }),
  // Forgot / reset password — PUBLIC endpoints (raw axios used in page, no auth header)
  forgotPassword: (identifier: string) => api.post('/api/otp/forgot-password', { identifier }),
  resetPassword: (identifier: string, otp: string, newPassword: string) =>
    api.post('/api/otp/reset-password', { identifier, otp, newPassword }),
};

// ─── CHAT QUOTA ──────────────────────────────────────────────────────────────
export const chatQuotaApi = {
  // GET /api/chat/quota/{mentorId}
  // getQuota: (mentorId: string) => api.get(\`/api/chat/quota/\${mentorId}\`),
  getQuota: (mentorId: string) => api.get(`/api/chat/quota/${mentorId}`),
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface RegisterRequest {
  firstName: string; lastName: string; email: string;
  phoneNumber: string; password: string;
  userType: 'FOUNDER' | 'INVESTOR' | 'MENTOR' | 'INFLUENCER';
}
export interface JwtResponse {
  token: string; type: string; id: string; userId?: string;
  phoneNumber: string; email: string; roles: string[];
  userType: string; onboardingStatus: string; planSelectionStatus: string;
  paymentCompleted?: boolean; firstName?: string; lastName?: string;
}

export default api;

