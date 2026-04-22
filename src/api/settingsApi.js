import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getSettings = () => axios.get(`${API_URL}/settings`);
export const updateSettings = (data) => axios.put(`${API_URL}/settings`, data);
