import { useState, useEffect } from "react";
import { getOrders } from "../../api/ordersApi";
import { CheckSquare } from "lucide-react";
import OrderDetailsModal from "./OrderDetailsModal";
import { useNavigate } from "react-router-dom";
function NewOrdersList() {
    const navigate = useNavigate()
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders();
        setOrders(res.data.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-semibold mb-4">New Order Updates</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="p-3">Order Id</th>
              <th className="p-3">Buyer Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Created Date</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500 italic">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <td className="p-3 font-medium text-indigo-600 underline decoration-dotted">
                    {order.orderId || order.id}
                  </td>
                  <td className="p-3">{order.buyer?.name || "N/A"}</td>
                  <td className="p-3">{order.total || 0}</td>
                  <td className="p-3">{formatDate(order.createdAt)}</td>
                  <td className="p-3">
                    <button
                      className="text-indigo-600 hover:underline flex items-center gap-1"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <CheckSquare size={16} /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailsModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}

export default NewOrdersList;
