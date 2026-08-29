// src/api/dashboardApi.js
const BASE_URL = `${import.meta.env.VITE_API_URL}/dashboard`;


export const getDashboard = async (range = "30", signal = null, token = null) => {
  const resolvedToken =
    token ||
    (typeof window !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("accessToken"))) ||
    null;

  const headers = { "Content-Type": "application/json" };
  if (resolvedToken) headers.Authorization = `Bearer ${resolvedToken}`;

  const res = await fetch(`${BASE_URL}?range=${range}`, {
    method: "GET",
    headers,
    signal,
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(`Server error: invalid JSON response (status ${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }

  return data;
};

export const getDistributionMap = async (token = null) => {
  const resolvedToken =
    token ||
    (typeof window !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("accessToken"))) ||
    null;

  const headers = { "Content-Type": "application/json" };
  if (resolvedToken) headers.Authorization = `Bearer ${resolvedToken}`;

  const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/distribution-map`, {
    method: "GET",
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(`Server error: invalid JSON response (status ${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }

  return data;
};

export default {
  getDashboard,
  getDistributionMap
};
