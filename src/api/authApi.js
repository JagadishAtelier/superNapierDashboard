import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = async ({ email, password }) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // { token, user, etc. }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const sendOtp = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send OTP');
  }
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Reset failed');
  }
};

export default api;
