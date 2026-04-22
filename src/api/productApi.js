import api from "./authApi";

const BASE_PATH = "/products";

/**
 * GET all products
 */
export const getAllProducts = async () => {
  const response = await api.get(BASE_PATH);
  return response.data;
};

/**
 * GET a single product by ID
 * @param {string} productId
 */
export const getProductById = async (productId) => {
  const response = await api.get(`${BASE_PATH}/${productId}`);
  return response.data;
};

/**
 * CREATE a new product
 * @param {object} productData
 */
export const createProduct = async (productData) => {
  const response = await api.post(BASE_PATH, productData);
  return response.data;
};

/**
 * UPDATE a product by ID
 * @param {string} productId
 * @param {object} updatedData
 */
export const updateProduct = async (productId, updatedData) => {
  const response = await api.put(`${BASE_PATH}/${productId}`, updatedData);
  return response.data;
};

/**
 * DELETE a product by ID
 * @param {string} productId
 */
export const deleteProduct = async (productId) => {
  const response = await api.delete(`${BASE_PATH}/${productId}`);
  return response.data;
};
