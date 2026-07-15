import api from './api';

export const saleAPI = {
  create: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/sales');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  getTodaySales: async () => {
    const response = await api.get('/sales/today');
    return response.data;
  },
};
