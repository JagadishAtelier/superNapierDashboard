import React, { useEffect, useState } from 'react';
import { MoreVertical, Loader2 } from 'lucide-react';
import CategorySalesCard from './CategorySalesCard';
import SalesChart from './SalesChart';
import RegionSalesCard from './RegionSalesCard';
import NewOrdersList from '../../components/molecules/NewOrdersList';
import { getDashboard } from '../../api/dashboardApi';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, change, trend, chartColor, bgColor, textColor = "text-white", loading, label }) => {
    return (
        <div className={`${bgColor} rounded-2xl p-5 ${textColor} shadow-lg w-full max-w-sm flex flex-col justify-between relative overflow-hidden h-30 min-h-[120px]`}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold opacity-90">{title}</h3>
            </div>

            {/* Main Content */}
            <div className="flex justify-between items-end mt-4">
                <div className="flex flex-col border-l-4 border-white pl-4">
                    {loading ? (
                        <Loader2 className="animate-spin w-6 h-6 opacity-50" />
                    ) : (
                        <>
                            <span className="text-2xl font-bold tracking-tight">{value}</span>
                            <span className="text-sm font-medium mt-1">
                                <span className={`${textColor} font-bold mr-1`}>
                                    {change}
                                </span>
                                {label}
                            </span>
                        </>
                    )}
                </div>

                {/* Simplified SVG Sparkline */}
                <div className="w-24 h-12">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                        <path
                            d={trend}
                            fill="none"
                            stroke={chartColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="drop-shadow-md"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

const NewDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30');

    useEffect(() => {
        const controller = new AbortController();
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await getDashboard(range, controller.signal);
                if (response.success) {
                    setDashboardData(response.data);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error("Error fetching dashboard stats:", error);
                    toast.error("Failed to load dashboard statistics");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        return () => {
            controller.abort();
        };
    }, [range]);

    const summary = dashboardData?.summary;

    const cards = [
        {
            title: "Total Orders",
            value: summary ? summary.orders.value.toLocaleString() : "0",
            change: summary ? summary.orders.trend : "0%",
            bgColor: "bg-gradient-to-br from-emerald-400 to-emerald-600",
            chartColor: "#fff",
            textColor: "text-white",
            trend: "M0 30 Q 15 10, 30 25 T 60 15 T 100 5",
            label: "this period"
        },
        {
            title: "Net Sales",
            value: summary ? `₹${summary.sales.value.toLocaleString()}` : "₹0",
            change: summary ? summary.sales.trend : "0%",
            bgColor: "bg-gradient-to-br from-amber-300 to-amber-500",
            chartColor: "#fff",
            trend: "M0 35 Q 20 5, 40 30 T 70 10 T 100 20",
            textColor: "text-white",
            label: "this period"
        },
        {
            title: "Conversion Rate",
            value: summary ? `${summary.conversionRate.value}%` : "0.0%",
            change: summary ? summary.conversionRate.trend : "0 pp",
            bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600",
            chartColor: "#fff",
            trend: "M0 10 Q 25 15, 40 5 T 70 30 T 100 25",
            textColor: "text-white",
            label: summary ? `from ${summary.visitors.value.toLocaleString()} Visitors` : "from 0 Visitors"
        }
    ];

    return (
        <div className='flex flex-col gap-6 p-2 md:p-0'>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Business Dashboard</h1>
                    <p className="text-gray-500 text-sm font-medium">Real-time agricultural sales performance & analysis</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Filter:</span>
                    <select 
                        value={range} 
                        onChange={(e) => setRange(e.target.value)}
                        className="bg-transparent border-none text-sm font-extrabold text-gray-800 outline-none cursor-pointer pr-4"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="this_month">This Month</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {/* Dashboard Contents */}
            <div className='flex flex-col lg:flex-row gap-6'>
                <div className='flex-1 space-y-6'>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cards.map((item, index) => (
                            <StatCard key={index} {...item} loading={loading} />
                        ))}
                    </div>
                    
                    <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                        <SalesChart data={dashboardData?.salesTrend || []} />
                    </div>

                    <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                        <NewOrdersList />
                    </div>
                </div>
                
                <div className='lg:w-1/3 space-y-6 flex flex-col'>
                    <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                        <RegionSalesCard data={dashboardData?.regionSales || []} loading={loading} />
                    </div>
                    <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                        <CategorySalesCard data={dashboardData?.categorySales || []} totalSales={summary?.sales?.value || 0} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewDashboard;