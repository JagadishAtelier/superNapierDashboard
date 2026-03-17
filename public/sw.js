self.addEventListener("push", function (event) {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || "Notification", {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge.png",
      data,
    })
  );
});
