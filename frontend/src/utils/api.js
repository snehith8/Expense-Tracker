import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const transactionsAPI = {
  getAll: (params) => axios.get('/transactions', { params }),
  getById: (id) => axios.get(`/transactions/${id}`),
  create: (data) => axios.post('/transactions', data),
  update: (id, data) => axios.put(`/transactions/${id}`, data),
  delete: (id) => axios.delete(`/transactions/${id}`),
};

export const dashboardAPI = {
  getSummary: () => axios.get('/dashboard'),
};

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

export const CATEGORY_COLORS = {
  'Food & Dining': '#FF6B6B',
  Transportation: '#4ECDC4',
  Shopping: '#45B7D1',
  Entertainment: '#96CEB4',
  Healthcare: '#FFEAA7',
  Utilities: '#DDA0DD',
  Housing: '#98D8C8',
  Education: '#F7DC6F',
  Travel: '#BB8FCE',
  'Personal Care': '#F0B27A',
  Investment: '#82E0AA',
  Income: '#52BE80',
  Other: '#AEB6BF',
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount || 0);

export const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

export const formatDateInput = (date) =>
  date ? new Date(date).toISOString().split('T')[0] : '';
