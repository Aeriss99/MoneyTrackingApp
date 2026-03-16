import { ChartController } from "../components/charts.js";
import { renderDashboardCards } from "../components/dashboardCards.js";
import { renderMonthlyReport } from "../components/monthlyReport.js";
import { renderTransactionList } from "../components/transactionList.js";
import { createStore } from "../hooks/useStore.js";
import { loginWithGoogle, logoutUser, subscribeAuthState } from "../services/authService.js";
import { exportTransactionsToCsv } from "../services/exportService.js";
import { loadThemePreference, saveThemePreference } from "../services/preferencesService.js";
import {
  createTransaction,
  loadTransactions,
  saveTransactions,
  updateTransaction,
} from "../services/transactionService.js";
import { CATEGORIES, DEFAULT_FILTERS, TRANSACTION_TYPES } from "../utils/constants.js";
import {
  formatAmountInput,
  getCurrentMonthKey,
  getMonthKey,
  getMonthLabel,
  parseAmountInput,
  toInputDate,
} from "../utils/formatters.js";
import { validateTransactionInput } from "../utils/validators.js";

function getElements() {
  return {
    appLoading: document.getElementById("app-loading"),
    loginScreen: document.getElementById("login-screen"),
    appShell: document.getElementById("app-shell"),
    loginButton: document.getElementById("google-login"),
    loginFeedback: document.getElementById("login-feedback"),
    themeToggle: document.getElementById("theme-toggle"),
    logoutButton: document.getElementById("logout-button"),
    userAvatar: document.getElementById("user-avatar"),
    userName: document.getElementById("user-name"),
    userEmail: document.getElementById("user-email"),
    statTotalBalance: document.getElementById("stat-total-balance"),
    statMonthIncome: document.getElementById("stat-month-income"),
    statMonthExpense: document.getElementById("stat-month-expense"),
    statSavingsRate: document.getElementById("stat-savings-rate"),
    transactionCount: document.getElementById("transaction-count"),
    transactionEmptyState: document.getElementById("transaction-empty-state"),
    transactionListWrapper: document.getElementById("transaction-list-wrapper"),
    transactionList: document.getElementById("transaction-list"),
    filterSearch: document.getElementById("filter-search"),
    filterType: document.getElementById("filter-type"),
    filterCategory: document.getElementById("filter-category"),
    filterDateFrom: document.getElementById("filter-date-from"),
    filterDateTo: document.getElementById("filter-date-to"),
    clearFiltersButton: document.getElementById("clear-filters-button"),
    exportCsvButton: document.getElementById("export-csv-button"),
    transactionForm: document.getElementById("transaction-form"),
    transactionFormTitle: document.getElementById("transaction-form-title"),
    transactionFormMode: document.getElementById("transaction-form-mode"),
    transactionEditId: document.getElementById("transaction-edit-id"),
    transactionDate: document.getElementById("transaction-date"),
    transactionAmount: document.getElementById("transaction-amount"),
    transactionType: document.getElementById("transaction-type"),
    transactionCategory: document.getElementById("transaction-category"),
    transactionNote: document.getElementById("transaction-note"),
    transactionFormFeedback: document.getElementById("transaction-form-feedback"),
    transactionSubmitButton: document.getElementById("transaction-submit-button"),
    transactionCancelEditButton: document.getElementById("transaction-cancel-edit-button"),
    monthlyReportList: document.getElementById("monthly-report-list"),
    toastRegion: document.getElementById("toast-region"),
    expenseCategoryCanvas: document.getElementById("chart-expense-category"),
    expenseCategoryEmpty: document.getElementById("chart-expense-category-empty"),
    incomeExpenseCanvas: document.getElementById("chart-income-expense"),
    incomeExpenseEmpty: document.getElementById("chart-income-expense-empty"),
    monthlyTrendCanvas: document.getElementById("chart-monthly-trend"),
    monthlyTrendEmpty: document.getElementById("chart-monthly-trend-empty"),
  };
}

function sortTransactions(transactions) {
  return [...transactions].sort((a, b) => {
    if (a.date === b.date) return b.updatedAt - a.updatedAt;
    return b.date.localeCompare(a.date);
  });
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function calculateStats(transactions) {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((item) => {
    if (item.type === TRANSACTION_TYPES.INCOME) totalIncome += item.amount;
    else totalExpense += item.amount;
  });

  const totalBalance = totalIncome - totalExpense;
  const currentMonthKey = getCurrentMonthKey();
  const monthItems = transactions.filter((item) => getMonthKey(item.date) === currentMonthKey);
  const monthIncome = monthItems
    .filter((item) => item.type === TRANSACTION_TYPES.INCOME)
    .reduce((sum, item) => sum + item.amount, 0);
  const monthExpense = monthItems
    .filter((item) => item.type === TRANSACTION_TYPES.EXPENSE)
    .reduce((sum, item) => sum + item.amount, 0);
  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;

  return {
    totalBalance,
    monthIncome,
    monthExpense,
    savingsRate: Math.max(-100, savingsRate),
    totalIncome,
    totalExpense,
  };
}

function buildMonthlyReportRows(transactions, maxRows = 4) {
  const monthMap = new Map();

  transactions.forEach((item) => {
    const key = getMonthKey(item.date);
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        income: 0,
        expense: 0,
        count: 0,
        categoryTotals: {},
      });
    }

    const bucket = monthMap.get(key);
    bucket.count += 1;
    if (item.type === TRANSACTION_TYPES.INCOME) {
      bucket.income += item.amount;
    } else {
      bucket.expense += item.amount;
      bucket.categoryTotals[item.category] = (bucket.categoryTotals[item.category] || 0) + item.amount;
    }
  });

  return [...monthMap.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, maxRows)
    .map(([key, value]) => {
      const topCategory = Object.entries(value.categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
      return {
        label: getMonthLabel(key),
        count: value.count,
        income: value.income,
        expense: value.expense,
        topCategory,
      };
    });
}

function filterTransactions(transactions, filters) {
  return transactions.filter((item) => {
    if (filters.type !== "all" && item.type !== filters.type) return false;
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.from && item.date < filters.from) return false;
    if (filters.to && item.date > filters.to) return false;

    if (filters.search) {
      const text = `${item.note} ${item.category} ${item.type}`.toLowerCase();
      if (!text.includes(filters.search.toLowerCase())) return false;
    }

    return true;
  });
}

function showToast(elements, message, tone = "neutral") {
  const palette = {
    neutral: "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300",
    error: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/20 dark:text-rose-300",
  };

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto rounded-xl border px-3 py-2 text-xs font-semibold shadow-fintech ${palette[tone] || palette.neutral}`;
  toast.textContent = message;
  elements.toastRegion.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

function setupCategoryOptions(elements) {
  const options = CATEGORIES.map((category) => `<option value="${category.value}">${category.value}</option>`).join("");
  elements.transactionCategory.innerHTML = options;
  elements.filterCategory.innerHTML = `<option value="all">All Categories</option>${options}`;
}

function getFormPayload(elements) {
  return {
    date: elements.transactionDate.value,
    amount: Number(elements.transactionAmount.dataset.raw || parseAmountInput(elements.transactionAmount.value)),
    type: elements.transactionType.value,
    category: elements.transactionCategory.value,
    note: String(elements.transactionNote.value || "").trim(),
  };
}

function setFormMode(elements, editing) {
  if (editing) {
    elements.transactionFormTitle.textContent = "Edit Transaction";
    elements.transactionFormMode.textContent = "EDIT";
    elements.transactionCancelEditButton.classList.remove("hidden");
    elements.transactionSubmitButton.textContent = "Update";
    return;
  }

  elements.transactionFormTitle.textContent = "Add Transaction";
  elements.transactionFormMode.textContent = "CREATE";
  elements.transactionCancelEditButton.classList.add("hidden");
  elements.transactionSubmitButton.textContent = "Save";
}

function resetForm(elements) {
  elements.transactionEditId.value = "";
  elements.transactionDate.value = toInputDate(Date.now());
  elements.transactionAmount.value = "";
  elements.transactionAmount.dataset.raw = "";
  elements.transactionType.value = TRANSACTION_TYPES.EXPENSE;
  elements.transactionCategory.value = CATEGORIES[0].value;
  elements.transactionNote.value = "";
  elements.transactionFormFeedback.textContent = "";
  setFormMode(elements, false);
}

function fillFormForEdit(elements, transaction) {
  elements.transactionEditId.value = transaction.id;
  elements.transactionDate.value = transaction.date;
  elements.transactionAmount.dataset.raw = String(transaction.amount);
  elements.transactionAmount.value = formatAmountInput(transaction.amount);
  elements.transactionType.value = transaction.type;
  elements.transactionCategory.value = transaction.category;
  elements.transactionNote.value = transaction.note || "";
  elements.transactionFormFeedback.textContent = "";
  setFormMode(elements, true);
}

export function initAppPage() {
  const elements = getElements();
  const chartController = new ChartController(elements);
  const store = createStore({
    isLoading: true,
    user: null,
    theme: loadThemePreference(),
    transactions: [],
    filters: { ...DEFAULT_FILTERS },
    editingId: "",
  });

  let filteredTransactions = [];
  let renderQueued = false;

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      render();
    });
  }

  function render() {
    const state = store.getState();
    applyTheme(state.theme);
    elements.appLoading.classList.toggle("hidden", !state.isLoading);

    const hasUser = Boolean(state.user);
    elements.loginScreen.classList.toggle("hidden", hasUser);
    elements.appShell.classList.toggle("hidden", !hasUser);

    if (!hasUser) return;

    elements.userName.textContent = state.user.displayName || "Pengguna";
    elements.userEmail.textContent = state.user.email || "";
    elements.userAvatar.src = state.user.photoURL || "";
    elements.userAvatar.alt = state.user.displayName || "User avatar";

    filteredTransactions = filterTransactions(state.transactions, state.filters);
    const stats = calculateStats(state.transactions);
    const monthlyRows = buildMonthlyReportRows(state.transactions);

    renderDashboardCards(elements, stats);
    renderTransactionList({
      listElement: elements.transactionList,
      emptyElement: elements.transactionEmptyState,
      wrapperElement: elements.transactionListWrapper,
      countElement: elements.transactionCount,
      transactions: filteredTransactions,
    });
    chartController.update(filteredTransactions);
    renderMonthlyReport(elements.monthlyReportList, monthlyRows);
    setFormMode(elements, Boolean(state.editingId));
  }

  function syncSubmitState() {
    const state = store.getState();
    const payload = getFormPayload(elements);
    const isValid =
      Boolean(state.user) &&
      Boolean(payload.date) &&
      Number(payload.amount) > 0 &&
      Boolean(payload.type) &&
      Boolean(payload.category);
    elements.transactionSubmitButton.disabled = !isValid;
  }

  function persistAndSetTransactions(nextTransactions) {
    const state = store.getState();
    if (state.user?.uid) {
      saveTransactions(state.user.uid, nextTransactions);
    }
    store.setState((prev) => ({ ...prev, transactions: sortTransactions(nextTransactions) }));
  }

  elements.themeToggle.addEventListener("click", () => {
    const state = store.getState();
    const nextTheme = state.theme === "dark" ? "light" : "dark";
    saveThemePreference(nextTheme);
    store.setState((prev) => ({ ...prev, theme: nextTheme }));
  });

  elements.loginButton.addEventListener("click", async () => {
    elements.loginFeedback.textContent = "";
    try {
      await loginWithGoogle();
    } catch (error) {
      elements.loginFeedback.textContent = error?.code ? `${error.code}` : "Login gagal.";
    }
  });

  elements.logoutButton.addEventListener("click", async () => {
    try {
      await logoutUser();
      showToast(elements, "Logout berhasil.", "neutral");
    } catch (error) {
      showToast(elements, error?.code || "Logout gagal.", "error");
    }
  });

  elements.transactionAmount.addEventListener("input", () => {
    const formatted = formatAmountInput(elements.transactionAmount.value);
    const raw = parseAmountInput(formatted);
    elements.transactionAmount.dataset.raw = raw ? String(raw) : "";
    elements.transactionAmount.value = formatted;
    syncSubmitState();
  });

  [elements.transactionDate, elements.transactionType, elements.transactionCategory, elements.transactionNote].forEach(
    (element) => element.addEventListener("input", syncSubmitState)
  );

  elements.filterSearch.addEventListener("input", (event) => {
    store.setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, search: event.target.value.trim() },
    }));
  });
  elements.filterType.addEventListener("change", (event) => {
    store.setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, type: event.target.value },
    }));
  });
  elements.filterCategory.addEventListener("change", (event) => {
    store.setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, category: event.target.value },
    }));
  });
  elements.filterDateFrom.addEventListener("change", (event) => {
    store.setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, from: event.target.value },
    }));
  });
  elements.filterDateTo.addEventListener("change", (event) => {
    store.setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, to: event.target.value },
    }));
  });

  elements.clearFiltersButton.addEventListener("click", () => {
    elements.filterSearch.value = "";
    elements.filterType.value = "all";
    elements.filterCategory.value = "all";
    elements.filterDateFrom.value = "";
    elements.filterDateTo.value = "";
    store.setState((prev) => ({ ...prev, filters: { ...DEFAULT_FILTERS } }));
  });

  elements.exportCsvButton.addEventListener("click", () => {
    if (!filteredTransactions.length) {
      showToast(elements, "Tidak ada data untuk diexport.", "error");
      return;
    }
    exportTransactionsToCsv(filteredTransactions);
    showToast(elements, "CSV berhasil diunduh.", "success");
  });

  elements.transactionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = store.getState();
    if (!state.user) return;

    const payload = getFormPayload(elements);
    const result = validateTransactionInput(payload);
    if (!result.valid) {
      elements.transactionFormFeedback.textContent = result.message;
      syncSubmitState();
      return;
    }

    const editingId = elements.transactionEditId.value;
    if (editingId) {
      const existing = state.transactions.find((item) => item.id === editingId);
      if (!existing) {
        showToast(elements, "Transaksi tidak ditemukan.", "error");
        resetForm(elements);
        syncSubmitState();
        store.setState((prev) => ({ ...prev, editingId: "" }));
        return;
      }

      const updated = updateTransaction(existing, payload);
      const next = state.transactions.map((item) => (item.id === editingId ? updated : item));
      persistAndSetTransactions(next);
      resetForm(elements);
      store.setState((prev) => ({ ...prev, editingId: "" }));
      showToast(elements, "Transaksi berhasil diperbarui.", "success");
      syncSubmitState();
      return;
    }

    const created = createTransaction(payload);
    const next = [created, ...state.transactions];
    persistAndSetTransactions(next);
    resetForm(elements);
    showToast(elements, "Transaksi berhasil ditambahkan.", "success");
    syncSubmitState();
  });

  elements.transactionCancelEditButton.addEventListener("click", () => {
    resetForm(elements);
    store.setState((prev) => ({ ...prev, editingId: "" }));
    syncSubmitState();
  });

  elements.transactionList.addEventListener("click", (event) => {
    const target = event.target.closest("button[data-action][data-id]");
    if (!target) return;

    const state = store.getState();
    const transaction = state.transactions.find((item) => item.id === target.dataset.id);
    if (!transaction) return;

    if (target.dataset.action === "delete") {
      const confirmed = window.confirm("Hapus transaksi ini?");
      if (!confirmed) return;

      const next = state.transactions.filter((item) => item.id !== transaction.id);
      persistAndSetTransactions(next);
      if (state.editingId === transaction.id) {
        resetForm(elements);
        store.setState((prev) => ({ ...prev, editingId: "" }));
      }
      showToast(elements, "Transaksi dihapus.", "neutral");
      syncSubmitState();
      return;
    }

    if (target.dataset.action === "edit") {
      fillFormForEdit(elements, transaction);
      store.setState((prev) => ({ ...prev, editingId: transaction.id }));
      elements.transactionDate.focus();
      syncSubmitState();
    }
  });

  store.subscribe(() => {
    queueRender();
    syncSubmitState();
  });

  setupCategoryOptions(elements);
  resetForm(elements);
  applyTheme(store.getState().theme);

  subscribeAuthState((user) => {
    if (user) {
      const transactions = loadTransactions(user.uid);
      store.setState((prev) => ({
        ...prev,
        isLoading: false,
        user,
        transactions,
        editingId: "",
      }));
      resetForm(elements);
      showToast(elements, "Login berhasil.", "success");
      return;
    }

    store.setState((prev) => ({
      ...prev,
      isLoading: false,
      user: null,
      transactions: [],
      editingId: "",
    }));
    resetForm(elements);
  });
}
