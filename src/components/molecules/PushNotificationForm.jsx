import { useState } from "react";
import { Send, Bell, Loader2 } from "lucide-react";

export default function PushNotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setResponseMsg("⚠️ Please fill out both title and message");
      return;
    }

    setLoading(true);
    setResponseMsg("");

    try {
      const res = await fetch(`${API_URL}api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponseMsg("✅ Notification sent successfully!");
        setTitle("");
        setBody("");
      } else {
        setResponseMsg(`❌ Failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Send error:", error);
      setResponseMsg("❌ Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-5">
        <Bell className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">Send Push Notification</h2>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Notification Title
        </label>
        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Message Body */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Notification Message
        </label>
        <textarea
          placeholder="Enter message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none h-24"
        />
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendNotification}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
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

      {/* Response Message */}
      {responseMsg && (
        <p className="text-sm text-center text-gray-600 mt-3">{responseMsg}</p>
      )}
    </div>
  );
}
