import React from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategorySalesCard = ({ data = [], totalSales = 0, loading = false }) => {
  const navigate = useNavigate();
  const defaultData = [
    { label: 'Organic Seeds', value: 0, percentage: 0 },
    { label: 'Drum Seeds', value: 0, percentage: 0 },
    { label: 'Napier Grass', value: 0, percentage: 0 },
  ];

  const CATEGORY_COLORS = ['#2D5A4C', '#8FBC8F', '#949494', '#E2A03F', '#4A90E2'];

  const chartData = data.length > 0 ? data : defaultData;
  const formattedData = chartData.map((item, index) => ({
    label: item.label,
    value: item.value || 0,
    percentage: item.percentage || 0,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }));

  // Sort by percentage descending
  formattedData.sort((a, b) => b.percentage - a.percentage);

  const sumPercentage = formattedData.reduce((acc, item) => acc + item.percentage, 0);

  // Creates the conic-gradient string for the donut chart
  let gradientStops = '#e5e7eb 0% 100%';
  if (sumPercentage > 0) {
    let currentPct = 0;
    const stops = formattedData.map(item => {
      const start = currentPct;
      currentPct += item.percentage;
      return `${item.color} ${start}% ${currentPct}%`;
    });
    gradientStops = stops.join(', ');
  }

  const formattedTotal = totalSales >= 1000 ? `₹${(totalSales / 1000).toFixed(1)}k` : `₹${totalSales}`;

  return (
    <div className="lg:max-w-sm max-w-none w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[360px] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-base font-bold text-gray-900">
            Top Categories
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin w-10 h-10 text-emerald-600 opacity-60" />
            <span className="text-xs text-gray-400 mt-4 font-semibold">Loading categories...</span>
          </div>
        ) : (
          <>
            {/* Donut Chart */}
            <div className="relative flex justify-center items-center mb-8">
              <div
                className="w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500"
                style={{ background: `conic-gradient(${gradientStops})` }}
              >
                {/* The Inner "Donut" Hole */}
                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Sales</span>
                  <span className="text-2xl font-bold text-gray-800">{formattedTotal}</span>
                </div>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-3 mb-4">
              {formattedData.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-gray-500 font-semibold">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-800 font-bold">{item.percentage}%</span>
                    <span className="text-xs text-gray-400 block font-medium">₹{(item.value).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => navigate('/categories')}
        className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold transition-all hover:bg-emerald-700 shadow-sm mt-4 text-sm"
      >
        View Category
      </button>
    </div>
  );
};

export default CategorySalesCard;
