const AUTH_USER_STORAGE_KEY = "moneytracking-auth-user";
const GOOGLE_CLIENT_ID_STORAGE_KEY = "moneytracking-google-client-id";
const GOOGLE_CLIENT_ID_META_NAME = "google-client-id";

const elements = {
  googleButton: document.getElementById("google-login-btn"),
  googleButtonText: document.getElementById("google-btn-text"),
  spinner: document.getElementById("google-spinner"),
  statusText: document.getElementById("login-status"),
  toggleConfigButton: document.getElementById("toggle-config-btn"),
  configPanel: document.getElementById("config-panel"),
  clientIdInput: document.getElementById("client-id-input"),
  saveClientIdButton: document.getElementById("save-client-id-btn"),
  clearClientIdButton: document.getElementById("clear-client-id-btn"),
};

let googleClientId = resolveGoogleClientId();
let tokenClient = null;
let gisReady = false;
let gisLoaded = false;
let isLoading = false;

initializeLoginPage();

function initializeLoginPage() {
  if (!elements.googleButton) return;

  elements.googleButton.addEventListener("click", onGoogleLoginClicked);

  elements.toggleConfigButton?.addEventListener("click", () => {
    const currentlyHidden = elements.configPanel.hidden;
    elements.configPanel.hidden = !currentlyHidden;
  });

  elements.saveClientIdButton?.addEventListener("click", saveClientIdFromInput);
  elements.clearClientIdButton?.addEventListener("click", clearClientId);

  if (elements.clientIdInput) {
    elements.clientIdInput.value = googleClientId;
  }

  waitForGoogleLibrary();
}

function resolveGoogleClientId() {
  const fromMeta = document.querySelector(`meta[name="${GOOGLE_CLIENT_ID_META_NAME}"]`)?.content?.trim() || "";
  const fromGlobal = String(window.MONEYTRACKING_GOOGLE_CLIENT_ID || "").trim();
  const fromStorage = String(localStorage.getItem(GOOGLE_CLIENT_ID_STORAGE_KEY) || "").trim();
  return fromMeta || fromGlobal || fromStorage;
}

function waitForGoogleLibrary(attempt = 0) {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    gisLoaded = true;
    setupGoogleTokenClient();
    return;
  }

  if (attempt >= 100) {
    setStatus("Google script failed to load. Please refresh the page.", "error");
    elements.googleButton.disabled = true;
    return;
  }

  window.setTimeout(() => {
    waitForGoogleLibrary(attempt + 1);
  }, 120);
}

function saveClientIdFromInput() {
  const nextClientId = String(elements.clientIdInput?.value || "").trim();

  if (!isValidGoogleClientId(nextClientId)) {
    setStatus("Format Client ID tidak valid.", "error");
    return;
  }

  googleClientId = nextClientId;
  localStorage.setItem(GOOGLE_CLIENT_ID_STORAGE_KEY, googleClientId);
  setStatus("Client ID tersimpan. Mencoba inisialisasi ulang...", "success");

  if (gisLoaded) {
    setupGoogleTokenClient();
  }
}

function clearClientId() {
  localStorage.removeItem(GOOGLE_CLIENT_ID_STORAGE_KEY);
  googleClientId = "";
  tokenClient = null;
  gisReady = false;
  elements.clientIdInput.value = "";
  elements.googleButton.disabled = true;
  setStatus("Client ID dihapus.", "error");
}

function setupGoogleTokenClient() {
  if (!isValidGoogleClientId(googleClientId)) {
    tokenClient = null;
    gisReady = false;
    elements.googleButton.disabled = true;
    elements.configPanel.hidden = false;
    setStatus(
      "Google Client ID belum diatur. Klik 'Set Google Client ID' lalu simpan.",
      "error",
    );
    console.error("Invalid Google Client ID:", googleClientId);
    return;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: googleClientId,
    scope: "openid email profile",
    callback: handleCredentialResponse,
    error_callback: (error) => {
      const errorCode = error?.type || error?.error || "unknown_error";
      console.error("Google popup error:", error);
      setLoading(false);
      setStatus(mapGoogleError(errorCode), "error");
    },
  });

  gisReady = true;
  elements.googleButton.disabled = false;
  setStatus("", "");
}

function isValidGoogleClientId(clientId) {
  return typeof clientId === "string" && /^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId);
}

function onGoogleLoginClicked() {
  if (isLoading) return;

  if (!gisReady || !tokenClient) {
    setStatus("Google login is not ready yet.", "error");
    return;
  }

  setLoading(true);
  setStatus("", "");

  try {
    tokenClient.requestAccessToken({
      prompt: "select_account",
    });
  } catch (error) {
    console.error("requestAccessToken error:", error);
    setLoading(false);
    setStatus("Unable to open Google popup. Please try again.", "error");
  }
}

async function handleCredentialResponse(tokenResponse) {
  try {
    if (!tokenResponse || tokenResponse.error) {
      throw new Error(tokenResponse?.error || "missing_token_response");
    }

    if (!tokenResponse.access_token) {
      throw new Error("missing_access_token");
    }

    const user = await fetchGoogleUser(tokenResponse.access_token);
    const normalizedUser = {
      name: user.name || "",
      email: user.email || "",
      picture: user.picture || "",
      tokenType: tokenResponse.token_type || "Bearer",
      expiresIn: tokenResponse.expires_in || 0,
      loginAt: Date.now(),
    };

    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(normalizedUser));
    console.log("Google user data:", normalizedUser);

    setStatus("Login success. Redirecting...", "success");
    window.setTimeout(() => {
      window.location.href = "./dashboard.html";
    }, 600);
  } catch (error) {
    const errorCode = String(error?.message || "unknown_error");
    console.error("Google auth error:", error);
    setStatus(mapGoogleError(errorCode), "error");
  } finally {
    setLoading(false);
  }
}

async function fetchGoogleUser(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`userinfo_${response.status}`);
  }

  return response.json();
}

function mapGoogleError(errorCode) {
  const code = String(errorCode || "").toLowerCase();

  if (code.includes("popup_closed")) return "Popup ditutup sebelum login selesai.";
  if (code.includes("popup_failed_to_open")) return "Popup diblokir browser. Izinkan pop-up untuk situs ini.";
  if (code.includes("access_denied")) return "Akses Google ditolak. Coba lagi dan izinkan akses.";
  if (code.includes("invalid_client")) return "Client ID tidak valid. Periksa Google OAuth Client ID.";
  if (code.includes("unauthorized_client")) return "OAuth client belum diizinkan untuk origin ini.";
  if (code.includes("origin_mismatch")) return "Origin mismatch. Tambahkan URL ini ke Authorized JavaScript origins.";
  if (code.includes("idpiframe_initialization_failed")) return "Google Identity gagal inisialisasi. Cek browser privacy/cookies.";
  if (code.includes("userinfo_401") || code.includes("userinfo_403")) return "Token tidak valid. Coba login ulang.";
  if (code.includes("missing_access_token") || code.includes("missing_token_response")) return "Tidak mendapatkan token dari Google. Coba lagi.";
  return "Login failed. Cek Client ID dan Authorized JavaScript origins.";
}

function setLoading(nextLoadingState) {
  isLoading = nextLoadingState;
  elements.googleButton.disabled = nextLoadingState || !gisReady;
  elements.googleButton.classList.toggle("is-loading", nextLoadingState);
  elements.spinner.setAttribute("aria-hidden", nextLoadingState ? "false" : "true");
  elements.googleButtonText.textContent = nextLoadingState ? "Connecting..." : "Continue with Google";
}

function setStatus(message, type) {
  elements.statusText.textContent = message;
  elements.statusText.classList.remove("is-error", "is-success");

  if (type === "error") {
    elements.statusText.classList.add("is-error");
  } else if (type === "success") {
    elements.statusText.classList.add("is-success");
  }
}
