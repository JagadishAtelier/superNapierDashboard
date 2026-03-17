import {
  FileText,
  Printer,
  SearchIcon,
  PencilIcon,
  Trash2,
  BoxIcon,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { getAllProducts, deleteProduct } from "../../api/productApi";

// 🔹 Small component to handle auto-rotating product images
function ProductImageSlider({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <img
      src={images[currentIndex]}
      alt="thumb"
      title={title}
      className="w-10 h-10 rounded-full object-cover border"
    />
  );
}

export default function ProductList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all products (category info already included)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productResponse = await getAllProducts();
        const products = productResponse.data;
        console.log("Fetched products:", products);
        setProducts(products);
      } catch (error) {
        console.error("Failed to fetch products", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Filter logic with category._id and category.name support
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((p) => {
      const matchesSearch =
        (p.name + p._id + (p.category?.name || ""))
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus = statusFilter ? p.status === statusFilter : true;
      const matchesCategory = categoryFilter
        ? p.category?._id === categoryFilter
        : true;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [search, statusFilter, categoryFilter, products]);

  // ✅ Export filtered data to Excel
  const exportToExcel = () => {
    const data = filteredProducts.map((p) => ({
      ID: p._id,
      Name: p.name,
      Category: p.category?.name || "N/A",
      Stock: p.stock || "N/A",
      Price:
        p.weightOptions.find((w) => w.weight === 1000)?.price ||
        p.weightOptions[0]?.price ||
        "N/A",
      Status: p.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "products.xlsx");
  };

  // ✅ Export filtered data to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["ID", "Name", "Category", "Stock", "Price", "Status"]],
      body: filteredProducts.map((p) => [
        p._id,
        p.name,
        p.category?.name || "N/A",
        p.stock || "N/A",
        p.weightOptions.find((w) => w.weight === 1000)?.price ||
          p.weightOptions[0]?.price ||
          "N/A",
        p.status,
      ]),
    });
    doc.save("products.pdf");
  };

  // ✅ Edit
  const handleEditClick = (product) => {
    navigate(`/editproduct/${product._id}`);
  };

  // ✅ Delete with Undo Toast
  const handleDeleteClick = (product) => {
    setProducts((prev) => prev.filter((p) => p._id !== product._id));

    let undoCalled = false;

    const undo = () => {
      undoCalled = true;
      setProducts((prev) => [product, ...prev]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSearch("");
      setStatusFilter("");
      setCategoryFilter("");
    };

    toast(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm">
            Deleted <b>{product.name}</b>
          </span>
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => {
              undo();
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000 }
    );

    setTimeout(() => {
      if (!undoCalled) {
        deleteProduct(product._id)
          .then(() => {
            toast.success(`${product.name} deleted from server.`);
          })
          .catch(() => {
            toast.error(`Failed to delete ${product.name} from server.`);
            setProducts((prev) => [product, ...prev]);
          });
      }
    }, 5000);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <span className="ml-3 text-blue-600 font-semibold text-lg">
          Loading...
        </span>
      </div>
    );

  return (
    <div className="p-4 sm:p-5">
      <h2 className="text-xl font-semibold mb-4">Product List</h2>

      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name, ID or category"
            className="w-full h-10 rounded-md border px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchIcon
            size={16}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/addproducts")}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm text-[#280a03] bg-[#ffcc0f] hover:bg-[#ffcc0f]"
          >
            <BoxIcon size={16} /> Add Product
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-100"
          >
            <FileText size={16} /> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-100"
          >
            <Printer size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="sm:hidden sticky top-0 z-10 flex justify-end mb-3">
        <button
          onClick={() => setShowMobileFilters((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 bg-white shadow-sm"
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Filters */}
      {(showMobileFilters || window.innerWidth >= 640) && (
        <div className="sticky top-[26px] sm:top-[-12px] z-10 bg-white px-3 py-3 flex flex-wrap gap-3 rounded-lg mb-4 sm:flex">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded border px-3 text-sm focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded border px-3 text-sm focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {[
              ...new Map(
                products.map((p) => [p.category?._id, p.category])
              ).values(),
            ].map(
              (cat) =>
                cat && (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                )
            )}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm border-separate border-spacing-y-2">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="p-3">
                <input type="checkbox" />
              </th>
              <th className="p-3">Images</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Product Id</th>
              <th className="p-3">Price/kg</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-8 text-gray-500 italic"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr
                  key={index}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <td className="p-3">
                    <input type="checkbox" />
                  </td>

                  {/* 🔹 Image */}
                  <td className="p-3">
                    <ProductImageSlider
                      images={product.images}
                      title={product.name}
                    />
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {product.name.split(" ").slice(0, 5).join(" ")}
                    {product.name.split(" ").length > 10 && "..."}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {product.category?.name || "N/A"}
                  </td>

                  <td className="p-3 whitespace-nowrap">{product.productId}</td>

                  <td className="p-3 whitespace-nowrap">
                    {product.weightOptions.find((w) => w.weight === 1000)?.price ||
                      product.weightOptions[0]?.price ||
                      "N/A"}
                  </td>

                  <td
                    className={`p-3 font-medium whitespace-nowrap ${
                      product.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.status}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-2 justify-center">
                      <button
                        className="flex items-center text-indigo-600 hover:underline text-sm"
                        onClick={() => handleEditClick(product)}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button
                        className="flex items-center text-red-600 hover:underline text-sm"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-gray-500 text-sm">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}
