import { useEffect, useRef, useState } from "react";
import { BoxIcon, Pencil, Trash2, UploadCloud } from "lucide-react";
import CreateCategoryModal from "../components/molecules/CreateCategoryModal";
import {
  getAllCategories,
  updateCategory,
  createCategory,
  deleteCategory,
} from "../api/categoryApi";
import { uploadToCloudinary } from "../api/imageUpload";

export default function CategoryPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const [successMessage, setSuccessMessage] = useState(""); // ✅ Success message state
  const [editLoading, setEditLoading] = useState(false); // loading state for edit
  const [editError, setEditError] = useState(""); // error message state

  // Fetch all categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  // ✅ Handle file upload for edit modal (uploads to Cloudinary)
  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setEditLoading(true);
      // uploads to Cloudinary; folder "categories"
      const uploadedUrl = await uploadToCloudinary(file, "categories");
      setEditingCategory((prev) => ({ ...(prev || {}), image: uploadedUrl }));
      setPreviewImage(uploadedUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      setEditError("Failed to upload image. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle edit category
  const handleEdit = async () => {
    setEditLoading(true);
    setEditError("");
    try {
      await updateCategory(editingCategory._id, editingCategory);

      // Show success message
      setSuccessMessage("Category updated successfully!");

      // Re-fetch categories
      await fetchCategories();

      // Reset states
      setEditingCategory(null);
      setPreviewImage(null);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update category", error);
      setEditError("Failed to update category. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete category
  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter((cat) => cat._id !== id));
      setDeletingCategory(null);

      setSuccessMessage("Category deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete category", error);
      alert("Failed to delete category. Please try again.");
    }
  };

  // Handle create category
  const handleCreateCategory = async (data) => {
    try {
      const newCat = await createCategory(data);
      setCategories([...categories, newCat]);

      setSuccessMessage("Category created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to create category", err);
      alert("Failed to create category. Please try again.");
    }
  };

  return (
    <div className="p-6">
      {/* ✅ Success Toast */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fadeIn">
          {successMessage}
        </div>
      )}

      <div className="flex justify-between h-10 my-5">
        <h1 className="text-2xl font-semibold mb-6">Manage Categories</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm text-white bg-green-700 hover:bg-green-600"
        >
          <BoxIcon size={16} /> Add Category
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white rounded shadow">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Category Image</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat._id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{i + 1}</td>
                <td className="py-3 px-4">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">{cat.name}</td>
                <td className="py-3 px-4">{cat.description}</td>
                <td className="py-3 px-4 flex gap-4 text-center">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setPreviewImage(null);
                      setEditError("");
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => setDeletingCategory(cat)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Category</h2>

            {/* ✅ Image Upload (uploads to Cloudinary) */}
            <div
              onClick={() => fileInputRef.current.click()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFileUpload(file);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="group relative w-full h-40 border-2 border-dashed rounded flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 cursor-pointer mb-4 overflow-hidden"
            >
              {previewImage || editingCategory.image ? (
                <img
                  src={previewImage || editingCategory.image}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <p>Drag & drop an image here, or click to upload</p>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <UploadCloud size={32} />
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </div>

            <input
              type="text"
              value={editingCategory.name}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
              className="w-full p-2 mb-4 border rounded"
              placeholder="Category Name (English)"
            />
            {/* <input
              type="text"
              value={editingCategory.tamilName || ""}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, tamilName: e.target.value })
              }
              className="w-full p-2 mb-4 border rounded"
              placeholder="Category Name (Tamil)"
            /> */}
            <textarea
              value={editingCategory.description}
              onChange={(e) =>
                setEditingCategory({
                  ...editingCategory,
                  description: e.target.value,
                })
              }
              className="w-full p-2 mb-4 border rounded"
              placeholder="Description (English)"
            />
            {/* <textarea
              value={editingCategory.tamilDescription || ""}
              onChange={(e) =>
                setEditingCategory({
                  ...editingCategory,
                  tamilDescription: e.target.value,
                })
              }
              className="w-full p-2 mb-4 border rounded"
              placeholder="Description (Tamil)"
            /> */}

            <div className="flex justify-end gap-2 items-center">
              {editError && <span className="text-red-600 mr-auto">{editError}</span>}
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setPreviewImage(null);
                  setEditError("");
                }}
                className="px-4 py-2 text-gray-600"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className={`px-4 py-2 text-white rounded ${
                  editLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={editLoading}
              >
                {editLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateCategoryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCategory}
      />

      {/* Delete Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Delete Category</h2>
            <p>Are you sure you want to delete "{deletingCategory.name}"?</p>
            <div className="flex justify-end mt-6 gap-2">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingCategory._id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional CSS animation for toast */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}
