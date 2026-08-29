import {
  CheckSquare,
  ArrowLeftRight,
  FileText,
  Printer,
  SearchIcon,
  Clock,
  RotateCcw,
  Send,
  XCircle,
  Box,
  Truck,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getOrders } from "../../api/ordersApi";
import { assignAwb, trackShipment, getLabel } from "../../api/shiprocketApi";
import { toast } from "react-hot-toast";
import OrderDetailsModal from "./OrderDetailsModal";

export default function TransactionList() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders();
        setTransactions(res.data.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    fetchOrders();
  }, []);

  const assignAwbHandler = async (orderId) => {
    try {
      await assignAwb(orderId);
      toast.success(`AWB assigned for ${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign AWB");
    }
  };

  const trackShipmentHandler = async (orderId) => {
    try {
      const res = await trackShipment(orderId);
      toast.success("Tracking details loaded");
      alert(`Tracking details: ${JSON.stringify(res.data)}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to track shipment");
    }
  };

  const downloadLabelHandler = async (orderId) => {
    try {
      const res = await getLabel(orderId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${orderId}_label.pdf`;
      link.click();
      toast.success("Label downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download label");
    }
  };

  // Reset page to 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, priceSort, fromDate, toDate]);

  // Derived filtered & sorted list (before slicing)
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    let filtered = [...transactions];

    if (statusFilter) {
      filtered = filtered.filter(
        (t) => t.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (paymentFilter) {
      filtered = filtered.filter(
        (t) => t.paymentMethod?.toLowerCase() === paymentFilter.toLowerCase()
      );
    }
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => {
        const orderDate = new Date(t.createdAt || t.paymentDate || t.date);
        return orderDate >= from;
      });
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => {
        const orderDate = new Date(t.createdAt || t.paymentDate || t.date);
        return orderDate <= to;
      });
    }
    if (searchQuery) {
      filtered = filtered.filter((t) => {
        const buyerName = (t.buyer?.name || t.buyerDetails?.name || "").toLowerCase();
        const location = t.location?.toLowerCase() || "";
        const orderId = (t.orderId || t.id || "").toLowerCase();
        const buyerEmail = (t.buyer?.email || t.buyerDetails?.email || "").toLowerCase();
        return (
          buyerName.includes(searchQuery) ||
          location.includes(searchQuery) ||
          orderId.includes(searchQuery) ||
          buyerEmail.includes(searchQuery)
        );
      });
    }

    if (priceSort === "low") {
      filtered = [...filtered].sort(
        (a, b) => parseFloat(a.finalAmount || a.total || 0) - parseFloat(b.finalAmount || b.total || 0)
      );
    } else if (priceSort === "high") {
      filtered = [...filtered].sort(
        (a, b) => parseFloat(b.finalAmount || b.total || 0) - parseFloat(a.finalAmount || a.total || 0)
      );
    }

    return filtered;
  }, [transactions, statusFilter, paymentFilter, searchQuery, priceSort, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));

  // Protect against current page becoming invalid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Slice list for pagination
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start === 1) {
        end = maxVisible;
      } else if (end === totalPages) {
        start = totalPages - maxVisible + 1;
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const exportToExcel = () => {
    const data = filteredTransactions.map((txn) => ({
      Invoice: txn.orderId || txn.id,
      Buyer: txn.buyer?.name || txn.buyerDetails?.name || "N/A",
      Email: txn.buyer?.email || txn.buyerDetails?.email || "N/A",
      Location: txn.location || "N/A",
      Status: txn.status || "N/A",
      PaymentMethod: txn.paymentMethod || "N/A",
      PaymentDate: txn.paymentDate ? new Date(txn.paymentDate).toLocaleDateString() : (txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : "N/A"),
      Total: txn.finalAmount || txn.total || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "transactions.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Order Id",
      "Buyer Name",
      "Email",
      "Location",
      "Status",
      "Payment",
      "Amount",
    ];
    const tableRows = [];

    filteredTransactions.forEach((txn) => {
      tableRows.push([
        txn.orderId || txn.id,
        txn.buyer?.name || txn.buyerDetails?.name || "N/A",
        txn.buyer?.email || txn.buyerDetails?.email || "N/A",
        txn.location || "N/A",
        txn.status || "N/A",
        `${txn.paymentMethod || ""} (${txn.paymentDate ? new Date(txn.paymentDate).toLocaleDateString() : (txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : "")})`,
        `₹${txn.finalAmount || txn.total || 0}`,
      ]);
    });

    doc.text("Transaction Report", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 9 },
    });

    doc.save("transactions.pdf");
  };

  return (
    <div className="md:p-5">
      <h2 className="text-xl font-semibold mb-4">Orders List</h2>

      {/* Filters & Search Row */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by Buyer, Location, Order ID..."
              className="w-full h-10 rounded-md border px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => {
                setSearchQuery(e.target.value.toLowerCase());
              }}
            />
            <SearchIcon
              size={16}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Method filter dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Payments</option>
            <option value="online">Razorpay Online</option>
            <option value="UPI">UPI</option>
          </select>

          {/* Price Sort dropdown */}
          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Sort by Price</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>

          {/* From Date picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* To Date picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-100 transition"
          >
            <FileText size={16} />
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-100 transition"
          >
            <Printer size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-2 bg-white rounded-md">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="p-3">
                <input type="checkbox" />
              </th>
              <th className="p-3">Order Id</th>
              <th className="p-3">Buyer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Product Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions?.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500 italic">
                  No transactions found.
                </td>
              </tr>
            ) : (
              paginatedTransactions?.map((txn) => (
                <tr
                  key={txn._id}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <td className="p-3">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3 font-medium text-indigo-600 underline decoration-dotted">
                    {txn.orderId || txn.id}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{txn.buyer?.name || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {txn.buyer?.email || "N/A"}
                    </div>
                  </td>
                  <td
                    className={`p-3 flex items-center gap-2 font-medium ${
                      txn.status?.toLowerCase() === "delivered" ||
                      txn.status?.toLowerCase() === "completed"
                        ? "text-green-600"
                        : txn.status?.toLowerCase() === "pending"
                        ? "text-orange-500"
                        : txn.status?.toLowerCase() === "cancelled" ||
                          txn.status?.toLowerCase() === "returned"
                        ? "text-red-600"
                        : txn.status?.toLowerCase() === "shipped" ||
                          txn.status?.toLowerCase() === "processing"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    {{
                      "check-circle": <CheckCircle size={16} />,
                      clock: <Clock size={16} />,
                      "rotate-ccw": <RotateCcw size={16} />,
                      send: <Send size={16} />,
                      "x-circle": <XCircle size={16} />,
                      box: <Box size={16} />,
                      truck: <Truck size={16} />,
                    }[txn.statusIcon]}
                    {txn.status}
                  </td>
                  <td className="p-3">
                    <div>{txn.paymentMethod || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {txn.paymentDate || "N/A"}
                    </div>
                  </td>
                  <td className="p-3">₹{txn.finalAmount || txn.total || 0}</td>
                  <td className="p-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                        onClick={() => {
                          console.log("Selected Order:", txn);
                          navigate(`/orders/${txn._id}`);
                        }}
                      >
                        <CheckSquare size={16} />
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-gray-500 text-sm">
            Showing {Math.min(filteredTransactions.length, (currentPage - 1) * itemsPerPage + 1)}–
            {Math.min(filteredTransactions.length, currentPage * itemsPerPage)} of {filteredTransactions.length} entries
            {transactions.length !== filteredTransactions.length && ` (filtered from ${transactions.length} total)`}
          </div>

          <div className="flex items-center gap-6">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 border border-gray-300 rounded px-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* Prev/Next buttons */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 border rounded text-xs font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 border rounded text-xs font-medium transition ${
                    currentPage === page
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 border rounded text-xs font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <OrderDetailsModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
