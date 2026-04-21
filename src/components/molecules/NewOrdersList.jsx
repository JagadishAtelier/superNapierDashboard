import { useState, useEffect } from "react";
import { getOrders } from "../../api/ordersApi";
import { CheckSquare, ArrowUpRight, Search } from "lucide-react";
import OrderDetailsModal from "./OrderDetailsModal";
import { useNavigate } from "react-router-dom";

function NewOrdersList() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await getOrders();
                setOrders(res.data.data.slice(0, 5)); // Only show last 5 for dashboard
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="bg-white shadow-sm rounded-[2rem] border border-gray-100 overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Orders</h2>
                    <p className="text-sm text-gray-500 mt-1">Status of your latest customer orders</p>
                </div>
                <button 
                  onClick={() => navigate('/orders')}
                  className="px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-2"
                >
                    View All <ArrowUpRight size={16} />
                </button>
            </div>

            <div className="overflow-x-auto p-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 font-medium">
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Order ID</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Buyer</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Amount</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Date</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-12 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-gray-500 italic">
                                    <div className="flex flex-col items-center gap-2 opacity-60">
                                        <Search size={32} className="text-gray-300" />
                                        <span>No recent orders found.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr
                                    key={order._id}
                                    className="hover:bg-gray-50/80 transition-colors group"
                                >
                                    <td className="px-4 py-4 font-bold text-gray-700">
                                        #{order.orderId || order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{order.buyer?.name || "Anonymous"}</span>
                                            <span className="text-xs text-gray-400 capitalize">{order.status || 'pending'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-bold text-emerald-600">₹{(order.total || order.finalAmount || 0).toLocaleString()}</td>
                                    <td className="px-4 py-4 text-gray-500 font-medium">{formatDate(order.createdAt)}</td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                            onClick={() => navigate(`/orders/${order._id}`)}
                                            title="View Details"
                                        >
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default NewOrdersList;
