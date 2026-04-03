import React from 'react';
import { ChevronDown } from 'lucide-react'; // Optional: for the dropdown icon

const SalesCard = () => {
const data = [
  { label: 'Crop Production', value: 45, color: '#2D5A4C' },
  { label: 'Dairy Farming', value: 35, color: '#8FBC8F' },
  { label: 'Poultry & Livestock', value: 20, color: '#949494' },
];

  const totalSales = "₹1.2k";

  // Creates the conic-gradient string for the donut chart
  const gradientStops = `${data[0].color} 0% 45%, ${data[1].color} 45% 80%, ${data[2].color} 80% 100%`;

  return (
    <div className="lg:max-w-sm max-w-none w-full bg-white rounded-3xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-base font-bold">
          Top 3 Categories
        </h2>
        {/* <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-500 text-sm hover:bg-gray-50 transition-colors">
          Weekly <ChevronDown size={16} />
        </button> */}
      </div>

      {/* Donut Chart */}
      <div className="relative flex justify-center items-center mb-8">
        <div 
          className="w-40 h-40 rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(${gradientStops})` }}
        >
          {/* The Inner "Donut" Hole */}
          <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Sales</span>
            <span className="text-2xl font-bold text-gray-800">{totalSales}</span>
          </div>
        </div>
      </div>

      {/* Legend List */}
      <div className="space-y-2 mb-4">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-gray-500 font-medium">{item.label}</span>
            </div>
            <span className="text-gray-800 font-bold text-base">{item.value}%</span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button className="w-full bg-green-600 text-white py-2 rounded-xl font-medium transition-colors">
        View Details
      </button>
    </div>
  );
};

export default SalesCard;