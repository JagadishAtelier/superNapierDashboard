import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  X,
  CreditCard,
  Receipt,
  User,
  Phone,
  MapPin,
  Wallet,
  Tag,
  Banknote,
  QrCode,
  ClipboardCopy,
  Info,
  CircleCheckBig,
  CircleX,
  Filter,
  Landmark,
} from "lucide-react";

import { getPayments, refundPayment, getSettlements } from "../../api/payment";
import StatCard from "./StatCard";

const PaymentDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [monthlyCredited, setMonthlyCredited] = useState(0);
  const [lastMonthCredited, setLastMonthCredited] = useState(0);
  const [filters, setFilters] = useState({
    gateway: "razorpay",
    status: "",
    searchQuery: "",
    fromDate: "",
    toDate: "",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const fetchPaymentsAndSettlements = async () => {
    try {
      setLoading(true);

      // Fetch transactions
      const payments = await getPayments();
      setTransactions(payments);

      const now = new Date();

      // Current month range
      const firstDayCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Last month range
      const firstDayLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLast = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch settlements
      const currentData = await getSettlements(
        Math.floor(firstDayCurrent.getTime() / 1000),
        Math.floor(lastDayCurrent.getTime() / 1000)
      );

      const lastData = await getSettlements(
        Math.floor(firstDayLast.getTime() / 1000),
        Math.floor(lastDayCurrent.getTime() / 1000)
      ); // Corrected to lastDayCurrent

      // Sum settled amounts
      const sum = (arr) => arr.reduce((acc, s) => acc + (s.amount || 0), 0);

      setMonthlyCredited(sum(currentData));
      setLastMonthCredited(sum(lastData));
    } catch (err) {
      toast.error("Failed to fetch payments/settlements");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsAndSettlements();
  }, []);

  const filteredData = transactions.filter((t) => {
    const query = filters.searchQuery?.toLowerCase();
    const txnDate = new Date(t.created_at * 1000); // Assuming t.created_at is a Unix timestamp

    const from = filters.fromDate ? new Date(filters.fromDate) : null;
    const to = filters.toDate ? new Date(filters.toDate) : null;

    const dateMatch = (!from || txnDate >= from) && (!to || txnDate <= to);

    return (
      (!filters.status || t.status === filters.status) &&
      dateMatch &&
      (!query ||
        t.id.toLowerCase().includes(query) ||
        t.order_id?.toLowerCase().includes(query) ||
        t.internal_order_id?.toLowerCase().includes(query) ||
        t.user_name?.toLowerCase().includes(query) ||
        t.email?.toLowerCase().includes(query) || // Corrected from t.user_email
        t.contact?.toLowerCase().includes(query) ||
        t.notes?.contact?.toLowerCase().includes(query))
    );
  });
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRefund = async (paymentId) => {
    try {
      await refundPayment(paymentId);
      toast.success(`Refund initiated for ${paymentId}`);
      fetchPaymentsAndSettlements();
    } catch (err) {
      toast.error("Refund failed");
      console.error(err);
    }
  };

  // Helper to filter by month
  const filterByMonth = (txns, year, month) => {
    return txns.filter((t) => {
      const txnDate = new Date(t.created_at * 1000);
      return txnDate.getFullYear() === year && txnDate.getMonth() === month;
    });
  };

  // Get transaction stats
  const getTxnStats = (txns) => {
    const success = txns.filter(
      (t) => t.status?.toLowerCase() === "captured"
    ).length;
    const failed = txns.filter(
      (t) => t.status?.toLowerCase() === "failed"
    ).length;
    return { success, failed };
  };

  const now = new Date();
  const currentMonthTxns = filterByMonth(
    transactions,
    now.getFullYear(),
    now.getMonth()
  );
  const lastMonthTxns = filterByMonth(
    transactions,
    now.getFullYear(),
    now.getMonth() - 1
  );

  const currentStats = getTxnStats(currentMonthTxns);
  const lastStats = getTxnStats(lastMonthTxns);

  const diff = monthlyCredited - lastMonthCredited;

  return (
    <div className="px-2 sm:p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold sm:mb-4">Payments Details</h2>
        <button
          onClick={() => setFiltersOpen((p) => !p)}
          className="sm:hidden bg-[#F3F6FF] text-[#2E2E62] px-4 py-2 rounded"
        >
          <Filter size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg shadow animate-pulse space-y-3"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="Approx Settled Amount"
              value={`₹${(monthlyCredited / 100).toLocaleString()}`}
              diff={`${diff >= 0 ? "↑ " : "↓ "}₹${(
                Math.abs(diff) / 100
              ).toLocaleString()}`}
              color="bg-[#E0F7FA]"
              icon={<Landmark />}
            />
            <StatCard
              label="Successful"
              value={currentStats.success}
              diff={`${
                currentStats.success - lastStats.success >= 0 ? "↑ " : "↓ "
              } ${Math.abs(currentStats.success - lastStats.success)}`}
              color="bg-green-100"
              icon={<CircleCheckBig />}
            />
            <StatCard
              label="Failed"
              value={currentStats.failed}
              diff={`${
                currentStats.failed - lastStats.failed >= 0 ? "↑ " : "↓ "
              } ${Math.abs(currentStats.failed - lastStats.failed)}`}
              color="bg-red-100"
              icon={<CircleX />}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div
        id="filter-panel"
        className={`bg-white p-3 rounded-lg shadow flex justify-between flex-col sm:flex-row gap-3 items-center mb-4
        ${filtersOpen ? "block" : "hidden"} sm:flex`}
      >
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Payment ID or Order ID"
          className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-2/4 focus:outline-none focus:ring-1 focus:ring-gray-500"
          onChange={(e) =>
            setFilters({ ...filters, searchQuery: e.target.value })
          }
        />

        {/* From Date */}
        <input
          type="date"
          className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-1/6 focus:outline-none focus:ring-1 focus:ring-gray-500"
          value={filters.fromDate}
          onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
        />

        {/* To Date */}
        <input
          type="date"
          className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-1/6 focus:outline-none focus:ring-1 focus:ring-gray-500"
          value={filters.toDate}
          onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
        />

        {/* Status Dropdown */}
        <select
          className="border border-gray-300 rounded-md px-3 py-2.5 w-full sm:w-1/6 focus:outline-none focus:ring-1 focus:ring-gray-500"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="captured">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="created">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    "Payment ID",
                    "Order ID",
                    "Status",
                    "Amount",
                    "Method",
                    "Net Credited",
                    "Action",
                    "More info",
                  ].map((header) => (
                    <th key={header} className="border px-4 py-2 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-4 py-2">Payment ID</th>
                <th className="border px-4 py-2">Order ID</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Amount</th>
                <th className="border px-4 py-2">Method</th>
                <th className="border px-4 py-2">Net Credited</th>
                <th className="border px-4 py-2">Action</th>
                <th className="border px-4 py-2">More info</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((txn) => {
                const netCredited =
                  (txn.amount -
                    (txn.fee || 0) -
                    (txn.tax || 0) -
                    (txn.amount_refunded || 0)) /
                  100;

                return (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{txn.id}</td>
                    <td className="border px-4 py-2">{txn.order_id}</td>
                    <td
                      className={`border px-4 py-2 capitalize ${
                        txn.status === "captured"
                          ? "text-green-600 font-medium" // Changed text-medium to font-medium
                          : txn.status === "failed"
                          ? "text-red-600 font-medium"
                          : "text-yellow-600 font-medium"
                      }`}
                    >
                      {txn.status}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      ₹{txn.amount / 100}
                    </td>{" "}
                    {/* Right align amount */}
                    <td className="border px-4 py-2">{txn.method}</td>
                    <td className="border px-4 py-2 text-right">
                      {" "}
                      {/* Right align net credited */}₹{netCredited.toFixed(2)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {txn.status === "captured" ? (
                        <button
                          onClick={() => handleRefund(txn.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                        >
                          Refund
                        </button>
                      ) : (
                        <p className="text-gray-400 text-sm">Not refundable</p>
                      )}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {txn.notes?.address ? (
                        <button
                          className="text-purple-600 hover:text-purple-800 transition-colors duration-200" // Styled Info button
                          onClick={() => setSelectedTxn(txn)}
                          title="View more details" // Added title for accessibility
                        >
                          <Info size={18} />
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filteredData.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{" "}
            of <span className="font-medium">{filteredData.length}</span>{" "}
            results
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className={`px-3 py-1 border rounded ${
                currentPage === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Prev
            </button>
            <span className="px-2 text-gray-700">
              Page <strong>{currentPage}</strong> of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className={`px-3 py-1 border rounded ${
                currentPage === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black -top-20 bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in-down">
          <div className="bg-white rounded-xl top-5 shadow-2xl p-6 md:p-8 w-full max-w-3xl relative transform transition-all duration-300 scale-95 opacity-0 animate-scale-up">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTxn(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <h3 className="text-2xl font-bold mb-6 text-purple-800 flex items-center">
              <CreditCard className="mr-3 text-purple-600" size={24} />
              Payment Details
            </h3>

            {/* Details Section */}
            <div className="space-y-4 text-gray-700 text-base">
              {/* Payment IDs */}
              {/* Changed to grid-cols-1 for md screens too, or use flex-wrap if you prefer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <DetailItem
                  icon={<CreditCard size={18} />}
                  label="Payment ID"
                  value={selectedTxn.id}
                />
                <DetailItem
                  icon={<Receipt size={18} />}
                  label="Order ID"
                  value={selectedTxn.order_id}
                />
                <DetailItem // This will now neatly wrap below if space is tight, or take full width
                  icon={<Receipt size={18} />}
                  label="Internal Order ID"
                  value={selectedTxn.internal_order_id || "-"}
                  fullWidth // New prop to make it take full width on smaller grids
                />
              </div>

              <hr className="my-4 border-gray-200" />

              {/* Customer Info */}
              <div className="space-y-2">
                <DetailItem
                  icon={<User size={18} />}
                  label="Customer"
                  value={`${selectedTxn.notes.name || "Name not mentioned"} (${
                    selectedTxn.email || "-"
                  })`}
                />
                <DetailItem
                  icon={<Phone size={18} />}
                  label="Contact"
                  value={
                    selectedTxn.notes?.contact || selectedTxn.contact || "-"
                  }
                />
                <DetailItem
                  icon={<MapPin size={18} />}
                  label="Address"
                  value={selectedTxn.notes?.address || "-"}
                />
              </div>

              <hr className="my-4 border-gray-200" />

              {/* Amount & Fees */}
              <div className="space-y-2">
                <DetailItem
                  icon={<CreditCard size={18} />}
                  label="Total Amount Paid"
                  value={`₹${(selectedTxn.amount / 100).toFixed(2)}`}
                  highlight
                  valueAlignment="right" // New prop for right alignment
                />
                {selectedTxn.fee && (
                  <DetailItem
                    label="Razorpay Fee"
                    value={`-₹${(selectedTxn.fee / 100).toFixed(2)}`}
                    valueAlignment="right"
                  />
                )}
                {selectedTxn.tax && (
                  <DetailItem
                    label="Tax on Fee"
                    value={`-₹${(selectedTxn.tax / 100).toFixed(2)}`}
                    valueAlignment="right"
                  />
                )}
                {selectedTxn.amount_refunded !== undefined &&
                  selectedTxn.amount_refunded !== null && ( // Check if it's not undefined or null
                    <DetailItem
                      label="Amount Refunded"
                      value={`-₹${(selectedTxn.amount_refunded / 100).toFixed(
                        2
                      )}`}
                      valueAlignment="right"
                    />
                  )}
                <div className="flex justify-between items-center pt-2 font-semibold text-purple-700 border-t border-gray-200 mt-3">
                  <div className="flex items-center">
                    <Wallet size={20} className="mr-2 text-purple-500" />
                    <span>Approx. Credited to Bank:</span>
                  </div>
                  <span>
                    ₹
                    {(
                      ((selectedTxn.amount || 0) -
                        (selectedTxn.fee || 0) -
                        (selectedTxn.tax || 0) -
                        (selectedTxn.amount_refunded || 0)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <hr className="my-4 border-gray-200" />

              {/* Status & Method */}
              <div className="space-y-2">
                <DetailItem
                  icon={<Tag size={18} />}
                  label="Status"
                  value={selectedTxn.status}
                />
                <DetailItem
                  icon={<Banknote size={18} />}
                  label="Payment Method"
                  value={selectedTxn.method?.toUpperCase() || "-"}
                />
                {selectedTxn.acquirer_data?.upi_transaction_id && (
                  <DetailItem
                    icon={<QrCode size={18} />}
                    label="UPI Transaction ID"
                    value={selectedTxn.acquirer_data.upi_transaction_id}
                  />
                )}
                {selectedTxn.acquirer_data?.rrn && (
                  <DetailItem
                    icon={<ClipboardCopy size={18} />}
                    label="RRN"
                    value={selectedTxn.acquirer_data.rrn}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;

// Helper Component for consistent styling - UPDATED
const DetailItem = ({
  icon,
  label,
  value,
  highlight = false,
  valueAlignment = "left",
}) => (
  <p
    className={`flex items-start ${
      highlight ? "text-purple-700 font-semibold" : ""
    }`}
  >
    {icon && (
      <span className="mr-3 mt-0.5 text-gray-500 min-w-[20px] flex-shrink-0">
        {icon}
      </span>
    )}
    <strong className="min-w-[120px] inline-block flex-shrink-0">
      {label}:
    </strong>{" "}
    <span
      className={`flex-1 ${valueAlignment === "right" ? "text-right" : ""}`}
    >
      {value}
    </span>
  </p>
);
