/**
 * Pusat Konfigurasi Endpoint API
 * Sesuai Standar Baseline & Aturan AGENTS.md
 * HINDARI hardcode URL endpoint di dalam komponen/halaman!
 */

export const API_ENDPOINTS = {
  // Baseline Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // Manajemen Akun Admin / Pengguna
  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
  },

  // Master Data Merek Mobil (Dinamis)
  BRANDS: {
    LIST: "/brands",
    DETAIL: (id) => `/brands/${id}`,
    CREATE: "/brands",
    UPDATE: (id) => `/brands/${id}`,
    DELETE: (id) => `/brands/${id}`,
  },

  // Dashboard Overview
  DASHBOARD: {
    STATS: "/dashboard/stats",
  },

  // Manajemen Unit Pickup (Stok / Unit Masuk)
  CARS: {
    LIST: "/cars",
    DETAIL: (id) => `/cars/${id}`,
    CREATE: "/cars",
    UPDATE: (id) => `/cars/${id}`,
    DELETE: (id) => `/cars/${id}`,
  },

  // Biaya Perbaikan / Rekondisi
  REPAIRS: {
    LIST_BY_CAR: (carId) => `/cars/${carId}/repairs`,
    CREATE: (carId) => `/cars/${carId}/repairs`,
    DELETE: (id) => `/repairs/${id}`,
  },

  // Transaksi Penjualan & Data Pembeli
  SALES: {
    LIST: "/sales",
    CREATE: "/sales",
    DELETE: (id) => `/sales/${id}`,
  },

  // Laporan & Ekspor Excel
  REPORTS: {
    SALES: "/reports/sales",
    EXPORT_EXCEL: "/reports/sales/export-excel",
  },
};
