// src/components/molecules/UniqueVisitorsChart.jsx
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const formatChartData = (revenueData = []) => {
  // revenueData expected: [{ day: 'YYYY-MM-DD', total: Number, orders: Number }]
  // make sure every day in last N days is present if needed (optional)
  return revenueData.map((r) => ({ name: r.day, revenue: r.total, orders: r.orders }));
};

export default function UniqueVisitorsChart({ revenueData = [], visitorsByDay = [] }) {
  const data = formatChartData(revenueData);

  return (
    <div className="bg-white p-6 w-full max-w-md rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Revenue - Last 30 days</h2>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No revenue data to show</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
