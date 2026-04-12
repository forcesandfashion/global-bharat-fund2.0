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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('nebula_token');
      Cookies.remove('nebula_user');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: RegisterRequest) => api.post('/api/auth/register', data),
  login: (data: LoginRequest) => api.post('/api/auth/login', data),
  selectMentorAndPlan: (phoneNumber: string, mentorId: string, planId: string) =>
    api.post('/api/auth/founder/select-mentor-plan', null, { params: { phoneNumber, mentorId, planId } }),
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const userApi = {
  getAllUsers: () => api.get('/api/users'),
  getUserById: (id: string) => api.get(`/api/users/${id}`),
  updateProfile: (data: any) => api.put('/api/users/profile', data),
  blockUser: (userId: string, reason: string, permanent: boolean) =>
    api.post('/api/users/block', { userId, reason, permanent }),
};

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
export const founderApi = {
  getProfile: () => api.get('/api/founder/onboarding'),
  savePersonalInfo: (data: any) => api.put('/api/founder/onboarding/personal-info', data),
  saveIdentity: (data: any) => api.put('/api/founder/onboarding/identity', data),
  saveAddress: (data: any) => api.put('/api/founder/onboarding/address', data),
  saveBankGst: (data: any) => api.put('/api/founder/onboarding/bank-gst', data),
  savePitchDeck: (data: any) => api.put('/api/founder/onboarding/pitch-deck', data),
  saveDeclaration: (data: any) => api.put('/api/founder/onboarding/declaration', data),
  getAll: () => api.get('/api/founder/onboarding/all'),
};

export const investorApi = {
  getProfile: () => api.get('/api/investor/onboarding'),
  savePersonalInfo: (data: any) => api.put('/api/investor/onboarding/personal-info', data),
  saveIdentity: (data: any) => api.put('/api/investor/onboarding/identity', data),
  saveAddress: (data: any) => api.put('/api/investor/onboarding/address', data),
  saveBankGst: (data: any) => api.put('/api/investor/onboarding/bank-gst', data),
  saveInvestmentProfile: (data: any) => api.put('/api/investor/onboarding/investment-profile', data),
  saveDeclaration: (data: any) => api.put('/api/investor/onboarding/declaration', data),
  getAll: () => api.get('/api/investor/onboarding/all'),
};

export const mentorApi = {
  getProfile: () => api.get('/api/mentor/onboarding'),
  savePersonalInfo: (data: any) => api.put('/api/mentor/onboarding/personal-info', data),
  getAll: () => api.get('/api/mentor/onboarding/all'),
  saveAll: () => api.get('/api/mentor/onboarding/all'), // alias for backward compat
};

export const influencerApi = {
  getProfile: () => api.get('/api/influencer/onboarding'),
  savePersonalInfo: (data: any) => api.put('/api/influencer/onboarding/personal-info', data),
  getAll: () => api.get('/api/influencer/onboarding/all'),
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentApi = {
  createOrder: (planId: string) => api.post('/api/payments/create-order', null, { params: { planId } }),
  capturePayment: (orderId: string, payerId: string) =>
    api.post('/api/payments/capture', null, { params: { orderId, payerId } }),
};

// ─── PLANS ────────────────────────────────────────────────────────────────────
export const planApi = {
  getAll: () => api.get('/api/plans'),
  create: (data: any) => api.post('/api/plans', data),
  update: (id: string, data: any) => api.put(`/api/plans/${id}`, data),
  delete: (id: string) => api.delete(`/api/plans/${id}`),
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  userType: 'FOUNDER' | 'INVESTOR' | 'MENTOR' | 'INFLUENCER';
}

export interface LoginRequest {
  phoneNumber?: string;
  email?: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: string;           // backend sends "id" (MongoDB _id)
  userId?: string;      // alias used by frontend store
  phoneNumber: string;
  email: string;
  roles: string[];      // Set<String> serialised as array
  userType: string;     // UserType enum name
  onboardingStatus: string;
  planSelectionStatus: string;
  paymentCompleted?: boolean;
  firstName?: string;   // not in JWT response — fetched separately or stored from register
  lastName?: string;
}

export default api;
