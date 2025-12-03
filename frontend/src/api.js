import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (email, password) => {
  const response = await api.post('/users/token', { email, password });
  return response.data;
};

export const register = async (email, password) => {
  const response = await api.post('/users/', { email, password });
  return response.data;
};

export const uploadActivity = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/activities/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getActivities = async () => {
  const response = await api.get('/activities/');
  return response.data;
};

export const getActivity = async (id) => {
  const response = await api.get(`/activities/${id}`);
  return response.data;
};

export const deleteActivity = async (id) => {
  const response = await api.delete(`/activities/${id}`);
  return response.data;
};

export default api;
