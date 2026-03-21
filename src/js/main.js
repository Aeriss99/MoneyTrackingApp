// Legacy entry file kept for backward compatibility.
// The app now runs from /index.html with /app.js.
window.location.replace(new URL("../../index.html", window.location.href).href);
