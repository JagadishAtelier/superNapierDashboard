import { useState, useRef } from "react";
import { uploadToCloudinary } from "../../api/imageUpload";

export default function CreateCategoryModal({ open, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: "",
    // tamilName: "",
    description: "",
    // tamilDescription: "",
    image: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  // handle main category form
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // File Handling (category + subcategory)
  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e) => {
    handleFile(e.target.files[0], "category");
  };
  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };


  // Submit full category with subcategories
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Category names are required");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image;

      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile);
      }

      await onCreate({
        ...formData,
        image: imageUrl,
      });

      // reset form
      setFormData({
        name: "",
        // tamilName: "",
        description: "",
        // tamilDescription: "",
        image: "",
      });
      setSelectedFile(null);
      setPreview(null);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>

        {/* Category Fields */}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Category Name"
          className="w-full p-2 mb-3 border rounded"
        />
        {/* Tamil Name */}
        {/* <input
          type="text"
          name="tamilName"
          value={formData.tamilName}
          onChange={handleChange}
          placeholder="Category Name (Tamil)"
          className="w-full p-2 mb-3 border rounded"
        /> */}
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 mb-3 border rounded"
        />

        {/* Tamil Description */}
        {/* <textarea
          name="tamilDescription"
          value={formData.tamilDescription}
          onChange={handleChange}
          placeholder="Description (Tamil)"
          className="w-full p-2 mb-3 border rounded"
        /> */}

        {/* Category Image */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
          className="w-full h-40 border-2 border-dashed rounded flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 cursor-pointer mb-4"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="h-full object-contain" />
          ) : (
            <p>Drag & drop category image, or click to upload</p>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>


        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
