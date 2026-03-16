import { auth, provider, onAuthStateChanged, signInWithPopup, signOut } from "./src/js/firebase.js";

/* MoneyTrackingApp V2.0
 * Vanilla JS + Firebase Auth + LocalStorage + Chart.js
 */

const STORAGE_PREFIX = "money-tracking-app-v2:transactions";
const CHART_COLORS = {
  Makan: "#f97316",
  Transportasi: "#0ea5e9",
  Belanja: "#8b5cf6",
  Gaji: "#10b981",
  Hiburan: "#ec4899",
  Investasi: "#14b8a6",
};

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

const elements = {
  loginScreen: document.getElementById("login-screen"),
  appScreen: document.getElementById("app-screen"),
  loginButton: document.getElementById("google-login"),
  logoutButton: document.getElementById("logout"),
  userName: document.getElementById("user-name"),
  userEmail: document.getElementById("user-email"),
  userAvatar: document.getElementById("user-avatar"),
  form: document.getElementById("transaction-form"),
  descriptionInput: document.getElementById("description"),
  amountInput: document.getElementById("amount"),
  typeInput: document.getElementById("type"),
  categoryInput: document.getElementById("category"),
  submitButton: document.getElementById("submit-button"),
  feedback: document.getElementById("form-feedback"),
  totalBalance: document.getElementById("total-balance"),
  totalIncome: document.getElementById("total-income"),
  totalExpense: document.getElementById("total-expense"),
  transactionCount: document.getElementById("transaction-count"),
  historyEmpty: document.getElementById("history-empty"),
  historyScroll: document.getElementById("history-scroll"),
  transactionList: document.getElementById("transaction-list"),
  chartCanvas: document.getElementById("expense-chart"),
  chartEmpty: document.getElementById("chart-empty"),
};

const state = {
  currentUser: null,
  transactions: [],
  chart: null,
};

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}:${userId || "guest"}`;
}

function formatRupiah(value) {
  return rupiahFormatter.format(Number(value) || 0);
}

function getRawAmount(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function syncAmountInput() {
  const rawAmount = getRawAmount(elements.amountInput.value);
  elements.amountInput.dataset.raw = rawAmount ? String(rawAmount) : "";
  elements.amountInput.value = rawAmount ? formatRupiah(rawAmount) : "";
  return rawAmount;
}

function createTransactionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `tx-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeTransaction(item) {
  if (!item || typeof item !== "object") return null;

  const amount = Number(item.amount) || 0;
  const type = item.type === "income" ? "income" : "expense";
  const description = String(item.description || "").trim();
  const category = String(item.category || "Makan").trim() || "Makan";

  if (!description || amount <= 0) return null;

  return {
    id: String(item.id || createTransactionId()),
    description,
    amount,
    type,
    category,
    createdAt: Number(item.createdAt) || Date.now(),
  };
}

function loadTransactions(userId) {
  try {
    const rawValue = localStorage.getItem(getStorageKey(userId));
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeTransaction)
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Failed to load transactions:", error);
    return [];
  }
}

function saveTransactions(userId) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(state.transactions));
}

function getSummary(transactions) {
  return transactions.reduce(
    (acc, item) => {
      if (item.type === "income") acc.income += item.amount;
      else acc.expense += item.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

function getExpenseByCategory(transactions) {
  return transactions.reduce((acc, item) => {
    if (item.type !== "expense") return acc;
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});
}

function setFeedback(message) {
  elements.feedback.textContent = message || "";
}

function setAuthUI(user) {
  if (user) {
    elements.loginScreen.classList.add("hidden");
    elements.appScreen.classList.remove("hidden");
    return;
  }

  elements.loginScreen.classList.remove("hidden");
  elements.appScreen.classList.add("hidden");
}

function setUserInfo(user) {
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
  elements.userAvatar.alt = user.displayName || "User avatar";
}

function updateSubmitState() {
  if (!state.currentUser) {
    elements.submitButton.disabled = true;
    return;
  }

  const description = elements.descriptionInput.value.trim();
  const amount = Number(elements.amountInput.dataset.raw || getRawAmount(elements.amountInput.value));
  elements.submitButton.disabled = !(description && amount > 0);
}

function renderSummary() {
  const { income, expense } = getSummary(state.transactions);
  const balance = income - expense;

  elements.totalBalance.textContent = formatRupiah(balance);
  elements.totalIncome.textContent = formatRupiah(income);
  elements.totalExpense.textContent = formatRupiah(expense);
}

function buildTransactionItem(item) {
  const listItem = document.createElement("li");
  listItem.className = "flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

  const infoWrap = document.createElement("div");
  infoWrap.className = "min-w-0";

  const title = document.createElement("p");
  title.className = "truncate text-sm font-semibold text-slate-900";
  title.textContent = item.description;

  const metadata = document.createElement("p");
  metadata.className = "mt-1 text-xs text-slate-500";
  metadata.textContent = `${item.type === "income" ? "Pemasukan" : "Pengeluaran"} • ${item.category} • ${dateFormatter.format(item.createdAt)}`;

  infoWrap.append(title, metadata);

  const actionWrap = document.createElement("div");
  actionWrap.className = "flex shrink-0 items-center gap-3";

  const amount = document.createElement("p");
  amount.className = item.type === "income" ? "text-sm font-bold text-emerald-500" : "text-sm font-bold text-rose-500";
  amount.textContent = `${item.type === "income" ? "+" : "-"} ${formatRupiah(item.amount)}`;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.id = item.id;
  deleteButton.dataset.action = "delete";
  deleteButton.className =
    "inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-500";
  deleteButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg><span>Hapus</span>';

  actionWrap.append(amount, deleteButton);
  listItem.append(infoWrap, actionWrap);

  return listItem;
}

function renderHistory() {
  const count = state.transactions.length;
  elements.transactionCount.textContent = `${count} transaksi`;
  elements.transactionList.innerHTML = "";

  if (!count) {
    elements.historyEmpty.classList.remove("hidden");
    elements.historyScroll.classList.add("hidden");
    return;
  }

  const fragment = document.createDocumentFragment();
  state.transactions.forEach((item) => fragment.appendChild(buildTransactionItem(item)));
  elements.transactionList.appendChild(fragment);

  elements.historyEmpty.classList.add("hidden");
  elements.historyScroll.classList.remove("hidden");
}

function ensureChart() {
  if (state.chart || !window.Chart || !elements.chartCanvas) return;

  state.chart = new window.Chart(elements.chartCanvas, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderWidth: 1,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 14,
            usePointStyle: true,
            pointStyle: "circle",
            padding: 14,
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const values = context.dataset.data || [];
              const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
              const current = Number(context.raw || 0);
              const percentage = total ? ((current / total) * 100).toFixed(1) : "0.0";
              return `${context.label}: ${formatRupiah(current)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

function renderChart() {
  ensureChart();
  if (!state.chart) return;

  const groupedExpense = getExpenseByCategory(state.transactions);
  const labels = Object.keys(groupedExpense);
  const values = labels.map((label) => groupedExpense[label]);
  const colors = labels.map((label) => CHART_COLORS[label] || "#64748b");

  state.chart.data.labels = labels;
  state.chart.data.datasets[0].data = values;
  state.chart.data.datasets[0].backgroundColor = colors;
  state.chart.update();

  elements.chartEmpty.classList.toggle("hidden", labels.length > 0);
}

function renderApp() {
  renderSummary();
  renderHistory();
  renderChart();
  updateSubmitState();
}

function readTransactionFromForm() {
  const description = elements.descriptionInput.value.trim();
  const amount = Number(elements.amountInput.dataset.raw || getRawAmount(elements.amountInput.value));
  const type = elements.typeInput.value;
  const category = elements.categoryInput.value;

  if (!description) {
    return { error: "Deskripsi transaksi wajib diisi." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Jumlah harus lebih dari Rp0." };
  }

  return {
    data: {
      id: createTransactionId(),
      description,
      amount,
      type: type === "income" ? "income" : "expense",
      category,
      createdAt: Date.now(),
    },
  };
}

function resetForm() {
  elements.form.reset();
  elements.amountInput.dataset.raw = "";
  elements.typeInput.value = "expense";
  elements.categoryInput.value = "Makan";
  setFeedback("");
  updateSubmitState();
}

function clearAppData() {
  state.transactions = [];
  renderApp();
}

function addTransaction(transaction) {
  state.transactions.unshift(transaction);
  saveTransactions(state.currentUser?.uid);
  renderApp();
}

function deleteTransactionById(transactionId) {
  state.transactions = state.transactions.filter((item) => item.id !== transactionId);
  saveTransactions(state.currentUser?.uid);
  renderApp();
}

async function handleLogin() {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    const message = error?.code ? `${error.code}: ${error.message}` : "Login gagal.";
    alert(message);
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    const message = error?.code ? `${error.code}: ${error.message}` : "Logout gagal.";
    alert(message);
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  setFeedback("");

  if (!state.currentUser) return;

  const { data, error } = readTransactionFromForm();
  if (error) {
    setFeedback(error);
    updateSubmitState();
    return;
  }

  addTransaction(data);
  resetForm();
}

function handleHistoryClick(event) {
  const deleteButton = event.target.closest("button[data-action='delete']");
  if (!deleteButton || !state.currentUser) return;

  const transactionId = deleteButton.dataset.id;
  if (!transactionId) return;
  deleteTransactionById(transactionId);
}

function handleAuthStateChange(user) {
  state.currentUser = user || null;
  setAuthUI(user);
  setUserInfo(user);

  if (user) {
    state.transactions = loadTransactions(user.uid);
    resetForm();
    renderApp();
    return;
  }

  clearAppData();
  resetForm();
}

function initialize() {
  elements.loginButton.addEventListener("click", handleLogin);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.amountInput.addEventListener("input", () => {
    syncAmountInput();
    updateSubmitState();
  });
  elements.descriptionInput.addEventListener("input", updateSubmitState);
  elements.typeInput.addEventListener("change", updateSubmitState);
  elements.categoryInput.addEventListener("change", updateSubmitState);
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.transactionList.addEventListener("click", handleHistoryClick);

  onAuthStateChanged(auth, handleAuthStateChange);
  resetForm();
  setAuthUI(null);
}

initialize();
