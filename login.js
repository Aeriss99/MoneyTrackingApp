import { auth, provider, signInWithPopup } from "./src/js/firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("googleLogin");
  const buttonText = document.getElementById("googleButtonText");
  const status = document.getElementById("loginStatus");
  const illustration = document.querySelector(".illustration-image");

  if (illustration) {
    illustration.addEventListener(
      "error",
      () => {
        const fallbackPath = illustration.getAttribute("data-fallback");
        if (!fallbackPath) return;
        if (illustration.getAttribute("src") === fallbackPath) return;
        illustration.setAttribute("src", fallbackPath);
      },
      { once: true },
    );
  }

  if (!btn) {
    console.error("Button not found");
    return;
  }

  btn.addEventListener("click", async () => {
    console.log("CLICK DETECTED");

    try {
      btn.disabled = true;
      if (buttonText) buttonText.innerText = "Loading...";
      setStatus(status, "Opening Google popup...", "");

      const result = await signInWithPopup(auth, provider);
      console.log("User:", result.user);

      setStatus(status, "Login success. Redirecting...", "success");
      alert("Login success");
      window.location.replace("./dashboard.html");
    } catch (error) {
      console.error("Login error:", error);
      const message = mapAuthError(error);
      setStatus(status, message, "error");
      alert("Login failed: " + message);
    } finally {
      btn.disabled = false;
      if (buttonText) buttonText.innerText = "Continue with Google";
    }
  });
});

function setStatus(target, message, type) {
  if (!target) return;
  target.textContent = message;
  target.classList.remove("is-error", "is-success");
  if (type === "error") target.classList.add("is-error");
  if (type === "success") target.classList.add("is-success");
}

function mapAuthError(error) {
  const code = String(error?.code || "").toLowerCase();

  if (code.includes("popup-closed-by-user")) {
    return "Login dibatalkan: popup ditutup sebelum selesai.";
  }

  if (code.includes("popup-blocked")) {
    return "Popup diblokir browser. Izinkan popup untuk situs ini.";
  }

  if (code.includes("unauthorized-domain")) {
    return "Domain belum diizinkan di Firebase Authentication.";
  }

  if (code.includes("operation-not-allowed")) {
    return "Google Sign-In belum diaktifkan di Firebase Authentication.";
  }

  if (code.includes("network-request-failed")) {
    return "Koneksi internet bermasalah. Coba lagi.";
  }

  return error?.message || "Login gagal. Periksa konfigurasi Firebase.";
}
