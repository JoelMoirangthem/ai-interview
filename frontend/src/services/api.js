import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  }),
  get: () => api.get('/resume'),
  updateProfile: (data) => api.put('/resume/profile', data)
};

export const interviewAPI = {
  getModes: () => api.get('/interview/modes'),
  start: (mode) => api.post('/interview/start', { mode }),
  respond: (interviewId, answer) => api.post('/interview/respond', { interviewId, answer }),
  complete: (id) => api.post(`/interview/${id}/complete`),
  get: (id) => api.get(`/interview/${id}`),
  getHistory: () => api.get('/interview/history')
};

export const codeAPI = {
  execute: (data) => api.post('/code/execute', data),
  submit: (data) => api.post('/code/submit', data)
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getProgress: () => api.get('/analytics/progress')
};

export default api;
