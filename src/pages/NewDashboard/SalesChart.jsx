import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Download } from 'lucide-react';

const data = [
  { name: 'Feb', sales: 8, products: 12 },
  { name: 'Mar', sales: 12, products: 20 },
  { name: 'Apr', sales: 15, products: 10 },
  { name: 'May', sales: 8, products: 22 },
  { name: 'Jun', sales: 12, products: 18 },
  { name: 'Jul', sales: 35, products: 10 },
  { name: 'Aug', sales: 32, products: 18 },
  { name: 'Sept', sales: 28, products: 20 },
  { name: 'Oct', sales: 34, products: 25 },
  { name: 'Nov', sales: 42, products: 30 },
];

const SalesChart = () => {
  return (
    <div className="w-full max-w-5xl p-5 bg-white rounded-3xl shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-bold text-gray-800">Sales</h2>
          
          {/* Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1B4332]"></span>
              <span className="text-sm text-gray-500 font-medium">Total Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D8E2DC]"></span>
              <span className="text-sm text-gray-500 font-medium">Product Sold</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 outline-none hover:bg-gray-50 transition-colors">
            <option>This Year</option>
            <option>Last Year</option>
          </select>
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white rounded-xl text-sm font-medium hover:bg-[#143427] transition-colors">
            <Download size={16} />
            Export
          </button> */}
        </div>
      </div>

      {/* Chart Section */}
      <div className="md:h-[300px] h-[30vh] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              {/* Optional: Add slight gradients if you want more depth than the flat image */}
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1B4332" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="3 3" 
              stroke="#F0F0F0" 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 14 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 14 }}
              tickFormatter={(value) => `₹${value}M`}
              domain={[1, 44]}
              ticks={[1, 8, 15, 28, 35, 44]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            
            {/* Background Line (Product Sold) */}
            <Area
              type="monotone"
              dataKey="products"
              stroke="#fde047"
              strokeWidth={3}
              fill="transparent"
              dot={false}
              activeDot={{ r: 6, fill: '#D8E2DC' }}
            />
            
            {/* Primary Line (Total Sales) */}
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#16a34a"
              strokeWidth={4}
              fill="url(#colorSales)"
              dot={false}
              activeDot={{ r: 8, fill: '#1B4332', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;