// src/pages/TopSellersPage.jsx
import { useEffect, useState } from "react";
import dashboardApi from "../api/dashboardApi";
import TopSellingProducts from "../components/molecules/TopSellingProducts";

export default function TopSellersPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardApi.getDashboard();
        setProducts(res.data.topSellingProducts || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Top Selling Products</h1>
      <TopSellingProducts products={products} />
    </div>
  );
}
