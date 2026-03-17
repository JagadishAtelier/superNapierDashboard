import axios from "axios";

// ✅ Ensure this is set in your `.env` like: VITE_API_BASE_URL=https://yourdomain.com
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/categories`;

/**
 * GET all categories
 */
export const getAllCategories = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

/**
 * GET a single category by ID
 * @param {string} categoryId
 */
export const getCategoryById = async (categoryId) => {
  const response = await axios.get(`${BASE_URL}/${categoryId}`);
  return response.data;
};

/**
 * CREATE a new category
 * @param {object} categoryData
 */
export const createCategory = async (categoryData) => {
  const response = await axios.post(BASE_URL, categoryData);
  return response.data;
};

/**
 * UPDATE a category by ID
 * @param {string} categoryId
 * @param {object} updatedData
 */
export const updateCategory = async (categoryId, updatedData) => {
  const response = await axios.put(`${BASE_URL}/${categoryId}`, updatedData);
  return response.data;
};

/**
 * DELETE a category by ID
 * @param {string} categoryId
 */
export const deleteCategory = async (categoryId) => {
  const response = await axios.delete(`${BASE_URL}/${categoryId}`);
  return response.data;
};

// ------------------------------
// SUBCATEGORY OPERATIONS
// ------------------------------

/**
 * ADD a subcategory to a category
 * @param {string} categoryId
 * @param {object} subcategoryData
 */
export const addSubcategory = async (categoryId, subcategoryData) => {
  const response = await axios.post(`${BASE_URL}/${categoryId}/subcategory`, subcategoryData);
  return response.data;
};

/**
 * DELETE a subcategory by index from a category
 * @param {string} categoryId
 * @param {number} subIndex
 */
export const deleteSubcategory = async (categoryId, subIndex) => {
  const response = await axios.delete(`${BASE_URL}/${categoryId}/subcategory/${subIndex}`);
  return response.data;
};
