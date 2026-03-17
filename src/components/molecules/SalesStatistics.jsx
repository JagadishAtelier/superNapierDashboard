import { ChevronDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: '', value: 10, value2: 5 },
  { name: "Week 1", value: 20, value2: 10 },
  { name: "Week 2", value: 35, value2: 25 },
  { name: "Week 3", value: 49, value2: 40 },
  { name: "Week 4", value: 70, value2: 60 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#6C4CF1] text-white px-4 py-2 rounded-tl-[20px] rounded-tr-[5px] rounded-bl-[5px] rounded-br-[20px] shadow-lg text-center">
        <p className="text-sm text-gray-200 mb-1">10.06 — 17.06.2020</p>
        <p className="text-lg font-semibold">
          ₹{payload[0].value.toLocaleString()}
        </p>
        <p className="text-sm text-violet-200">
          Compare: ₹{payload[1]?.value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function SalesStatistics() {
  return (
    <div className="bg-white text-[#42427d] py-4 sm:p-6 rounded-2xl w-full">
      <div className="flex flex-row sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold">Sales statistics</h2>
        <button className="border border-[#F3F6FF] text-[#42427d] rounded-tl-[20px] rounded-tr-[5px] rounded-bl-[5px] rounded-br-[20px] px-4 py-2 text-sm flex items-center gap-1">
          Monthly <ChevronDown size={16} />
        </button>
      </div>

      <div className="w-full h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lineShadow" x1="0" y1="0" x2="0" y2="2">
                <stop offset="0%" stopColor="#e0c8ff" stopOpacity={1} />
                <stop offset="100%" stopColor="#42427d" stopOpacity={0.8} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#F3F6FF" />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: "#F3F6FF" }}
              tickLine={{ stroke: "#F3F6FF" }}
              tick={{ fill: "#6C4CF1", fontSize: 12 }}
            />
            <YAxis
              axisLine={{ stroke: "#F3F6FF" }}
              tickLine={{ stroke: "#F3F6FF" }}
              tick={{ fill: "#6C4CF1", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#FFE5EE"
              strokeWidth={3}
              fill="url(#lineShadow)"
              dot={{ r: 6, stroke: "#fff", strokeWidth: 2, fill: "#6C4CF1" }}
              activeDot={{ r: 8, strokeWidth: 0, fill: "#7979B2" }}
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke="#C7F2FF"
              strokeWidth={3}
              dot={{ r: 6, stroke: "#fff", strokeWidth: 2, fill: "#00B4D8" }}
              activeDot={{ r: 8, strokeWidth: 0, fill: "#0077B6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
