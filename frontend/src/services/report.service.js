import api from './api';

export const reportAPI = {
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  getSalesByPeriod: async (period = 'week') => {
    const response = await api.get(`/reports/sales?period=${period}`);
    return response.data;
  },

  getTopProducts: async (limit = 10) => {
    const response = await api.get(`/reports/top-products?limit=${limit}`);
    return response.data;
  },

  getMechanicPerformance: async () => {
    const response = await api.get('/reports/mechanics');
    return response.data;
  },

  getInventoryValue: async () => {
    const response = await api.get('/reports/inventory');
    return response.data;
  },

  getWorkOrderSummary: async () => {
    const response = await api.get('/reports/work-orders');
    return response.data;
  },
};
