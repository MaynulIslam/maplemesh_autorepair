import axios from 'axios';

const api = axios.create({
  // Prefer env override; default to IPv4 loopback to avoid Windows IPv6 localhost issues
  baseURL: import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8001',
  timeout: 10000 // fail fast instead of hanging forever
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;