import {
  auth,
  authPersistencePromise,
  onAuthStateChanged,
  provider,
  signInWithPopup,
  signOut,
} from "./firebase.js";

export function subscribeAuthState(listener) {
  return onAuthStateChanged(auth, listener);
}

export function signInWithGooglePopup() {
  return signInWithPopup(auth, provider);
}

export async function logoutCurrentUser() {
  return signOut(auth);
}

export async function waitForAuthReady() {
  await authPersistencePromise;

  if (typeof auth.authStateReady === "function") {
    await auth.authStateReady();
    return;
  }

  await new Promise((resolve) => {
    let settled = false;
    let unsubscribe = () => {};

    const finish = () => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve();
    };

    unsubscribe = onAuthStateChanged(
      auth,
      finish,
      finish,
    );
  });
}

export function mapAuthError(error) {
  const code = String(error?.code || "").toLowerCase();

  if (code.includes("popup-closed-by-user")) {
    return "Login dibatalkan: popup ditutup sebelum proses selesai.";
  }

  if (code.includes("popup-blocked")) {
    return "Popup diblokir browser. Izinkan popup untuk situs ini.";
  }

  if (code.includes("unauthorized-domain")) {
    return "Domain belum diizinkan di Firebase Auth (Authorized domains).";
  }

  if (code.includes("operation-not-allowed")) {
    return "Google Sign-In belum diaktifkan di Firebase Authentication.";
  }

  if (code.includes("network-request-failed")) {
    return "Koneksi bermasalah. Periksa internet lalu coba lagi.";
  }

  if (code.includes("too-many-requests")) {
    return "Terlalu banyak percobaan login. Coba lagi beberapa saat.";
  }

  return "Login gagal. Periksa konfigurasi Firebase dan coba lagi.";
}
