import axios from 'axios';

/**
 * Axios instance terpusat
 * Sesuai panduan AGENTS.md
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
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
