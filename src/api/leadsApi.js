import authApi from './authApi';

export const getLeads = async (params) => {
  const response = await authApi.get('/contact/submissions', { params });
  return response.data;
};

export const updateLeadStatus = async (id, status) => {
  const response = await authApi.put(`/contact/submissions/${id}/status`, { status });
  return response.data;
};
