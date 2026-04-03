import React from 'react';
import { MoreVertical } from 'lucide-react';
import SalesDistributionCard from './SalesDistributionCard';
import SalesChart from './SalesChart';
import SalesCard from './SalesCard';
import NewOrdersList from '../../components/molecules/NewOrdersList';

const StatCard = ({ title, value, change, trend, chartColor, bgColor,textColor = "text-white" }) => {
    const isPositive = !change.startsWith('-');

    return (
        <div className={`${bgColor} rounded-2xl p-5 ${textColor} shadow-lg w-full max-w-sm flex flex-col justify-between relative overflow-hidden h-30`}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold opacity-90">{title}</h3>
                {/* <button className="hover:bg-white/10 p-1 rounded-full transition-colors">
                    <MoreVertical size={14} />
                </button> */}
            </div>

            {/* Main Content */}
            <div className="flex justify-between items-end mt-4">
                <div className="flex flex-col border-l-4 border-white pl-4">
                    <span className="text-2xl font-bold tracking-tight">{value}</span>
                    <span className="text-sm font-medium mt-1">
                        <span className={`${textColor}`}>
                            {change}
                        </span>
                        {" "}This Month
                    </span>
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
    const data = [
        {
            title: "Total Orders",
            value: "6k",
            change: "+1657",
            bgColor: "bg-gradient-to-r from-[#4ade80] to-[#16a34a]",
            chartColor: "#6EE7B7",
            textColor: "text-white",
            trend: "M0 30 Q 15 10, 30 25 T 60 15 T 100 5"
        },
        {
            title: "Total Sales",
            value: "₹44k",
            change: "+18%",
            bgColor: "bg-gradient-to-r from-[#fde047] to-[#fde047]",
            chartColor: "#1D4D3A",
            trend: "M0 35 Q 20 5, 40 30 T 70 10 T 100 20",
            textColor: "text-black",
            
        },
        {
            title: "Total Revenue",
            value: "₹21k",
            change: "-12%",
            bgColor: "bg-gradient-to-r from-[#16a34a] to-[#16a34a]",
            chartColor: "#F87171",
            trend: "M0 10 Q 25 15, 40 5 T 70 30 T 100 25",
            textColor: "text-white",
            
        }
    ];

    return (
        <div className='flex flex-col lg:flex-row gap-5'>
            <div className='space-y-5'>
            <div className="md:bg-white md:shadow-sm md:p-5 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
                {data.map((item, index) => (
                    <StatCard key={index} {...item} />
                ))}
            </div>
            <div>
                <SalesChart/>
            </div>
            <div>
                <NewOrdersList/>
            </div>
            </div>
            <div className='lg:w-1/3 lg:space-y-5 flex lg:flex-col md:flex-row flex-col gap-5'>
                <SalesDistributionCard />
                <SalesCard/>
            </div>
        </div>
    );
};

export default NewDashboard;