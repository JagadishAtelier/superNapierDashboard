import { useEffect, useState, useCallback } from "react";
import { Send, Bell, Loader2, RotateCcw, RefreshCcw, User, BellIcon, Plus, Edit2, Trash2, X } from "lucide-react";

import StatCard from "../components/molecules/StatCard";
import { toast } from "react-hot-toast";

// coupon API (make sure path matches your project)
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon as apiDeleteCoupon,
  verifyCoupon,
  getCouponById,
} from "../api/couponApi";

export default function PushNotificationManager() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [formResponseMsg, setFormResponseMsg] = useState("");
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    visitedViaPush: 0,
  });
  const [scheduleSunday, setScheduleSunday] = useState(false);

  // --- New coupon states ---
  const [activeTab, setActiveTab] = useState("notifications"); // "notifications" | "coupons"
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponForm, setCouponForm] = useState({
    name: "",
    description: "",
    code: "",
    percentage: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: "", // use datetime-local input
    endDate: "",
    usageLimit: 0,
  });
  const [editingCouponId, setEditingCouponId] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch Stats (original)
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  }, [API_URL]);

  // Fetch History (original)
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications/history`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to fetch history", err);
      toast.error("Something went wrong");
    } finally {
      setHistoryLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchStats();
    fetchHistory();
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStats, fetchHistory]);

  // -------------------------
  // Notifications: existing handlers (unchanged)
  // -------------------------
  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setFormResponseMsg("⚠️ Please fill out both title and message");
      return;
    }

    setLoading(true);
    setFormResponseMsg("");

    try {
      const res = await fetch(`${API_URL}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, scheduleSunday }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Notification sent successfully!");
        setTitle("");
        setBody("");
        setScheduleSunday(false);
        fetchHistory();
        fetchStats();
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (item) => {
    if (!confirm(`Are you sure you want to resend "${item.title}"?`)) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/notifications/resend/${item._id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Notification sent successfully!");
        fetchHistory();
        fetchStats();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to resend notification.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Coupons: functions
  // -------------------------
  const fetchCoupons = async () => {
    setCouponLoading(true);
    try {
      const data = await getAllCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchCoupons:", err);
      toast.error("Failed to load coupons");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCouponInput = (field, value) => {
    setCouponForm((p) => ({ ...p, [field]: value }));
  };

  const resetCouponForm = () => {
    setCouponForm({
      name: "",
      description: "",
      code: "",
      percentage: 10,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      startDate: "",
      endDate: "",
      usageLimit: 0,
    });
    setEditingCouponId(null);
  };

  const handleCreateOrUpdateCoupon = async () => {
    // basic validation
    if (!couponForm.name.trim() || !couponForm.code.trim()) {
      toast.error("Please provide name and code");
      return;
    }
    if (!couponForm.percentage || couponForm.percentage < 1 || couponForm.percentage > 100) {
      toast.error("Percentage must be between 1 and 100");
      return;
    }
    // ensure dates
    if (!couponForm.startDate || !couponForm.endDate) {
      toast.error("Please select start and end date/time");
      return;
    }

    setCouponLoading(true);
    try {
      const payload = {
        ...couponForm,
        code: couponForm.code.toUpperCase().trim(),
        percentage: Number(couponForm.percentage),
        minOrderAmount: Number(couponForm.minOrderAmount) || 0,
        maxDiscountAmount: Number(couponForm.maxDiscountAmount) || 0,
        usageLimit: Number(couponForm.usageLimit) || 0,
      };

      // convert datetime-local to ISO if necessary (ISO strings are OK too)
      // payload.startDate = new Date(payload.startDate).toISOString();
      // payload.endDate = new Date(payload.endDate).toISOString();

      if (editingCouponId) {
        await updateCoupon(editingCouponId, payload);
        toast.success("Coupon updated");
      } else {
        await createCoupon(payload);
        toast.success("Coupon created");
      }
      await fetchCoupons();
      resetCouponForm();
    } catch (err) {
      console.error("create/update coupon:", err);
      toast.error(err?.response?.data?.message || "Failed to save coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleEditCoupon = async (coupon) => {
    // populate form for editing
    setEditingCouponId(coupon._id);
    setCouponForm({
      name: coupon.name || "",
      description: coupon.description || "",
      code: coupon.code || "",
      percentage: coupon.percentage || 10,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      // convert ISO to input-friendly datetime-local (remove seconds)
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : "",
      usageLimit: coupon.usageLimit || 0,
    });
    // switch to coupons tab (already there if clicked from table)
    setActiveTab("coupons");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm("Are you sure to delete this coupon?")) return;
    setCouponLoading(true);
    try {
      await apiDeleteCoupon(id);
      toast.success("Coupon deleted");
      await fetchCoupons();
    } catch (err) {
      console.error("delete coupon:", err);
      toast.error("Failed to delete coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCancelEdit = () => {
    resetCouponForm();
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-[#F3F6FF] p-4 sm:p-6 lg:p-8">
      {/* Header with Tabs */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell className="w-7 h-7 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Push Notification Manager</h1>
            <p className="text-gray-500 text-sm">Create and manage push notifications & coupons for your users.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "notifications" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
          >
            Notifications
          </button>
          <button
            onClick={() => { setActiveTab("coupons"); fetchCoupons(); }}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "coupons" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
          >
            Coupons
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {activeTab === "notifications" && (
        <>
          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <StatCard
              label="Total Subscribers"
              value={stats.totalSubscribers}
              icon={<User />}
              color="bg-indigo-100"
            />
            <StatCard
              label="Visited via Push"
              value={stats.visitedViaPush}
              icon={<BellIcon />}
              color="bg-green-100"
            />
          </div>

          <div className="space-y-10">
            {/* Send Notification Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-indigo-500" /> Send New Notification
              </h2>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., New Product Launch! or Limited Time Offer!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    placeholder="e.g., Explore our latest collection and grab yours now!"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
                  />
                </div>

                {/* Weekly Schedule */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scheduleSunday}
                    onChange={(e) => setScheduleSunday(e.target.checked)}
                    className="rounded border-gray-300"
                    id="scheduleSunday"
                  />
                  <label htmlFor="scheduleSunday" className="text-sm text-gray-700">Send every Sunday at 10:00 AM</label>
                </div>

                <button
                  onClick={handleSendNotification}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Send Notification
                    </>
                  )}
                </button>

                {formResponseMsg && (
                  <p className="text-sm text-center text-red-600 mt-2 font-medium">{formResponseMsg}</p>
                )}
              </div>
            </section>

            {/* Notification History */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">📜 Notification History</h2>
                <button
                  onClick={fetchHistory}
                  disabled={historyLoading}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCcw className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`} />
                  {historyLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {historyLoading && history.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
                  <p className="text-gray-500">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500 italic">
                  <p>No notifications sent yet.</p>
                  <p className="text-xs mt-1">Start by sending one above!</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left w-1/4">Title</th>
                        <th className="px-4 py-3 text-left w-1/2">Message</th>
                        <th className="px-4 py-3 text-center w-1/6">Sent At</th>
                        <th className="px-4 py-3 text-center w-1/12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {history.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                          <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                          <td className="px-4 py-3 text-gray-600 line-clamp-2" title={item.body}>{item.body}</td>
                          <td className="px-4 py-3 text-center text-gray-500">{new Date(item.sentAt).toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleResend(item)}
                              className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 mx-auto px-2 py-1 rounded-md hover:bg-indigo-50 transition"
                              disabled={loading}
                            >
                              <RotateCcw className="w-4 h-4" /> Resend
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {activeTab === "coupons" && (
        <>
          <div className="space-y-6">
            {/* Coupon Form */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-500" />
                  {editingCouponId ? "Edit Coupon" : "Add Coupon"}
                </h2>
                {editingCouponId && (
                  <button onClick={handleCancelEdit} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    value={couponForm.name}
                    onChange={(e) => handleCouponInput("name", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="e.g., New User 10%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    value={couponForm.code}
                    onChange={(e) => handleCouponInput("code", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="e.g., NEWUSER10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={couponForm.percentage}
                    onChange={(e) => handleCouponInput("percentage", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => handleCouponInput("minOrderAmount", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Amount</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) => handleCouponInput("maxDiscountAmount", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (0 = unlimited)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.usageLimit}
                    onChange={(e) => handleCouponInput("usageLimit", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={couponForm.startDate}
                    onChange={(e) => handleCouponInput("startDate", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={couponForm.endDate}
                    onChange={(e) => handleCouponInput("endDate", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={couponForm.description}
                    onChange={(e) => handleCouponInput("description", e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleCreateOrUpdateCoupon}
                  disabled={couponLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50"
                >
                  {couponLoading ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                  ) : editingCouponId ? "Update Coupon" : "Create Coupon"}
                </button>

                {editingCouponId && (
                  <button onClick={handleCancelEdit} className="px-3 py-2 bg-gray-100 rounded-md text-sm">Cancel</button>
                )}

                <button onClick={() => { resetCouponForm(); fetchCoupons(); }} className="px-3 py-2 bg-white border rounded-md text-sm">
                  Reset
                </button>
              </div>
            </section>

            {/* Coupon Table */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">📦 Coupons</h2>
                <div className="text-sm text-gray-600">
                  <button
                    onClick={fetchCoupons}
                    disabled={couponLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCcw className={`w-4 h-4 ${couponLoading ? "animate-spin" : ""}`} />
                    {couponLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {couponLoading && coupons.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
                  <p className="text-gray-500">Loading coupons...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500 italic">
                  <p>No coupons found.</p>
                  <p className="text-xs mt-1">Create one using the form above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Code</th>
                        <th className="px-4 py-3 text-left">Percentage</th>
                        <th className="px-4 py-3 text-left">Min Order</th>
                        <th className="px-4 py-3 text-left">Max Discount</th>
                        <th className="px-4 py-3 text-left">Start</th>
                        <th className="px-4 py-3 text-left">End</th>
                        <th className="px-4 py-3 text-left">Usage</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {coupons.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                          <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                          <td className="px-4 py-3 text-gray-600">{c.code}</td>
                          <td className="px-4 py-3 text-gray-600">{c.percentage}%</td>
                          <td className="px-4 py-3 text-gray-600">{c.minOrderAmount ?? 0}</td>
                          <td className="px-4 py-3 text-gray-600">{c.maxDiscountAmount ?? 0}</td>
                          <td className="px-4 py-3 text-gray-600">{c.startDate ? new Date(c.startDate).toLocaleString() : "-"}</td>
                          <td className="px-4 py-3 text-gray-600">{c.endDate ? new Date(c.endDate).toLocaleString() : "-"}</td>
                          <td className="px-4 py-3 text-gray-600">{c.usageLimit || "∞"}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditCoupon(c)}
                                className="text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-md hover:bg-indigo-50 transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(c._id)}
                                className="text-red-600 hover:text-red-800 px-2 py-1 rounded-md hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
