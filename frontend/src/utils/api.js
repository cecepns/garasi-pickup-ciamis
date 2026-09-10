import axios from 'axios';

/**
 * Axios instance terpusat
 * Sesuai panduan AGENTS.md
 */
const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  'https://api.kingcreativestudio.my.id/garasi-pickup-ciamis/api';

// Normalisasi URL agar selalu mengarah ke path /api
const baseApiUrl = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

export const api = axios.create({
  baseURL: baseApiUrl,
  timeout: 30000,
});

// Response interceptor untuk standardisasi penanganan error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan saat menghubungi server.';
    return Promise.reject(new Error(message));
  }
);
