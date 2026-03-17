// src/api/dashboardApi.js
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/dashboard`;


export const getDashboard = async (token) => {
  const resolvedToken =
    token ||
    (typeof window !== "undefined" && (localStorage.getItem("token") || localStorage.getItem("accessToken"))) ||
    null;

  const headers = { "Content-Type": "application/json" };
  if (resolvedToken) headers.Authorization = `Bearer ${resolvedToken}`;

  const res = await fetch(`${BASE_URL}`, {
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
};
