import axios from "axios";

// ✅ Ensure this is set in your `.env` file like: VITE_API_BASE_URL=https://yourdomain.com
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/products`;

/**
 * GET all products
 */
export const getAllProducts = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

/**
 * GET a single product by ID
 * @param {string} productId
 */
export const getProductById = async (productId) => {
  const response = await axios.get(`${BASE_URL}/${productId}`);
  return response.data;
};

/**
 * CREATE a new product
 * @param {object} productData
 */
export const createProduct = async (productData) => {
  const response = await axios.post(BASE_URL, productData);
  return response.data;
};

/**
 * UPDATE a product by ID
 * @param {string} productId
 * @param {object} updatedData
 */
export const updateProduct = async (productId, updatedData) => {
  const response = await axios.put(`${BASE_URL}/${productId}`, updatedData);
  return response.data;
};

/**
 * DELETE a product by ID
 * @param {string} productId
 */
export const deleteProduct = async (productId) => {
  const response = await axios.delete(`${BASE_URL}/${productId}`);
  return response.data;
};
