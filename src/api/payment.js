import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/payment`;

// ✅ Get all payments
export const getPayments = async () => {
  const res = await axios.get(`${BASE_URL}/list`);
  return res.data;
};

// ✅ Refund a payment
export const refundPayment = async (paymentId) => {
  const res = await axios.post(`${BASE_URL}/refund`, { payment_id: paymentId });
  return res.data;
};

// ✅ Get Razorpay settlements (optionally by date range)
export const getSettlements = async (from, to) => {
  const res = await axios.get(`${BASE_URL}/settlements`, {
    params: { from, to },
  });
  return res.data;
};
