import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.PROD
    ? 'https://hospital-management-system-oklk.onrender.com/api'
    : 'http://localhost:5000/api'
);

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and optionally redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login'; // Let the context handle it generally
    }
    return Promise.reject(error);
  }
);

export default api;
