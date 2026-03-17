import { auth, provider, onAuthStateChanged, signInWithPopup, signOut } from "./firebase.js";
import { fetchTransactions, createTransaction, deleteTransaction } from "./storage.js";
import { getTotals, getBalance, getExpenseByCategory } from "./transaction.js";
import {
  syncAmountInput,
  getRawAmount,
  updateBalance,
  updateSummary,
  updateCount,
  renderTransactions,
} from "./ui.js";

<<<<<<< HEAD
const CHART_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#84cc16",
];
=======
const page = document.body?.dataset.page || "login";
const isLoginPage = page === "login";
const isHomePage = page === "home";
>>>>>>> 101d5ec (feat(ui): update index page and add home.html)

const elements = {
  loginBtn: document.getElementById("google-login"),
  loginHeroBtn: document.getElementById("google-login-hero"),
  loginCtaBtn: document.getElementById("google-login-cta"),
  logoutBtn: document.getElementById("logout"),
  userName: document.getElementById("user-name"),
  userEmail: document.getElementById("user-email"),
  userAvatar: document.getElementById("user-avatar"),
  form: document.getElementById("transaction-form"),
  descInput: document.getElementById("desc"),
  amountInput: document.getElementById("amount"),
  typeInput: document.getElementById("type"),
  categoryInput: document.getElementById("category"),
  submitBtn: document.getElementById("submit-btn"),
  balanceEl: document.getElementById("balance"),
  summaryEl: document.getElementById("summary"),
  listEl: document.getElementById("list"),
  emptyEl: document.getElementById("empty"),
  countEl: document.getElementById("count"),
  chartCanvas: document.getElementById("expense-chart"),
  chartEmpty: document.getElementById("chart-empty"),
};

let transactions = [];
let currentUser = null;
let expenseChart = null;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

<<<<<<< HEAD
function getChartColors(total) {
  return Array.from({ length: total }, (_, index) => CHART_COLORS[index % CHART_COLORS.length]);
}

function ensureExpenseChart() {
  if (expenseChart || !elements.chartCanvas) return;
  if (!window.Chart) {
    console.warn("Chart.js belum tersedia.");
    return;
  }

  expenseChart = new window.Chart(elements.chartCanvas, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          borderWidth: 1,
          borderColor: "#ffffff",
          backgroundColor: [],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 14,
            padding: 14,
          },
        },
      },
      cutout: "58%",
    },
  });
}

function updateExpenseChart({ createIfMissing = true } = {}) {
  if (createIfMissing) {
    ensureExpenseChart();
  }

  if (!expenseChart) return;

  const expenseByCategory = getExpenseByCategory(transactions);
  const labels = Object.keys(expenseByCategory);
  const values = labels.map((label) => expenseByCategory[label]);

  expenseChart.data.labels = labels;
  expenseChart.data.datasets[0].data = values;
  expenseChart.data.datasets[0].backgroundColor = getChartColors(labels.length);
  expenseChart.update();

  if (elements.chartEmpty) {
    elements.chartEmpty.classList.toggle("hidden", labels.length > 0);
  }
=======
function goTo(path) {
  if (window.location.pathname.endsWith(path)) return;
  window.location.href = new URL(path, window.location.href).href;
>>>>>>> 101d5ec (feat(ui): update index page and add home.html)
}

function updateSubmitState() {
  if (!elements.submitBtn || !elements.descInput || !elements.amountInput) return;

  if (!currentUser) {
    elements.submitBtn.disabled = true;
    return;
  }

  const desc = elements.descInput.value.trim();
  const amount = Number(elements.amountInput.dataset.raw || getRawAmount(elements.amountInput.value));
  const category = elements.categoryInput.value.trim();
  elements.submitBtn.disabled = !(desc && amount > 0 && category);
}

function refreshUI() {
  if (!isHomePage || !elements.balanceEl || !elements.summaryEl || !elements.countEl || !elements.listEl || !elements.emptyEl) {
    return;
  }

  const totals = getTotals(transactions);
  const balance = getBalance(transactions);

  updateBalance(elements.balanceEl, balance);
  updateSummary(elements.summaryEl, totals, transactions.length > 0);
  updateCount(elements.countEl, transactions.length);
  renderTransactions(elements.listEl, elements.emptyEl, transactions);
  updateExpenseChart();
}

function clearUI() {
  transactions = [];
<<<<<<< HEAD
  updateBalance(elements.balanceEl, 0);
  updateSummary(elements.summaryEl, { income: 0, expense: 0 }, false);
  updateCount(elements.countEl, 0);
  renderTransactions(elements.listEl, elements.emptyEl, transactions);
  updateExpenseChart({ createIfMissing: false });
}

function setAuthUI(user) {
  if (user) {
    elements.loginSection.classList.add("hidden");
    elements.appSection.classList.remove("hidden");
    return;
  }

  elements.loginSection.classList.remove("hidden");
  elements.appSection.classList.add("hidden");
=======
  refreshUI();
>>>>>>> 101d5ec (feat(ui): update index page and add home.html)
}

function setUserInfo(user) {
  if (!elements.userName || !elements.userEmail || !elements.userAvatar) return;

  if (!user) {
    elements.userName.textContent = "";
    elements.userEmail.textContent = "";
    elements.userAvatar.src = "";
    elements.userAvatar.alt = "";
    return;
  }

  elements.userName.textContent = user.displayName || "Pengguna";
  elements.userEmail.textContent = user.email || "";
  elements.userAvatar.src = user.photoURL || "";
  elements.userAvatar.alt = user.displayName || "Pengguna";
}

async function loadAndRender() {
  if (!currentUser || !isHomePage || !elements.summaryEl) return;
  elements.summaryEl.textContent = "Memuat transaksi...";

  try {
    transactions = await withTimeout(fetchTransactions(currentUser.uid), 8000);
  } catch (error) {
    console.error("Load transactions error:", error);
    transactions = [];
    elements.summaryEl.textContent = "Gagal memuat data LocalStorage.";
  }

  refreshUI();
  updateSubmitState();
}

async function handleLogin() {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    const message = error?.code ? `${error.code}: ${error.message}` : "Login gagal. Coba lagi.";
    console.error("Login error:", error);
    alert(message);
  }
}

if (elements.loginBtn) {
  elements.loginBtn.addEventListener("click", handleLogin);
}

[elements.loginHeroBtn, elements.loginCtaBtn].forEach((button) => {
  if (button) {
    button.addEventListener("click", () => {
      if (elements.loginBtn) {
        elements.loginBtn.click();
      } else {
        handleLogin();
      }
    });
  }
});

if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      const message = error?.code ? `${error.code}: ${error.message}` : "Logout gagal. Coba lagi.";
      console.error("Logout error:", error);
      alert(message);
    }
  });
}

<<<<<<< HEAD
elements.descInput.addEventListener("input", updateSubmitState);
elements.typeInput.addEventListener("change", updateSubmitState);
elements.categoryInput.addEventListener("change", updateSubmitState);
=======
if (elements.amountInput) {
  elements.amountInput.addEventListener("input", () => {
    syncAmountInput(elements.amountInput);
    updateSubmitState();
  });
}
>>>>>>> 101d5ec (feat(ui): update index page and add home.html)

if (elements.descInput) {
  elements.descInput.addEventListener("input", updateSubmitState);
}

if (elements.form) {
  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

<<<<<<< HEAD
  const desc = elements.descInput.value.trim();
  const amount = Number(elements.amountInput.dataset.raw || getRawAmount(elements.amountInput.value));
  const type = elements.typeInput.value;
  const category = elements.categoryInput.value;

  if (!desc) {
    alert("Keterangan wajib diisi.");
    updateSubmitState();
    return;
  }

  if (!amount || amount <= 0) {
    alert("Jumlah harus lebih dari 0.");
    updateSubmitState();
    return;
  }
=======
    if (!currentUser || !elements.descInput || !elements.amountInput || !elements.typeInput) return;

    const desc = elements.descInput.value.trim();
    const amount = Number(elements.amountInput.dataset.raw || getRawAmount(elements.amountInput.value));
    const type = elements.typeInput.value;
>>>>>>> 101d5ec (feat(ui): update index page and add home.html)

    if (!desc || !amount) return;

<<<<<<< HEAD
  try {
    await createTransaction(currentUser.uid, { desc, amount, type, category });
    await loadAndRender();
    elements.form.reset();
    elements.amountInput.dataset.raw = "";
    elements.typeInput.value = "income";
    elements.categoryInput.value = "Makan";
  } catch (error) {
    alert("Gagal menyimpan transaksi.");
  }
=======
    if (elements.submitBtn) {
      elements.submitBtn.disabled = true;
    }
>>>>>>> 101d5ec (feat(ui): update index page and add home.html)

    try {
      await createTransaction(currentUser.uid, { desc, amount, type });
      await loadAndRender();
      elements.form.reset();
      elements.amountInput.dataset.raw = "";
    } catch (error) {
      alert("Gagal menyimpan transaksi.");
    }

    updateSubmitState();
  });
}

if (elements.listEl) {
  elements.listEl.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button || !currentUser) return;

    const id = button.dataset.id;
    if (!id) return;

    try {
      await deleteTransaction(currentUser.uid, id);
      await loadAndRender();
    } catch (error) {
      alert("Gagal menghapus transaksi.");
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (isLoginPage) {
    if (user) {
      goTo("home.html");
    }
    return;
  }

  if (isHomePage && !user) {
    clearUI();
    updateSubmitState();
    goTo("index.html");
    return;
  }

  if (isHomePage && user) {
    setUserInfo(user);
    await loadAndRender();
    return;
  }

  updateSubmitState();
});

updateSubmitState();
