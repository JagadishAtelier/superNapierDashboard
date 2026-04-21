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

const SalesChart = ({ data = [] }) => {
  // Fallback data if none provided
  const chartData = data.length > 0 ? data.map(item => ({
    name: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: item.total,
    orders: item.orders
  })) : [
    { name: 'Feb', sales: 8, orders: 12 },
    { name: 'Mar', sales: 12, orders: 20 },
    { name: 'Apr', sales: 15, orders: 10 },
    { name: 'May', sales: 8, orders: 22 },
    { name: 'Jun', sales: 12, orders: 18 },
    { name: 'Jul', sales: 35, orders: 10 },
    { name: 'Aug', sales: 32, orders: 18 },
    { name: 'Sept', sales: 28, orders: 20 },
    { name: 'Oct', sales: 34, orders: 25 },
    { name: 'Nov', sales: 42, orders: 30 },
  ];

  return (
    <div className="w-full p-6 bg-white rounded-[2rem] shadow-sm border border-gray-100 transition-all hover:shadow-md">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Overview</h2>
          
          {/* Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></span>
              <span className="text-sm text-gray-500 font-medium">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="text-sm text-gray-500 font-medium">Orders</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-semibold text-gray-600 outline-none hover:bg-gray-100 transition-colors cursor-pointer">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      {/* Chart Section */}
      <div className="md:h-[350px] h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="3 3" 
              stroke="#F3F4F6" 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
              dx={-10}
            />
            <Tooltip 
              cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '14px', fontWeight: 600 }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '12px' }}
            />
            
            {/* Orders Line */}
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#fbbf24"
              strokeWidth={3}
              fill="url(#colorOrders)"
              dot={false}
              activeDot={{ r: 6, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }}
            />
            
            {/* Revenue Line */}
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              strokeWidth={4}
              fill="url(#colorRevenue)"
              dot={false}
              activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;