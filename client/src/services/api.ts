import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
});

export const campaignAPI = {
  list: (limit = 20, offset = 0) =>
    API.get('/campaigns', { params: { limit, offset } }),
  get: (id: string) => API.get(`/campaigns/${id}`),
  create: (data: { name: string; message: string; recipients: string[] }) =>
    API.post('/campaigns', data),
  send: (id: string) => API.post(`/campaigns/${id}/send`),
};

export const contactAPI = {
  list: (groupId?: string, limit = 20, offset = 0) =>
    API.get('/contacts', { params: { groupId, limit, offset } }),
  add: (contacts: Array<{ phone: string; name?: string }>, groupId?: string) =>
    API.post('/contacts', { contacts, groupId }),
  delete: (id: string) => API.delete(`/contacts/${id}`),
};

export const groupAPI = {
  list: () => API.get('/groups'),
  get: (id: string) => API.get(`/groups/${id}`),
  create: (data: { name: string; description?: string }) =>
    API.post('/groups', data),
  update: (id: string, data: { name: string; description?: string }) =>
    API.put(`/groups/${id}`, data),
  delete: (id: string) => API.delete(`/groups/${id}`),
};

export default API;
