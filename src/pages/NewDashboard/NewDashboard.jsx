import React, { useEffect, useState } from 'react';
import { MoreVertical, Loader2 } from 'lucide-react';
import SalesDistributionCard from './SalesDistributionCard';
import SalesChart from './SalesChart';
import SalesCard from './SalesCard';
import NewOrdersList from '../../components/molecules/NewOrdersList';
import { getDashboard } from '../../api/dashboardApi';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, change, trend, chartColor, bgColor, textColor = "text-white", loading }) => {
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
                                <span className={`${textColor}`}>
                                    {change}
                                </span>
                                {" "}This Month
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
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboard();
                if (response.success) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                // toast.error("Failed to load dashboard statistics");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const data = [
        {
            title: "Total Orders",
            value: stats ? stats.totalOrders.toLocaleString() : "0",
            change: stats ? `+${stats.ordersByStatus?.pending || 0}` : "+0",
            bgColor: "bg-gradient-to-br from-emerald-400 to-emerald-600",
            chartColor: "#fff",
            textColor: "text-white",
            trend: "M0 30 Q 15 10, 30 25 T 60 15 T 100 5"
        },
        {
            title: "Total Sales",
            value: stats ? `₹${(stats.totalRevenue / 1000).toFixed(1)}k` : "₹0k",
            change: stats ? `+${((stats.revenueLast30 / stats.totalRevenue) * 100 || 0).toFixed(0)}%` : "+0%",
            bgColor: "bg-gradient-to-br from-amber-300 to-amber-500",
            chartColor: "#fff",
            trend: "M0 35 Q 20 5, 40 30 T 70 10 T 100 20",
            textColor: "text-white",
        },
        {
            title: "Visitors Today",
            value: stats ? stats.visitors.today.toLocaleString() : "0",
            change: stats ? `+${stats.visitors.last7Days}` : "+0",
            bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600",
            chartColor: "#fff",
            trend: "M0 10 Q 25 15, 40 5 T 70 30 T 100 25",
            textColor: "text-white",
        }
    ];

    return (
        <div className='flex flex-col lg:flex-row gap-6 p-2 md:p-0'>
            <div className='flex-1 space-y-6'>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.map((item, index) => (
                        <StatCard key={index} {...item} loading={loading} />
                    ))}
                </div>
                
                <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                    <SalesChart data={stats?.graphs?.revenueByDay || []} />
                </div>

                <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                    <NewOrdersList />
                </div>
            </div>
            
            <div className='lg:w-1/3 space-y-6 flex flex-col'>
                <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                    <SalesDistributionCard />
                </div>
                <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                    <SalesCard />
                </div>
            </div>
        </div>
    );
};

export default NewDashboard;