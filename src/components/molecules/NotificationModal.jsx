import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import {
  BellRing,
  PackageCheck,
  BarChart2,
  X,
  Truck,
  Check,
} from "lucide-react";

/**
 * NotificationModal
 * Props:
 *  - open (bool)
 *  - onClose (fn)
 *  - socketUrl (string)
 *  - role ("admin"|"pilot"|"user")
 *  - userId (string)
 *  - showToast (bool)
 *  - storageKey (string) optional, defaults to "app_notifications"
 *  - onNavigate (fn) optional, signature: (path: string, notification) => void
 */
export default function NotificationModal({
  open,
  onClose,
  socketUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "https://butchery-backend.onrender.com",
  role = "admin",
  userId = null,
  showToast = true,
  storageKey = "app_notifications",
  onNavigate = null,
}) {
  const modalRef = useRef();
  const socketRef = useRef(null);

  // audio refs / unlock
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);

  // repeating alarm interval ref
  const ringIntervalRef = useRef(null);

  // how often to repeat alarm (ms)
  const RING_INTERVAL_MS = 60 * 1000; // 1 minute

  // initialize audio enabled from localStorage (remember user's choice)
  const [audioEnabled, setAudioEnabled] = useState(() => {
    try {
      return !!localStorage.getItem(`${storageKey}_audio_enabled`);
    } catch {
      return false;
    }
  });
  const [audioBlocked, setAudioBlocked] = useState(false);

  // initialize from localStorage so notifications persist across refresh
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (err) {
      console.error("Failed to read notifications from localStorage", err);
      return [];
    }
  });

  // create audio element once
  useEffect(() => {
    const a = new Audio("/order_placed_notification.mp3");
    a.preload = "auto";
    a.loop = false;
    audioRef.current = a;

    return () => {
      try {
        if (ringIntervalRef.current) {
          clearInterval(ringIntervalRef.current);
          ringIntervalRef.current = null;
        }
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistNotifications = (arr) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(arr));
    } catch (err) {
      console.error("Failed to write notifications to localStorage", err);
    }
  };

  const pushNotification = (payload) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const item = {
      id,
      createdAt: new Date().toISOString(),
      type: payload.type || "info",
      title: payload.title ?? "Notification",
      message: payload.message ?? "",
      meta: payload.meta ?? null,
    };

    setNotifications((prev) => {
      const newList = [item, ...prev].slice(0, 200);
      persistNotifications(newList);
      return newList;
    });

    if (showToast) {
      const short = `${item.title}: ${item.message}`;
      toast(short, { duration: 5000 });
    }
  };

  // request Notification permission early
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((perm) => {
        console.log("Notification permission:", perm);
      });
    }
  }, []);

  const showBrowserNotification = (title, message, url) => {
    if (!("Notification" in window)) {
      console.log("❌ Notification API not supported in this browser");
      return;
    }
    if (Notification.permission !== "granted") {
      console.log("❌ Notification not granted");
      return;
    }

    try {
      const notification = new Notification(title, {
        body: message,
        icon: "/logo.svg",
        tag: `notif_${Date.now()}`,
      });
      notification.onclick = (event) => {
        event.preventDefault();
        if (url) {
          // open in new tab
          window.open(url, "_blank");
        }
        window.focus();
      };
    } catch (err) {
      console.error("❌ Notification error:", err);
    }
  };

  // Unlock audio playback by user gesture
  const enableAudio = async () => {
    try {
      // create/resume AudioContext (helps unblock some browsers)
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        if (!audioCtxRef.current) audioCtxRef.current = new AC();
        try {
          await audioCtxRef.current.resume();
        } catch (err) {
          // ignore
        }
      }

      // Play a very short sound to unlock
      if (!audioRef.current) {
        audioRef.current = new Audio("/order_placed_notification.mp3");
        audioRef.current.preload = "auto";
      }

      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      setAudioEnabled(true);
      localStorage.setItem(`${storageKey}_audio_enabled`, "1");
      setAudioBlocked(false);
      toast.success("Sound notifications enabled");
    } catch (err) {
      console.warn("Unable to enable audio:", err);
      setAudioBlocked(true);
      toast.error(
        "Couldn't enable sound. Please interact with the page (click) and try again."
      );
    }
  };

  const disableAudio = () => {
    setAudioEnabled(false);
    try {
      localStorage.removeItem(`${storageKey}_audio_enabled`);
    } catch {}
    toast("Sound notifications disabled");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  // helper to attempt to play sound and vibrate
  const tryRing = async () => {
    try {
      if (navigator.vibrate) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {}
      }

      if (audioEnabled && audioRef.current) {
        try {
          // reset to start and play
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
          // success -> clear audioBlocked if previously set
          setAudioBlocked(false);
        } catch (err) {
          console.warn("Play failed:", err);
          setAudioBlocked(true);
          toast.error(
            "Sound blocked by browser. Click 'Enable sound' in the notifications panel."
          );
        }
      } else {
        // audio not enabled -> mark blocked so UI can prompt user
        setAudioBlocked(true);
        // also try browser notification so user notices
        // (do not open many notifications if permission not granted)
        if (Notification.permission === "granted") {
          showBrowserNotification(
            "You have unread notifications",
            `You have ${notifications.length} unread notifications`
          );
        }
      }
    } catch (err) {
      console.error("tryRing error:", err);
    }
  };

  // start repeating alarm every RING_INTERVAL_MS if not already running
  const startRepeatingRings = () => {
    if (ringIntervalRef.current) return;
    ringIntervalRef.current = setInterval(() => {
      // only ring while there are notifications
      if (notifications.length > 0) {
        tryRing();
      } else {
        stopRepeatingRings();
      }
    }, RING_INTERVAL_MS);
  };

  const stopRepeatingRings = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  };

  // socket connection (mount only)
  useEffect(() => {
    const socket = io(socketUrl, { autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (role === "pilot") {
        socket.emit("joinPilots", userId);
      } else if (role === "admin") {
        socket.emit("joinAdmins");
      }
    });

    // --- events we listen for ---
    socket.on("newOrder", (data) => {
      // push into list + toast
      pushNotification({
        type: "order",
        title: "New order",
        message: `Order ${data.orderId ?? data._id} placed — ₹${
          data.finalAmount ?? data.total ?? ""
        }`,
        meta: data,
      });

      // immediate ring attempt
      tryRing();

      // start repeating alarm schedule (so it rings every 1 minute until cleared)
      // give it a small delay so immediate ring happens first
      setTimeout(() => {
        if (notifications.length >= 0) startRepeatingRings();
      }, 1000);

      // show browser notification (after small delay)
      const orderId = data.orderId ?? data._id;
      setTimeout(() => {
        showBrowserNotification(
          "🛒 New Order Received!",
          `Order ${orderId} placed — ₹${data.finalAmount ?? data.total ?? ""}`,
          `${window.location.origin}/orders/${orderId}`
        );
      }, 500);
    });

    socket.on("ordersUpdate", (payload) => {
      if (Array.isArray(payload?.orders)) {
        pushNotification({
          type: "update",
          title: "Orders updated",
          message: `${payload.orders.length} unclaimed orders`,
          meta: payload,
        });
        tryRing();
        startRepeatingRings();
      }
    });

    socket.on("orderAssigned", ({ order }) => {
      pushNotification({
        type: "assigned",
        title: "Order assigned",
        message: `You were assigned order ${order.orderId ?? order._id}`,
        meta: order,
      });
      tryRing();
      startRepeatingRings();
    });

    socket.on("orderClaimed", (data) => {
      pushNotification({
        type: "claimed",
        title: "Order claimed",
        message: `Order ${data.orderId} was claimed`,
        meta: data,
      });
      tryRing();
      startRepeatingRings();
    });

    socket.on("orderReleased", () => {
      pushNotification({
        type: "released",
        title: "Order released",
        message: "Some previously-claimed orders are available again",
      });
      tryRing();
      startRepeatingRings();
    });

    socket.on("orderReached", (data) => {
      pushNotification({
        type: "status",
        title: "Reached pickup",
        message: `Order ${data.orderId} reached pickup point`,
        meta: data,
      });
      tryRing();
      startRepeatingRings();
    });

    socket.on("orderPickedUp", (data) => {
      pushNotification({
        type: "status",
        title: "Picked up",
        message: `Order ${data.orderId} picked up`,
        meta: data,
      });
      tryRing();
      startRepeatingRings();
    });

    socket.on("orderDelivered", (data) => {
      pushNotification({
        type: "status",
        title: "Delivered",
        message: `Order ${data.orderId} delivered`,
        meta: data,
      });
      tryRing();
      startRepeatingRings();
    });

    // cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      stopRepeatingRings();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketUrl, role, userId, showToast, audioEnabled]);

  // watch notifications array and start/stop repeating alarm appropriately
  useEffect(() => {
    if (notifications.length > 0) {
      // ensure repeating alarm is running
      startRepeatingRings();
    } else {
      // nothing to alarm for
      stopRepeatingRings();
      setAudioBlocked(false);
    }

    // persist to localStorage so other tabs can see it
    persistNotifications(notifications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  // keep localStorage in sync if notifications change elsewhere (other tabs)
  useEffect(() => {
    function handleStorageEvent(e) {
      if (e.key === storageKey) {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(next)) setNotifications(next);
        } catch (err) {
          console.error(
            "Failed to parse notifications from storage event",
            err
          );
        }
      }
    }

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [storageKey]);

  const clearNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error("Failed to remove notifications from localStorage", err);
    }
    // stop repeating alarm when user clears
    stopRepeatingRings();
  };

  // navigation: use onNavigate if provided, else use window.location
  const handleClickNotification = (n) => {
    // order id fallback checks
    const orderId = n.meta?._id ?? n.meta?.id ?? null;
    const orderUrl = n.meta?.orderUrl ?? null; // optional full URL from server
    let path = null;

    if (orderUrl) {
      path = orderUrl;
    } else if (orderId) {
      // prefer SPA-relative path like /orders/:id
      path = `/orders/${orderId}`;
    }

    if (!path) return; // nothing to navigate to

    if (typeof onNavigate === "function") {
      try {
        onNavigate(path, n);
      } catch (err) {
        console.warn(
          "onNavigate threw an error, falling back to window.location",
          err
        );
        // fallback below
        const dest = /^https?:\/\//i.test(path)
          ? path
          : `${window.location.origin}${path}`;
        window.location.href = dest;
      }
    } else {
      const dest = /^https?:\/\//i.test(path)
        ? path
        : `${window.location.origin}${path}`;
      window.location.href = dest;
    }
  };

  // simple icon mapper
  const Icon = ({ t }) => {
    if (t === "order")
      return <PackageCheck className="w-4 h-4 text-green-500" />;
    if (t === "assigned") return <Truck className="w-4 h-4 text-orange-500" />;
    if (t === "claimed") return <Check className="w-4 h-4 text-red-500" />;
    if (t === "status")
      return <BarChart2 className="w-4 h-4 text-indigo-500" />;
    return <BellRing className="w-4 h-4 text-blue-500" />;
  };

  if (!open) return null;

  return (
    <>
      <div className="absolute right-0 sm:right-24 top-20 sm:top-24 z-50">
        <div
          ref={modalRef}
          className="bg-white w-96 rounded-lg shadow-xl border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Notifications</h2>

            <div className="flex items-center gap-2">
              {/* Sound controls */}
              {audioEnabled ? (
                <button
                  onClick={disableAudio}
                  className="text-xs px-2 py-1 bg-green-100 rounded"
                  title="Disable sound notifications"
                >
                  Sound: On
                </button>
              ) : (
                <button
                  onClick={enableAudio}
                  className="text-xs px-2 py-1 bg-blue-100 rounded"
                  title="Enable sound notifications (required by browser)"
                >
                  Enable sound
                </button>
              )}

              <button
                onClick={clearNotifications}
                className="text-xs px-2 py-1 bg-gray-100 rounded"
              >
                Clear
              </button>
              <button onClick={onClose}>
                <X className="w-4 h-4 text-gray-500 hover:text-gray-800" />
              </button>
            </div>
          </div>

          {audioBlocked && (
            <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mb-2">
              Sound is blocked by the browser. Click <b>Enable sound</b> to
              allow audio alerts (this requires a click gesture).
            </div>
          )}

          <ul className="space-y-2 text-sm max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="p-3 text-gray-400">No notifications yet</li>
            )}

            {notifications.map((n) => (
              <li
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => handleClickNotification(n)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleClickNotification(n);
                }}
                className="flex items-start p-3 gap-3 text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
              >
                <div className="mt-0.5">
                  <Icon t={n.type} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">{n.message}</div>
                  {n.meta?.orderId && (
                    <div className="text-xs text-gray-400 mt-1">
                      Order: {n.meta.orderId}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
