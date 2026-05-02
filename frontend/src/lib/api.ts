import axios from 'axios';

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    try {
      const s = JSON.parse(localStorage.getItem('q-auth') || '{}');
      const token = s?.state?.token;
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('q-auth');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);
