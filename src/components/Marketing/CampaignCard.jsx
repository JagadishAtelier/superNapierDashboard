import { BarChart2, IndianRupee, Calendar, Zap } from "lucide-react";

export default function CampaignCard({ campaign }) {
  const {
    name,
    status,
    budget,
    spent,
    ctr,
    conversions,
    startDate,
    endDate,
  } = campaign;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border hover:shadow-md transition">
      <div className="flex justify-between items-center mb-1 sm:mb-2">
        <h3 className="text-base sm:text-lg font-semibold truncate">{name}</h3>
        <span
          className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded ${
            status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="text-[11px] sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 truncate">
        <Calendar size={14} />
        <span className="truncate">{startDate} - {endDate}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2 text-[11px] sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2 truncate">
          <IndianRupee className="text-indigo-600" size={14} />
          <span className="text-gray-600 whitespace-nowrap">Budget:</span>
          <span className="truncate">₹{budget}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 truncate">
          <IndianRupee className="text-red-500" size={14} />
          <span className="text-gray-600 whitespace-nowrap">Spent:</span>
          <span className="truncate">₹{spent}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 truncate">
          <BarChart2 className="text-blue-500" size={14} />
          <span className="text-gray-600 whitespace-nowrap">CTR:</span>
          <span className="truncate">{ctr}%</span>
        </div>
        <div className="flex items-center flex-wrap gap-1 sm:gap-2 truncate">
          <Zap className="text-yellow-500" size={14} />
          <span className="text-gray-600 whitespace-nowrap">Conversions:</span>
          <span className="truncate">{conversions}</span>
        </div>
      </div>
    </div>
  );
}
