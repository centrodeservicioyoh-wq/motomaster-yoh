import api from './api';

export const workOrderAPI = {
  create: async (data) => {
    const response = await api.post('/work-orders', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/work-orders');
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/work-orders/active');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/work-orders/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/work-orders/${id}/status`, { status });
    return response.data;
  },

  addParts: async (id, items) => {
    const response = await api.post(`/work-orders/${id}/parts`, { items });
    return response.data;
  },

  addLabor: async (id, data) => {
    const response = await api.post(`/work-orders/${id}/labor`, data);
    return response.data;
  },

  finalize: async (id, data) => {
    const response = await api.put(`/work-orders/${id}/finalize`, data);
    return response.data;
  },
};
