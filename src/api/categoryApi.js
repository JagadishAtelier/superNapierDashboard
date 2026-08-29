import api from "./authApi";

/**
 * GET all categories
 */
export const getAllCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

/**
 * GET a single category by ID
 * @param {string} categoryId
 */
export const getCategoryById = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
};

/**
 * CREATE a new category
 * @param {object} categoryData
 */
export const createCategory = async (categoryData) => {
  const response = await api.post("/categories", categoryData);
  return response.data;
};

/**
 * UPDATE a category by ID
 * @param {string} categoryId
 * @param {object} updatedData
 */
export const updateCategory = async (categoryId, updatedData) => {
  const response = await api.put(`/categories/${categoryId}`, updatedData);
  return response.data;
};

/**
 * DELETE a category by ID
 * @param {string} categoryId
 */
export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`);
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
  const response = await api.post(`/categories/${categoryId}/subcategory`, subcategoryData);
  return response.data;
};

/**
 * DELETE a subcategory by index from a category
 * @param {string} categoryId
 * @param {number} subIndex
 */
export const deleteSubcategory = async (categoryId, subIndex) => {
  const response = await api.delete(`/categories/${categoryId}/subcategory/${subIndex}`);
  return response.data;
};

