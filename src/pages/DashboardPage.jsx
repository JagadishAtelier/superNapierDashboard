// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import StatCard from "../components/molecules/StatCard";
import TopSellingProducts from "../components/molecules/TopSellingProducts";
import UniqueVisitorsChart from "../components/molecules/UniqueVisitorsChart";
import NewOrdersList from "../components/molecules/NewOrdersList";
import dashboardApi from "../api/dashboardApi";
import { PiggyBank, ReceiptText } from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await dashboardApi.getDashboard();
        if (mounted) setPayload(res.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        if (mounted) setError(err.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap animate-pulse p-6 gap-4">
        {/* Left section */}
        <div className="w-full md:w-3/5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gray-200 rounded-2xl h-36 w-full sm:w-2/5"></div>
            <div className="bg-gray-200 rounded-2xl h-36 w-full sm:w-3/5"></div>
          </div>
          <div className="bg-gray-200 rounded-2xl h-64 w-full"></div>
        </div>

        {/* Right section */}
        <div className="w-full md:w-2/5 flex flex-col gap-4">
          <div className="bg-gray-200 rounded-2xl h-[50%] w-full"></div>
          <div className="bg-gray-200 rounded-2xl h-[50%] w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  const stats = payload.stats || {};
  const topProducts = payload.topSellingProducts || [];
  const revenueByDay = (payload.graphs && payload.graphs.revenueByDay) || [];
  const visitorsByDay = stats.visitors?.byDay || [];

  return (
    <div className="flex flex-col md:flex-row flex-wrap">
      <div className="w-full md:w-3/5 flex flex-col gap-2 p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <StatCard
            label="Orders"
            value={stats.totalOrders ?? "0"}
            diff={null}
            icon={<ReceiptText />}
            color="bg-[#ffcc0f] w-full sm:w-2/5"
          />
          <StatCard
            label="Sales"
            value={`₹ ${stats.totalRevenue ?? 0}`}
            diff={null}
            icon={<PiggyBank />}
            color="bg-gradient-to-r from-[#4ade80] to-[#16a34a] w-full sm:w-3/5"
            textColor="text-white"
          />
        </div>

        <div className="w-full">
          <NewOrdersList />
        </div>
      </div>

      <div className="w-full md:w-2/5 p-4 pt-0 md:pt-4">
        <TopSellingProducts products={topProducts} />
        <UniqueVisitorsChart
          revenueData={revenueByDay}
          visitorsByDay={visitorsByDay}
        />
      </div>
    </div>
  );
}
