import { api } from './api';

/**
 * Reusable request helper wrapper
 * Menyederhanakan penanganan request HTTP dengan format seragam
 */
export const request = {
  get: async (url, configOrParams = {}) => {
    const config =
      configOrParams && typeof configOrParams === 'object' && 'params' in configOrParams
        ? configOrParams
        : { params: configOrParams };
    const response = await api.get(url, config);
    return response.data;
  },

  post: async (url, data = {}, config = {}) => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  put: async (url, data = {}, config = {}) => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  delete: async (url, params = {}) => {
    const response = await api.delete(url, { params });
    return response.data;
  },

  /**
   * Helper untuk upload file/gambar via FormData
   */
  upload: async (url, formData, method = 'post') => {
    const response = await api({
      method,
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
