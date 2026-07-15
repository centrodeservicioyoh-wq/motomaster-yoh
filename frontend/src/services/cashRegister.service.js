import api from './api';

export const cashRegisterAPI = {
  open: async (openingBalance) => {
    const response = await api.post('/cash-register/open', { openingBalance });
    return response.data;
  },
  close: async (closingBalance, notes) => {
    const response = await api.post('/cash-register/close', { closingBalance, notes });
    return response.data;
  },
  getCurrent: async () => {
    const response = await api.get('/cash-register/current');
    return response.data;
  },
  getHistory: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/cash-register/history?${params}`);
    return response.data;
  },
  getSummary: async (id) => {
    const response = await api.get(`/cash-register/${id}`);
    return response.data;
  },
};
