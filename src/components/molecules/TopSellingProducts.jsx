// src/components/molecules/TopSellingProducts.jsx
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopSellingProducts({ products = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 sm:p-6 w-full max-w-xl rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h2 className="text-lg font-semibold text-[#2E2E62]">Top Selling Products</h2>
        <button
          onClick={() => navigate("/topsellers")}
          className="text-sm text-[#5840BB] flex items-center gap-1"
        >
          See all <ChevronRight size={16} />
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No top selling products available.
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((p, index) => (
            <li
              key={p.productId || p._id || index}
              className="flex items-center justify-between gap-3 p-3 border border-gray-100 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm text-[#2E2E62] font-semibold">{index + 1}</span>
                <img
                  src={p.image || "/placeholder.png"}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded shadow"
                />
                <div className="min-w-0">
                  <p className="text-sm text-[#2E2E62] font-medium truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.productKey || ""}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-[#2E2E62]">₹ {p.revenue ?? 0}</p>
                <p className="text-xs text-gray-500">{p.quantitySold ?? 0} sold</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
