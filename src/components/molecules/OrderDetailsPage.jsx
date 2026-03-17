import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../api/ordersApi";
import { getProductById } from "../../api/productApi";
import { ArrowLeft, Check, Pencil, X } from "lucide-react"; // removed MapPin import

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
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
            <div className="bg-[#f4ebe2] shadow rounded-xl p-6 border-l-4 border-[#fdc700] hover:shadow-lg transition">
              <h2 className="font-semibold text-lg mb-3 text-gray-700">
                Buyer Information
              </h2>
              <p>
                <span className="font-medium">Name:</span>{" "}
                {order.buyer?.name || "N/A"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {order.buyer?.email || "N/A"}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {order.buyerDetails?.phone || "N/A"}
              </p>
              <p>
                <span className="font-medium">Address:</span>{" "}
                {order.shippingAddress?.addressLine1 || "N/A"}
                {order.shippingAddress?.city
                  ? `, ${order.shippingAddress.city}`
                  : ""}
                  {order.shippingAddress?.state
                  ? `, ${order.shippingAddress.state}`
                  : ""
                   }
                  {order.shippingAddress?.pincode
                  ? ` - ${order.shippingAddress.pincode}`
                  : ""}
              </p>
              <p>
                <span className="font-medium">Location:</span>{" "}
                {order.location || "N/A"}
              </p>
              <p>
                <span className="font-medium">Instructions:</span>{" "}
                {order.deliveryInstructions || "N/A"}
              </p>
            </div>
            <div className="bg-[#f4ebe2] shadow rounded-xl p-6 border-l-4 border-[#fdc700] hover:shadow-lg transition">
              <h2 className="font-semibold text-lg mb-3 text-gray-700">
                Payment Information
              </h2>
              <p>
                <span className="font-medium">Method:</span>{" "}
                {order.paymentMethod}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {order.paymentStatus}
              </p>
              <p>
                <span className="font-medium">Paid On:</span>{" "}
                {order.paymentDate
                  ? new Date(order.paymentDate).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">
              Products
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
                      alt={p.productId?.name || productInfo?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {p.productId?.name || productInfo?.name || "Product"}
                      </h3>
                      <div className="flex gap-4 text-gray-500 mt-1">
                        <span>Weight: {p.weight ?? "-"}</span>
                        <span>Qty: {p.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-700">
                        Cutting Type: {p.cuttingType || "N/A"}
                      </p>
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
            <div className="bg-[#f4ebe2] shadow-lg rounded-xl p-6 border-t-4 border-[#fdc700]">
              <h2 className="font-semibold text-lg text-gray-700 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>₹{order.discount}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-600 text-lg mt-2">
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
            <h3 className="font-semibold mb-2">Last Known Location</h3>
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
              <div className="text-gray-500 italic">
                No location ping available for this order.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
