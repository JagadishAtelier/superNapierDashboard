import api from "./authApi";

const BASE_PATH = "/blog";

export const getAllBlogs = async () => {
  const response = await api.get(BASE_PATH);
  return response.data;
};

export const getBlogById = async (id) => {
  const response = await api.get(`${BASE_PATH}/${id}`);
  return response.data;
};

export const createBlog = async (blogData) => {
  const response = await api.post(BASE_PATH, blogData);
  return response.data;
};

export const updateBlog = async (id, updatedData) => {
  const response = await api.put(`${BASE_PATH}/${id}`, updatedData);
  return response.data;
};

export const deleteBlog = async (id) => {
  const response = await api.delete(`${BASE_PATH}/${id}`);
  return response.data;
};

