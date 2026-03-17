import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/blog`;


export const getAllBlogs = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const getBlogById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};


export const createBlog = async (categoryData) => {
  const response = await axios.post(BASE_URL, categoryData);
  return response.data;
};


export const updateBlog = async (id, updatedData) => {
  const response = await axios.put(`${BASE_URL}/${id}`, updatedData);
  return response.data;
};


export const deleteBlog = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};

