// src/api/authApi.js
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`; 

export const loginUser = async ({ email, password }) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data; // { token, user, etc. }
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
};

export const sendOtp = async (email) => {
  const res = await fetch(`${BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  let data;
  try {
    data = await res.json(); // This will fail if response is HTML
  } catch (err) {
    throw new Error('Server error: Invalid JSON response',err);
  }

  if (!res.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }

  return data;
};



export const resetPassword = async ({ email, otp, newPassword }) => {
  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Reset failed');
  return data;
};
