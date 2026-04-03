import React from 'react';
import { ChevronDown } from 'lucide-react'; // Optional

const SalesDistributionCard = () => {
  const ordersData = [
    { country: 'Chennai', amount: '210' },
    { country: 'Coimbatore', amount: '180' },
    { country: 'Madurai', amount: '150' },
    { country: 'Salem', amount: '120' },
    { country: 'Tiruchirappalli', amount: '90' },
    { country: 'Tirunelveli', amount: '50' },
  ];

  return (
    <div className="lg:max-w-sm max-w-none w-full bg-white rounded-3xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-base font-bold text-gray-800 leading-tight">
          Orders Distribution
        </h2>
        {/* <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Weekly <ChevronDown size={14} />
        </button> */}
      </div>

      {/* List */}
      <div className="space-y-5 mb-4">
        {ordersData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="font-medium">{item.country}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-gray-800">{item.amount}</span>
              <span className="text-gray-400 text-sm">orders</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Button */}
      <button className="w-full bg-green-600 text-white py-2 rounded-xl font-medium transition-colors">
        View Details
      </button>
    </div>
  );
};

export default SalesDistributionCard;