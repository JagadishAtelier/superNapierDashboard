import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { getProductById } from "../../api/productApi"; // adjust path

// Fix default marker icon paths for many bundlers (Vite etc.)
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultMarkerIcon = new L.Icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FlyToMarker({ center }) {
  // moves the map to center when center changes
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function OrderDetailsModal({ open, onClose, order }) {
  const [detailedProducts, setDetailedProducts] = useState([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!order?.products?.length) {
        setDetailedProducts([]);
        return;
      }

      const enrichedProducts = await Promise.all(
        order.products.map(async (item) => {
          try {
            const product = await getProductById(item.productId);
            // product.data should match your productApi shape
            return {
              ...(product?.data || {}),
              qty: item.quantity,
              price: item.price ?? (product?.data?.weightOptions?.[0]?.price ?? 0),
              images: product?.data?.images || product?.data?.image ? [product?.data?.image] : product?.data?.images || [],
            };
          } catch (err) {
            console.error("Failed to fetch product", item.productId, err);
            return {
              name: "Unknown Product",
              images: ["/placeholder.png"],
              qty: item.quantity,
              price: item.price || 0,
            };
          }
        })
      );

      if (mountedRef.current) setDetailedProducts(enrichedProducts);
    };

    if (open && order) fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order]);

  if (!open || !order) return null;

  const getPingLatLng = () => {
    if (order.pingLocation && Array.isArray(order.pingLocation.coordinates) && order.pingLocation.coordinates.length >= 2) {
      const [lng, lat] = order.pingLocation.coordinates;
      const la = Number(lat);
      const ln = Number(lng);
      if (!isNaN(la) && !isNaN(ln)) return { lat: la, lng: ln };
    }
    // fallback to separate fields
    const latField = order.latitude ?? order.lat ?? order.pingLat;
    const lngField = order.longitude ?? order.lng ?? order.pingLng;
    if (latField !== undefined && lngField !== undefined) {
      const la = Number(latField);
      const ln = Number(lngField);
      if (!isNaN(la) && !isNaN(ln)) return { lat: la, lng: ln };
    }
    return null;
  };

  const pingLatLng = getPingLatLng();

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 15;
    const leftMargin = 7;
    const lineHeight = 7;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    // use order.orderId or order._id or order.id
    const orderIdText = order.orderId || order.orderId === 0 ? order.orderId : order.id || order._id || "";
    doc.text(`Order Invoice: ${orderIdText}`, leftMargin, y);
    y += 12;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Products:", leftMargin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Product", "Quantity", "Price"]],
      body: detailedProducts.map((p) => [p.name, String(p.qty || 0), p.price ? `₹${p.price}` : "N/A"]),
      theme: "striped",
      headStyles: { fillColor: [33, 37, 41] },
      styles: { font: "helvetica", fontSize: 10 },
      columnStyles: { 2: { halign: "right" }, 1: { halign: "center" } },
    });

    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : y + 12;

    const printLabelValue = (label, value, isBoldLabel = true) => {
      if (isBoldLabel) doc.setFont(undefined, "bold");
      doc.text(`${label}:`, leftMargin, y);
      if (isBoldLabel) doc.setFont(undefined, "normal");
      doc.text(`${value}`, leftMargin + 40, y);
      y += lineHeight;
    };

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Info:", leftMargin, y);
    y += lineHeight;
    doc.setFontSize(10);

    printLabelValue("Name", order.buyer?.name || String(order.buyer) || "N/A");
    printLabelValue("Email", order.buyer?.email || order.customer?.email || "N/A");
    printLabelValue("Phone", order.customer?.phone || "N/A");
    printLabelValue("Address", order.customer?.address || order.location || "N/A");
    y += 6;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Order Summary:", leftMargin, y);
    y += lineHeight;
    doc.setFontSize(10);
    printLabelValue("Subtotal", `₹${order.subtotal ?? order.total ?? 0}`);
    printLabelValue("Discount", `₹${order.discount ?? 0}`);
    printLabelValue("Tax", `₹${order.tax ?? 0}`);
    doc.setFont(undefined, "bold");
    printLabelValue("Total", `₹${order.total ?? order.finalAmount ?? 0}`, false);
    doc.setFont(undefined, "normal");
    y += 6;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Order Info:", leftMargin, y);
    y += lineHeight;
    doc.setFontSize(10);
    printLabelValue("Order Date", order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A");
    printLabelValue("Status", order.status || "N/A");
    printLabelValue("Payment Method", order.paymentMethod || "N/A");
    printLabelValue("Payment Date", order.paymentDate ? new Date(order.paymentDate).toLocaleString() : "N/A");
    printLabelValue("Transaction ID", order.transactionId || "N/A");
    y += 6;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Shipping Info:", leftMargin, y);
    y += lineHeight;
    doc.setFontSize(10);
    printLabelValue("Courier", order.courier || "N/A");
    printLabelValue("AWB", order.awb || "N/A");
    printLabelValue("Tracking Status", order.shippingStatus || "Pending");

    doc.save(`Order_${orderIdText || Date.now()}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold mb-4">Order #{order.orderId || order._id || order.id}</h3>

        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Products */}
          <section>
            <h4 className="font-semibold mb-2">Products:</h4>
            <div className="space-y-2">
              {detailedProducts.map((product, idx) => (
                <div key={idx} className="flex items-center gap-4 border p-2 rounded">
                  <img
                    src={product.images?.[0] || product.image || "/placeholder.png"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      Qty: {product.qty} | ₹{product.price ?? 0}
                    </div>
                  </div>
                </div>
              ))}
              {detailedProducts.length === 0 && (
                <div className="text-gray-500 italic py-4">No product details available.</div>
              )}
            </div>
          </section>

          {/* Customer + Order summary */}
          <div className="flex flex-col md:flex-row gap-8 mb-4">
            <section className="flex-1">
              <h4 className="font-semibold mb-1">Customer Info:</h4>
              <p><strong>Name:</strong> {order.buyer?.name || String(order.buyer) || "N/A"}</p>
              <p><strong>Email:</strong> {order.buyer?.email || order.customer?.email || "N/A"}</p>
              <p><strong>Phone:</strong> {order.customer?.phone || "N/A"}</p>
              <p><strong>Address:</strong> {order.customer?.address || order.location || "N/A"}</p>
            </section>

            <section className="flex-1">
              <h4 className="font-semibold mb-1">Order Summary:</h4>
              <p><strong>Subtotal:</strong> ₹{order.subtotal ?? order.total ?? 0}</p>
              <p><strong>Discount:</strong> ₹{order.discount ?? 0}</p>
              <p><strong>Tax:</strong> ₹{order.tax ?? 0}</p>
              <p className="font-bold"><strong>Total:</strong> ₹{order.total ?? order.finalAmount ?? 0}</p>
            </section>
          </div>

          {/* Order Info + Shipping */}
          <div className="flex gap-2 my-6">
            <section className="flex-1">
              <h4 className="font-semibold mb-1">Order Info:</h4>
              <p><strong>Order Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
              <p><strong>Payment Date:</strong> {order.paymentDate ? new Date(order.paymentDate).toLocaleString() : "N/A"}</p>
              <p><strong>Transaction ID:</strong> {order.transactionId || "N/A"}</p>
            </section>

            <section className="flex-1">
              <h4 className="font-semibold mb-1">Shipping Info:</h4>
              <p><strong>Courier:</strong> {order.courier || "N/A"}</p>
              <p><strong>AWB:</strong> {order.awb || "N/A"}</p>
              <p><strong>Tracking Status:</strong> {order.shippingStatus || "Pending"}</p>
              {order.labelUrl && (
                <a href={order.labelUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                  Download Label
                </a>
              )}
            </section>
          </div>

          {/* Map: Ping Location */}
          <section>
            <h4 className="font-semibold mb-2">Last Known Location:</h4>
            {pingLatLng ? (
              <div className="w-full h-64 rounded overflow-hidden border">
                <MapContainer
                  center={[pingLatLng.lat, pingLatLng.lng]}
                  zoom={13}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FlyToMarker center={[pingLatLng.lat, pingLatLng.lng]} />
                  <Marker position={[pingLatLng.lat, pingLatLng.lng]} icon={DefaultMarkerIcon}>
                    <Popup>
                      <div>
                        <div className="font-medium">Ping</div>
                        <div>{order.pingedAt ? new Date(order.pingedAt).toLocaleString() : "No timestamp"}</div>
                        <div>Lat: {pingLatLng.lat}, Lng: {pingLatLng.lng}</div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="text-gray-500 italic">No location ping available for this order.</div>
            )}
          </section>

          {/* Export PDF */}
          <div className="mt-4">
            <button onClick={exportPDF} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Export as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
