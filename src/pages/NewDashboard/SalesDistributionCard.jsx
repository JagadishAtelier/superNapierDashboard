import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

const SalesDistributionCard = () => {
  const ordersData = [
    { city: 'Chennai', amount: '210' },
    { city: 'Coimbatore', amount: '180' },
    { city: 'Madurai', amount: '150' },
    { city: 'Salem', amount: '120' },
    { city: 'Tiruchirappalli', amount: '90' },
  ];

  return (
    <div className="w-full bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Region Sales
        </h2>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">Top Cities</span>
      </div>

      {/* List */}
      <div className="space-y-6">
        {ordersData.map((item, index) => (
          <div key={index} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors uppercase text-xs tracking-wide">{item.city}</p>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${(parseInt(item.amount) / 250) * 100}%` }}
                    ></div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{item.amount}</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Orders</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Button */}
      <button className="w-full mt-8 flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-all group">
        View Distribution Map <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default SalesDistributionCard;