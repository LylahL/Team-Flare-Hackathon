import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create an axios instance with default configurations
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    // Handle authentication errors
    if (status === 401) {
      localStorage.removeItem('authToken');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }

    // Handle server errors
    if (status && status >= 500) {
      console.error('Server error:', error);
      // You could dispatch to a notification system here
    }

    return Promise.reject(error);
  }
);

export default api;

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Handle server errors
    if (error.response?.status === 500) {
      console.error('Server error:', error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API operations
const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.get(url, config).then((response: AxiosResponse<T>) => response.data),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.post(url, data, config).then((response: AxiosResponse<T>) => response.data),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.put(url, data, config).then((response: AxiosResponse<T>) => response.data),
  
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => 
    api.patch(url, data, config).then((response: AxiosResponse<T>) => response.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    api.delete(url, config).then((response: AxiosResponse<T>) => response.data),
};

export default apiService;

