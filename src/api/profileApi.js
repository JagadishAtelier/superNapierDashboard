import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

// Set auth headers helper
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchUserProfile = () => {
  return axios.get(`${BASE_URL}/profile`, getAuthHeaders());
};

export const updateUserProfile = (profileData) => {
  return axios.put(`${BASE_URL}/profile`, profileData, getAuthHeaders());
};

export const changeUserPassword = (currentPassword, newPassword) => {
  return axios.put(
    `${BASE_URL}/password`,
    { currentPassword, newPassword },
    getAuthHeaders()
  );
};
