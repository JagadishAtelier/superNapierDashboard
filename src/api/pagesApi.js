import api from "./authApi";

export const getPageContent = (pageId) => api.get(`/pages/${pageId}`);
export const updatePageContent = (pageId, data) => api.put(`/pages/${pageId}`, data);
