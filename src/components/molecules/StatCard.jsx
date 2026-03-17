export default function StatCard({ label, value, icon, diff, color,textColor }) {
  return (
    <div
      className={`min-w-0 p-4 md:p-6 xl:p-8 rounded-xl ${color} 
  rounded-tl-[50px] rounded-br-[50px] rounded-tr-[10px] rounded-bl-[10px] 
  flex items-start justify-evenly  hover:scale-100`}
    >
      {icon && (
        <div className="text-2xl sm:text-3xl text-[#280a03] bg-white shadow-gray-100 p-3 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[5px] rounded-bl-[5px] me-3">
          {icon}
        </div>
      )}
      <div>
        <h3 className={`text-l font-bold ${textColor}`}>{value}</h3>
        <p className={`text-sm font-medium ${textColor}`}>{label}</p>
      </div>
      <div className="">
        {diff && (
          <p className="text-xs ms-2 text-white bg-[#42427D] rounded-tl-[10px] rounded-br-[10px] rounded-tr-[3px] rounded-bl-[3px] px-2 py-1">
            +{diff}
          </p>
        )}
      </div>
    </div>
  );
}
