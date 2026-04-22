import api from "./authApi";

const BASE_PATH = "/orders";

export const getOrders = () => api.get(BASE_PATH);
export const getOrderById = (id) => api.get(`${BASE_PATH}/${id}`);
export const createOrder = (data) => api.post(BASE_PATH, data);
export const updateOrder = (id, data) => api.put(`${BASE_PATH}/${id}`, data);
export const deleteOrder = (id) => api.delete(`${BASE_PATH}/${id}`);
export const updateOrderStatus = (orderId, status) => {
  return api.put(`${BASE_PATH}/${orderId}/adminorderstatus`, { status });
};

export const getUnreadOrders = () => api.get(`${BASE_PATH}/unread`);
export const markOrderAsRead = (id) => api.patch(`${BASE_PATH}/${id}/read`);
