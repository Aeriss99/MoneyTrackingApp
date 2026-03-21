// Legacy compatibility entry.
// The production app now uses:
// - /index.html  -> login (Firebase Google Auth)
// - /dashboard.html -> dashboard (Firestore CRUD)
window.location.replace("./dashboard.html");
