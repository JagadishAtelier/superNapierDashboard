import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegionSalesCard = ({ data = [], loading = false }) => {
  const navigate = useNavigate();

  const ordersData = data.length > 0 ? data : [
    { state: 'Tamil Nadu', orders: 0, sales: 0 },
    { state: 'Karnataka', orders: 0, sales: 0 },
    { state: 'Kerala', orders: 0, sales: 0 },
    { state: 'Andhra Pradesh', orders: 0, sales: 0 },
    { state: 'Telangana', orders: 0, sales: 0 },
  ];

  const maxOrders = Math.max(...ordersData.map(o => Number(o.orders) || 1), 1);

  return (
    <div className="w-full bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Region Sales
          </h2>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">Top States</span>
        </div>

        {/* List / Loading State */}
        {loading ? (
          <div className="space-y-6">
            {Array(5).fill(0).map((_, idx) => (
              <div key={idx} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
                  <div>
                    <div className="h-4 bg-gray-100 rounded w-20"></div>
                    <div className="h-2 bg-gray-100 rounded w-16 mt-2"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-100 rounded w-8"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {ordersData.map((item, index) => (
              <div key={index} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors uppercase text-xs tracking-wide">{item.state}</p>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${((Number(item.orders) || 0) / maxOrders) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-gray-900">
                    {item.orders} <span className="text-[10px] text-gray-400 font-bold uppercase">Orders</span>
                  </span>
                  <p className="text-[10px] text-emerald-600 font-bold">₹{(item.sales || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Button */}
      <button 
        onClick={() => navigate('/distribution-map')}
        className="w-full mt-8 flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-all group"
      >
        View Distribution Map <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default RegionSalesCard;
