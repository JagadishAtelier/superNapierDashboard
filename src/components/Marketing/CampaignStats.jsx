import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { IndianRupee, Zap, Percent } from "lucide-react";
import { useEffect, useState } from "react";

export default function CampaignStats({ stats }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-center sm:text-left">
        Campaign Overview
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 text-center sm:text-left">
        {[
          {
            icon: <IndianRupee className="text-indigo-600 mx-auto sm:mx-0" size={20} />,
            label: "Total Budget",
            value: `₹${stats.totalBudget.toLocaleString()}`,
          },
          {
            icon: <IndianRupee className="text-red-500 mx-auto sm:mx-0" size={20} />,
            label: "Total Spent",
            value: `₹${stats.totalSpent.toLocaleString()}`,
          },
          {
            icon: <Zap className="text-yellow-500 mx-auto sm:mx-0" size={20} />,
            label: "Conversions",
            value: stats.totalConversions.toLocaleString(),
          },
          {
            icon: <Percent className="text-blue-500 mx-auto sm:mx-0" size={20} />,
            label: "CTR",
            value: `${stats.ctr.toFixed(2)}%`,
          },
        ].map(({ icon, label, value }, i) => (
          <div
            key={i}
            className="flex flex-col items-center sm:items-start gap-1 px-0"
          >
            {icon}
            <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
            <p className="text-lg sm:text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <h3 className="text-lg font-semibold mb-3 text-center sm:text-left">
        Daily Performance
      </h3>

      <div className="w-full h-56 sm:h-64 bg-white rounded-lg shadow-inner p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stats.dailyPerformance}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            barCategoryGap={isMobile ? "10%" : "20%"}
            barGap={isMobile ? 2 : 4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{
                fill: "#6b7280",
                fontSize: isMobile ? 10 : 12,
              }}
              angle={isMobile ? -35 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              interval={0}
              height={isMobile ? 40 : 30}
              tickLine={false}
              axisLine={{ stroke: "#d1d5db" }}
            />

            {/* Only one Y axis on mobile to avoid clutter */}
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#6366f1"
              tick={{ fill: "#4b5563", fontSize: 12 }}
              tickFormatter={(val) => `₹${val}`}
              hide={isMobile}
            />
            {!isMobile && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                tick={{ fill: "#4b5563", fontSize: 12 }}
                tickFormatter={(val) => `${val}%`}
              />
            )}

            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                borderRadius: 8,
                border: "none",
              }}
              formatter={(value, name) =>
                name === "CTR (%)" ? `${value}%` : `₹${value}`
              }
            />

            <Legend
              verticalAlign={isMobile ? "bottom" : "top"}
              align={isMobile ? "center" : "right"}
              height={isMobile ? 40 : 36}
              wrapperStyle={{
                fontSize: isMobile ? 12 : 14,
                paddingTop: isMobile ? 10 : 0,
              }}
            />

            <Bar
              yAxisId="left"
              dataKey="spent"
              fill="#6366f1"
              name="Spent (₹)"
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 12 : 16}
            />
            <Bar
              yAxisId={isMobile ? "left" : "right"}
              dataKey="ctr"
              fill="#10b981"
              name="CTR (%)"
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 12 : 16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
