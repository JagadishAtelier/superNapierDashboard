import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/shiprocket`; // Adjust if necessary

export const assignAwb = (orderId) => axios.post(`${BASE_URL}/assign-awb`, { orderId });
export const trackShipment = (orderId) => axios.get(`${BASE_URL}/track/${orderId}`);
export const getLabel = (orderId) => axios.get(`${BASE_URL}/label/${orderId}`, {
  responseType: "blob",
});
