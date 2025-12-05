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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Interceptor caught error:', error);
    if (error.response) {
      console.log('Error status:', error.response.status);
    }
    if (error.response && error.response.status === 401) {
      console.log('Interceptor 401 triggered');
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const response = await api.post('/users/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
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
