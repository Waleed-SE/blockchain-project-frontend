import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { full_name?: string; email?: string }) => 
    api.put('/auth/profile', data),
  sendOtp: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
};

export const walletAPI = {
  getWallet: (walletId: string) => api.get(`/wallet/${walletId}`),
  getBalance: (walletId: string) => api.get(`/wallet/${walletId}/balance`),
  getUTXOs: (walletId: string) => api.get(`/wallet/${walletId}/utxos`),
  getTransactions: (walletId: string, limit = 50, offset = 0) =>
    api.get(`/wallet/${walletId}/transactions?limit=${limit}&offset=${offset}`),
};

export const transactionAPI = {
  create: (data: any) => api.post('/transaction/create', data),
  getPending: () => api.get('/transaction/pending'),
  getTransaction: (txHash: string) => api.get(`/transaction/${txHash}`),
  getHistory: (walletId: string, limit = 50, offset = 0) =>
    api.get(`/wallet/${walletId}/transactions?limit=${limit}&offset=${offset}`),
};

export const beneficiaryAPI = {
  getAll: () => api.get('/beneficiaries'),
  add: (data: { beneficiary_wallet_id: string; nickname?: string }) =>
    api.post('/beneficiaries', data),
  delete: (id: string) => api.delete(`/beneficiaries/${id}`),
};

export const blockchainAPI = {
  getBlocks: (limit = 50, offset = 0) =>
    api.get(`/blockchain/blocks?limit=${limit}&offset=${offset}`),
  getBlock: (index: number) => api.get(`/blockchain/block/${index}`),
  validate: () => api.get('/blockchain/validate'),
  mine: () => api.post('/blockchain/mine'),
  getInfo: () => api.get('/blockchain/info'),
  getMiningStats: () => api.get('/blockchain/mining-stats'),
};

export const zakatAPI = {
  getRecords: (walletId: string) => api.get(`/zakat/records?wallet_id=${walletId}`),
  getPool: () => api.get('/zakat/pool'),
  trigger: () => api.post('/zakat/trigger'),
};

export const logsAPI = {
  getTransactionLogs: (walletId: string, limit = 50, offset = 0) =>
    api.get(`/logs/transaction?wallet_id=${walletId}&limit=${limit}&offset=${offset}`),
  getSystemLogs: (type?: string, limit = 100, offset = 0) => {
    const typeParam = type ? `&type=${type}` : '';
    return api.get(`/logs/system?limit=${limit}&offset=${offset}${typeParam}`);
  },
};

export const reportsAPI = {
  getMonthly: (walletId: string) => api.get(`/reports/monthly/${walletId}`),
  getAnalytics: () => api.get('/reports/analytics'),
};

export default api;
