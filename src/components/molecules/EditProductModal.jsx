import { useEffect, useState } from "react";

export default function EditProductModal({ isOpen, onClose, product, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    price: '',
    status: 'Active',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        stock: product.stock || 0,
        price: product.price || '',
        status: product.status || 'Active',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = () => {
    onSave({ ...product, ...formData });
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 text-xl hover:text-red-500"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Category</label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-sm"
              min={0}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Price</label>
            <input
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
