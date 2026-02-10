import axios from 'axios';

import { useAuth } from '@/hooks/use-auth';

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies (refreshToken)
});

// Request Interceptor
http.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
http.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !error.response?.data.error &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        // We assume the refreshToken is stored in an HttpOnly cookie
        // and sent automatically with this request.
        // The endpoint returns a new accessToken.
        const response = await http.post('/api/users/auth/refresh');

        const { accessToken } = response.data;

        // Update store with new token
        useAuth.getState().setAccessToken(accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return http(originalRequest);
      } catch (refreshError: any) {
        // Refresh failed, logout user
        useAuth.getState().clearAuthState();
        return Promise.reject(refreshError.response?.data);
      }
    }

    return Promise.reject(error.response?.data);
  },
);

export default http;
