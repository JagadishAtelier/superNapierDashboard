import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/coupons`;

// ------------------------------
//  COUPON CRUD APIS
// ------------------------------

// Get all coupons
export const getAllCoupons = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

// Get coupon by ID
export const getCouponById = async (couponId) => {
  const res = await axios.get(`${BASE_URL}/${couponId}`);
  return res.data;
};

// Create coupon
export const createCoupon = async (couponData) => {
  const res = await axios.post(BASE_URL, couponData);
  return res.data;
};

// Update coupon
export const updateCoupon = async (couponId, couponData) => {
  const res = await axios.put(`${BASE_URL}/${couponId}`, couponData);
  return res.data;
};

// Delete coupon
export const deleteCoupon = async (couponId) => {
  const res = await axios.delete(`${BASE_URL}/${couponId}`);
  return res.data;
};

// ------------------------------
// VERIFY COUPON
// ------------------------------

export const verifyCoupon = async (couponCode) => {
  const res = await axios.post(`${BASE_URL}/verify`, {
    code: couponCode,
  });
  return res.data;
};
