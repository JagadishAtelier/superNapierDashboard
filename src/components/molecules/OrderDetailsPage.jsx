import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus, updateOrder } from "../../api/ordersApi";
import { getProductById } from "../../api/productApi";
import { ArrowLeft, Check, Pencil, X, ShieldCheck, Loader2 } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // IMPORTANT

// Apply default marker icon once for all Leaflet maps (fixes broken marker icons)
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import toast from "react-hot-toast";

L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerRetinaUrl,
  shadowUrl: markerShadowUrl,
});

// Inline SVG location icon — reliable across bundlers
function LocationIcon({ size = 18, color = "#5b21b6", className = "" }) {
  // simple pin icon (filled) — easy to style
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={color}
      />
      <circle cx="12" cy="9" r="2.2" fill="white" />
    </svg>
  );
}

// Fly-to helper for main map
function FlyToMarker({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { animate: true });
  }, [center, map]);
  return null;
}

function parsePingLatLng(order) {
  if (
    order?.pingLocation &&
    Array.isArray(order.pingLocation.coordinates) &&
    order.pingLocation.coordinates.length >= 2
  ) {
    const [lng, lat] = order.pingLocation.coordinates;
    const la = Number(lat);
    const ln = Number(lng);
    if (!isNaN(la) && !isNaN(ln)) return { lat: la, lng: ln };
  }
  const latField = order?.latitude ?? order?.lat ?? order?.pingLat;
  const lngField = order?.longitude ?? order?.lng ?? order?.pingLng;
  if (latField !== undefined && lngField !== undefined) {
    const la = Number(latField);
    const ln = Number(lngField);
    if (!isNaN(la) && !isNaN(ln)) return { lat: la, lng: ln };
  }
  return null;
}

function formatDateStr(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [productsData, setProductsData] = useState({});
  const mountedRef = useRef(true);
  const [isEditing, setIsEditing] = useState(false);
  // UI
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [isClient, setIsClient] = useState(false); // render maps only client-side
  const mapSectionRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);


  useEffect(() => {
    mountedRef.current = true;
    setIsClient(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        const orderData = res.data.data;
        if (!mountedRef.current) return;
        setOrder(orderData);

        const needsFetch = orderData.products.some(
          (p) => !p.productId?.image && !p.productId?.images
        );
        if (!needsFetch) {
          const map = {};
          orderData.products.forEach((p) => {
            const pid = p.productId?._id || p.productId;
            map[pid] = p.productId || {};
          });
          setProductsData(map);
          return;
        }

        const productPromises = orderData.products.map(async (p) => {
          const productId = p.productId?._id || p.productId;
          try {
            const prodRes = await getProductById(productId);
            return { productId, data: prodRes.data };
          } catch (err) {
            console.error("Failed to fetch product", productId, err);
            return { productId, data: null };
          }
        });

        const products = await Promise.all(productPromises);
        const productsMap = {};
        products.forEach((p) => {
          productsMap[p.productId] = p.data;
        });
        if (mountedRef.current) setProductsData(productsMap);
      } catch (err) {
        console.error("Failed to fetch order", err);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order)
    return (
      <div className="p-6 text-center text-gray-500">
        Loading order details...
      </div>
    );

  const pingLatLng = parsePingLatLng(order);
  const googleMapsLink = pingLatLng
    ? `https://www.google.com/maps/search/?api=1&query=${pingLatLng.lat},${pingLatLng.lng}`
    : null;

  const handleGoToMap = () => {
    setShowMiniMap(false);
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const safeCopy = (text) => {
    try {
      navigator.clipboard?.writeText(text);
    } catch (e) {
      // older browsers: fallback alert (optional)
      console.warn("Clipboard unavailable", e);
    }
  };

  const handleUpdate = async () => {
    try {
      setOrder((prev) => ({ ...prev, _updating: true }));
      await updateOrderStatus(order._id, order.status);
      toast.success("Order status updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update order status");
    } finally {
      setOrder((prev) => ({ ...prev, _updating: false }));
    }
  };

  const handleVerifyPayment = async () => {
    if (!window.confirm("Are you sure you want to mark this payment as VERIFIED?")) return;
    
    try {
      setOrder(prev => ({ ...prev, _verifying: true }));
      const res = await updateOrder(order._id, { 
        paymentStatus: 'paid',
        paymentDate: new Date()
      });
      
      if (res.data.success) {
        setOrder(prev => ({ 
          ...prev, 
          paymentStatus: 'paid', 
          paymentDate: new Date().toISOString() 
        }));
        toast.success("Payment verified successfully!");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      toast.error("Failed to verify payment");
    } finally {
      setOrder(prev => ({ ...prev, _verifying: false }));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* Screenshot Modal */}
      <AnimatePresence>
        {showImageModal && order.paymentProof?.screenshot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setShowImageModal(false)}
                   className="absolute inset-0 bg-black/90 backdrop-blur-md"
               />
               <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                   className="relative z-10 bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full"
               >
                   <div className="flex items-center justify-between p-4 border-b">
                       <h3 className="font-black text-gray-800">Payment Verification</h3>
                       <button onClick={() => setShowImageModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                           <X className="w-5 h-5" />
                       </button>
                   </div>
                   <div className="p-1 bg-gray-100 flex justify-center">
                       <img 
                           src={order.paymentProof.screenshot} 
                           alt="Full Payment Proof" 
                           className="max-h-[70vh] object-contain shadow-inner"
                       />
                   </div>
                   <div className="p-6 bg-white border-t">
                       <div className="flex items-center justify-between gap-4">
                           <div className="flex-1">
                               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Transaction ID / UTR</p>
                               <div className="flex items-center gap-2">
                                    <p className="text-xl font-black text-green-700 font-mono tracking-tight">
                                        {order.paymentProof.transactionId || "N/A"}
                                    </p>
                                    <button 
                                        onClick={() => {
                                            safeCopy(order.paymentProof.transactionId);
                                            toast.success("ID Copied!");
                                        }}
                                        className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:text-indigo-600 transition-colors"
                                        title="Copy Transaction ID"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                    </button>
                               </div>
                           </div>
                           
                           {(order.paymentStatus === 'awaiting_verification' || order.paymentStatus === 'pending') && (
                               <button 
                                   onClick={async () => {
                                       await handleVerifyPayment();
                                       setShowImageModal(false); // Auto-close modal on success
                                   }}
                                   disabled={order._verifying}
                                   className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 transition-all shadow-xl shadow-green-900/20 flex items-center gap-2 whitespace-nowrap"
                               >
                                   {order._verifying ? (
                                       <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                                   ) : (
                                       <><ShieldCheck className="w-5 h-5" /> Mark as Paid</>
                                   )}
                               </button>
                           )}
                       </div>
                   </div>
               </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition"
            aria-label="Back to orders"
          >
            <ArrowLeft size={18} /> Back to Orders
          </button>

          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            Order #{order.orderId}
            {/* Only show location pin if we have coordinates */}
            {pingLatLng ? (
              <button
                onClick={() => setShowMiniMap((s) => !s)}
                title="Show last known location"
                aria-label="Show last known location"
                className="ml-2 p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
              >
                <LocationIcon size={18} color="#5b21b6" />
              </button>
            ) : null}
          </h1>
        </div>
        <div />
      </div>

      {/* Floating mini-map popup */}
      {isClient && showMiniMap && pingLatLng && (
        <div className="fixed right-6 top-28 z-50 w-96 bg-white border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <LocationIcon size={16} color="#5b21b6" />
              <div className="text-sm font-medium">Last Known Location</div>
            </div>
            <button
              onClick={() => setShowMiniMap(false)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Close location popup"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ height: 180 }}>
            <MapContainer
              key={`${pingLatLng.lat}-${pingLatLng.lng}`}
              center={[pingLatLng.lat, pingLatLng.lng]}
              zoom={13}
              style={{ width: "100%", height: "100%" }}
              whenCreated={(map) => {
                // allow a tiny delay for animation/visibility and then update size
                setTimeout(() => {
                  try {
                    map.invalidateSize();
                    map.setView([pingLatLng.lat, pingLatLng.lng], 13);
                  } catch (e) {
                    console.error(e);
                  }
                }, 120);
              }}
              attributionControl={false}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[pingLatLng.lat, pingLatLng.lng]} />
            </MapContainer>
          </div>

          <div className="p-3 border-t">
            <div className="text-xs text-gray-600 mb-2">
              <div className="font-medium">Ping</div>
              <div>
                {order.pingedAt
                  ? formatDateStr(order.pingedAt)
                  : "No timestamp"}
              </div>
              <div className="mt-1">
                Lat: {pingLatLng.lat.toFixed(6)}, Lng:{" "}
                {pingLatLng.lng.toFixed(6)}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm text-center hover:bg-indigo-700"
              >
                Open in Google Maps
              </a>

              <button
                onClick={() => safeCopy(`${pingLatLng.lat},${pingLatLng.lng}`)}
                className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
              >
                Copy
              </button>

              <button
                onClick={handleGoToMap}
                className="px-3 py-2 bg-gray-50 border rounded text-sm hover:bg-gray-100"
              >
                Go to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Buyer / Payment / Products (same layout) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-xl p-6 border-l-4 border-green-600 hover:shadow-lg transition">
              <h2 className="font-semibold text-lg mb-3 text-gray-700">
                Buyer Information
              </h2>
              <p>
                <span className="font-medium text-gray-400">Name:</span>{" "}
                <span className="font-bold text-gray-800">{order.buyer?.name || order.buyerDetails?.name || "N/A"}</span>
              </p>
              <p>
                <span className="font-medium text-gray-400">Email:</span>{" "}
                <span className="font-medium text-indigo-600 underline text-sm">{order.buyer?.email || order.buyerDetails?.email || "N/A"}</span>
              </p>
              <p>
                <span className="font-medium text-gray-400">Phone:</span>{" "}
                <span className="font-bold text-gray-800">{order.buyerDetails?.phone || "N/A"}</span>
              </p>
              <p>
                <span className="font-medium text-gray-400">Address:</span>{" "}
                <span className="text-gray-700">
                    {order.shippingAddress?.addressLine1 || "N/A"}
                    {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ""}
                    {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ""}
                    {order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ""}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-400">Location:</span>{" "}
                <span className="text-gray-700">{order.location || "N/A"}</span>
              </p>
            </div>
            <div className="bg-white shadow rounded-xl p-6 border-l-4 border-green-600 hover:shadow-lg transition">
              <h2 className="font-semibold text-lg mb-3 text-gray-700">
                Payment Information
              </h2>
              <div className="space-y-1">
                <p>
                    <span className="font-medium text-gray-400">Method:</span>{" "}
                    <span className="font-bold text-indigo-600">{order.paymentMethod}</span>
                </p>
                <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-400">Status:</span>{" "}
                    <span className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                        {order.paymentStatus?.replace('_', ' ')}
                    </span>
                </p>
                <p>
                    <span className="font-medium text-gray-400">Ordered On:</span>{" "}
                    <span className="font-medium text-gray-800">{new Date(order.createdAt).toLocaleString()}</span>
                </p>
                <p>
                    <span className="font-medium text-gray-400">Paid On:</span>{" "}
                    <span className="font-medium text-gray-800">
                        {order.paymentDate ? new Date(order.paymentDate).toLocaleString() : (order.paymentStatus === 'paid' ? new Date(order.updatedAt).toLocaleString() : "N/A")}
                    </span>
                </p>
              </div>

              {order.paymentMethod === "UPI" && order.paymentProof && (
                <div 
                    onClick={() => order.paymentProof?.screenshot && setShowImageModal(true)}
                    className="mt-4 p-4 bg-green-50 rounded-2xl border-2 border-dashed border-green-200 cursor-pointer hover:bg-green-100 transition-all group"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Payment Proof (Click to view)
                        </h3>
                        <p className="text-xs truncate">
                            <span className="font-medium text-gray-400">UTR:</span>{" "}
                            <code className="bg-white px-1.5 py-0.5 rounded text-green-800 font-bold border border-green-100">{order.paymentProof.transactionId || "N/A"}</code>
                        </p>
                    </div>
                    {order.paymentProof.screenshot && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border-2 border-white flex-shrink-0 group-hover:scale-110 transition-transform">
                            <img 
                                src={order.paymentProof.screenshot} 
                                alt="Receipt Thumbnail" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">
              Products Summary
            </h2>
            {order.products.map((p) => {
              const pid = p.productId?._id || p.productId;
              const productInfo = productsData[pid] || p.productId || {};
              const imageUrl =
                (productInfo?.images && productInfo.images[0]) ||
                productInfo?.image ||
                "/placeholder.png";
              return (
                <div
                  key={p._id}
                  className="flex gap-4 items-center bg-white shadow rounded-xl p-4 hover:shadow-xl transition border border-gray-100"
                >
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={p.productId?.name?.en || productInfo?.name?.en || "product"}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {p.productId?.name?.en || productInfo?.name?.en || "Product"}
                      </h3>
                      <div className="flex gap-4 text-gray-500 mt-1">
                        <span>Weight: {p.weight ?? "-"}</span>
                        <span>Qty: {p.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-700">
                        Price: ₹{p.price}
                      </p>
                      <p className="font-bold text-indigo-600 text-lg">
                        Subtotal: ₹{(p.price || 0) * (p.quantity || 1)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="">
            <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600">
              <h2 className="font-semibold text-lg text-gray-700 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping Method</span>
                  <span className={`font-black text-sm px-2 py-0.5 rounded-lg ${order.shippingMethod?.toLowerCase().includes('express') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {order.shippingMethod || 'Standard Delivery'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-gray-700">+ ₹{order.shippingFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-red-500">- ₹{order.discount || 0}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-600 text-lg mt-2 border-t pt-2">
                  <span>Final Amount</span>
                  <span>₹{order.finalAmount}</span>
                </div>
              </div>
              {/* Order Status Changer */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold capitalize text-sm transition-colors duration-200 ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "Processing"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Shipped"
                        ? "bg-indigo-100 text-indigo-800"
                        : order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>

                  {/* Edit icon */}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-gray-500 hover:text-gray-700 transition"
                    title="Edit status"
                  >
                    <Pencil size={16} />
                  </button>
                </div>

                {/* Slide-down dropdown + button */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isEditing
                      ? "max-h-32 opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex gap-2 items-center">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        setOrder((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={handleUpdate}
                      disabled={order._updating}
                      className={`px-3 py-2 rounded text-sm text-white flex items-center justify-center min-w-[90px] ${
                        order._updating
                          ? "bg-indigo-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {order._updating ? (
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                      ) : (
                        <>
                          <Check size={14} className="mr-1" /> Update
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main map */}
          <div
            ref={mapSectionRef}
            id="order-map"
            className="bg-white shadow rounded-xl p-4 border border-gray-100"
          >
            <h3 className="font-semibold mb-2">Delivery Location</h3>
            {isClient && pingLatLng ? (
              <>
                <div className="w-full h-64 rounded overflow-hidden border">
                  <MapContainer
                    key={`main-${pingLatLng.lat}-${pingLatLng.lng}`}
                    center={[pingLatLng.lat, pingLatLng.lng]}
                    zoom={13}
                    style={{ width: "100%", height: "100%" }}
                    whenCreated={(map) => {
                      setTimeout(() => {
                        try {
                          map.invalidateSize();
                          map.setView([pingLatLng.lat, pingLatLng.lng], 13);
                        } catch (e) {
                          console.error({ e });
                        }
                      }, 120);
                    }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <FlyToMarker center={[pingLatLng.lat, pingLatLng.lng]} />
                    <Marker position={[pingLatLng.lat, pingLatLng.lng]}>
                      <Popup>
                        <div>
                          <div className="font-medium">Ping</div>
                          <div>
                            {order.pingedAt
                              ? formatDateStr(order.pingedAt)
                              : "No timestamp"}
                          </div>
                          <div>
                            Lat: {pingLatLng.lat.toFixed(6)}, Lng:{" "}
                            {pingLatLng.lng.toFixed(6)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>

                <div className="mt-3 flex gap-2">
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                  >
                    Open in Google Maps
                  </a>
                  <button
                    onClick={() =>
                      safeCopy(`${pingLatLng.lat},${pingLatLng.lng}`)
                    }
                    className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                  >
                    Copy Coordinates
                  </button>
                </div>
              </>
            ) : (
                <div className="space-y-4">
                    <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner bg-gray-50">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight="0" 
                            marginWidth="0" 
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${order.shippingAddress?.addressLine1 || ""}, ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.pincode || ""}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-0.5">Shipping Address Base</p>
                            <p className="text-sm font-bold text-gray-800 truncate">
                                {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}
                            </p>
                        </div>
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.shippingAddress?.addressLine1 || ""}, ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.pincode || ""}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-black shadow-sm border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap"
                        >
                            View Full Map
                        </a>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
