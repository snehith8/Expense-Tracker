import axios from 'axios';

// 1. Create dedicated Axios client instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 2. Request Interceptor: Attach Auth Token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 3. Response Interceptor: Global 401 Session Expiry Catch
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// 4. API Endpoints
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (data) => API.post('/auth/register', data),
  getProfile: () => API.get('/auth/me'),
  verifyEmail: (email) => API.post('/auth/verify-email', { email }),
  directResetPassword: (email, password) =>
    API.post('/auth/direct-reset-password', { email, password }),
  updateProfile: (data) => API.put('/auth/update-profile', data),
  deleteAccount: () => API.delete('/auth/delete-account'),
};

export const transactionsAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  getById: (id) => API.get(`/transactions/${id}`),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
};

export const dashboardAPI = {
  getSummary: () => API.get('/dashboard'),
};

// 5. Category Definitions
export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Housing',
  'Education',
  'Travel',
  'Personal Care',
  'Investment',
  'Income',
  'Other',
];

// 6. High-Contrast Modern Category Colors (Optimized for Dark & Light Glass Themes)
export const CATEGORY_COLORS = {
  'Food & Dining': '#f43f5e', // Rose
  Transportation: '#06b6d4', // Cyan
  Shopping: '#3b82f6', // Sky Blue
  Entertainment: '#8b5cf6', // Violet
  Healthcare: '#ec4899', // Pink
  Utilities: '#eab308', // Amber
  Housing: '#14b8a6', // Teal
  Education: '#f97316', // Orange
  Travel: '#a855f7', // Purple
  'Personal Care': '#d946ef', // Fuchsia
  Investment: '#10b981', // Emerald Green
  Income: '#22c55e', // Bright Green
  Other: '#64748b', // Slate Grey
};

// 7. Formatters
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

export const formatDate = (date) => {
  if (!date) return '';
  const parsed = new Date(date);
  return isNaN(parsed.getTime())
    ? ''
    : parsed.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
};

// Formats local calendar date safely without UTC timezone day-shift
export const formatDateInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default API;
