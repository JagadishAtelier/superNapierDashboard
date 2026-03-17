self.addEventListener("install", () => {
  console.log("Service worker installed");
});

self.addEventListener("activate", () => {
  console.log("Service worker activated");
});

// 🔥 LISTEN FOR PUSH NOTIFICATION
self.addEventListener("push", (event) => {
  console.log("Push received:", event);

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    console.log("Push JSON parse error", e);
  }

  const title = data.title || "Notification";
  const body = data.body || "You have a new message";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",    // optional
      badge: "/badge-72.png",   // optional
      data,                     // attach payload data
      vibrate: [100, 50, 100],  // optional
    })
  );
});
