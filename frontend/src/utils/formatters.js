/**
 * Helper formatters mata uang, tanggal, dan status unit showroom
 */

export const formatRupiah = (number) => {
  if (number === null || number === undefined || isNaN(number)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  return new Intl.NumberFormat('id-ID').format(number);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch (e) {
    return dateString;
  }
};

export const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'tersedia':
      return {
        label: 'Tersedia',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'perbaikan':
      return {
        label: 'Dalam Perbaikan',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'booking':
      return {
        label: 'Sudah Dibooking',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'terjual':
      return {
        label: 'Terjual',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };
    default:
      return {
        label: status || 'Unknown',
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
};

export const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export const getFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${getBackendBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
};

