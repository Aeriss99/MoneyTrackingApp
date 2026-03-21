import { logoutCurrentUser, subscribeAuthState, waitForAuthReady } from "./src/js/auth.js";
import {
  createTransaction,
  deleteTransaction,
  subscribeDeleteHistory,
  subscribeUserTransactions,
  updateTransaction,
} from "./src/js/transactionsDb.js";
import { saveSecurityPin, subscribeSecurityPin, verifySecurityPin } from "./src/js/securityDb.js";
import {
  escapeHtml,
  formatCurrency,
  formatDisplayDate,
  formatRupiahInputByDigits,
  handleAmountKeydown,
  highlightMatch,
  normalizeRupiahInputElement,
  parseAmount,
  parseDateInput,
  sanitizeAmountDigits,
  toDateInputValue,
} from "./src/js/formatters.js";

const CATEGORY_OPTIONS = {
  income: ["Salary", "Bonus", "Freelance", "Investment", "Gift", "Other Income"],
  expense: ["Food", "Transport", "Bills", "Shopping", "Health", "Education", "Other Expense"],
};

const CATEGORY_COLOR_MAP = {
  Salary: "#0f9f70",
  Bonus: "#14967d",
  Freelance: "#1e89be",
  Investment: "#2169d8",
  Gift: "#7e5fd8",
  "Other Income": "#426195",
  Food: "#df5f48",
  Transport: "#0f84b2",
  Bills: "#7354d0",
  Shopping: "#d14d82",
  Health: "#1e9b79",
  Education: "#d28f24",
  "Other Expense": "#5b6c8e",
};

const elements = {
  todayDate: document.getElementById("today-date"),
  globalSearch: document.getElementById("global-search"),
  userPhoto: document.getElementById("user-photo"),
  userName: document.getElementById("user-name"),
  userEmail: document.getElementById("user-email"),
  logoutButton: document.getElementById("logout-btn"),
  summaryBalance: document.getElementById("summary-balance"),
  summaryIncome: document.getElementById("summary-income"),
  summaryExpense: document.getElementById("summary-expense"),
  summaryCount: document.getElementById("summary-count"),
  transactionCountBadge: document.getElementById("transaction-count-badge"),
  transactionsLoading: document.getElementById("transactions-loading"),
  transactionList: document.getElementById("transaction-list"),
  transactionsEmpty: document.getElementById("transactions-empty"),
  emptyTitle: document.getElementById("empty-title"),
  emptyDescription: document.getElementById("empty-description"),
  deleteHistoryLoading: document.getElementById("delete-history-loading"),
  deleteHistoryList: document.getElementById("delete-history-list"),
  deleteHistoryEmpty: document.getElementById("delete-history-empty"),
  form: document.getElementById("transaction-form"),
  editingId: document.getElementById("editing-id"),
  formMode: document.getElementById("form-mode"),
  formTitle: document.getElementById("form-title"),
  descriptionInput: document.getElementById("description-input"),
  amountInput: document.getElementById("amount-input"),
  typeInput: document.getElementById("type-input"),
  categoryInput: document.getElementById("category-input"),
  dateInput: document.getElementById("date-input"),
  noteInput: document.getElementById("note-input"),
  formFeedback: document.getElementById("form-feedback"),
  cancelEditButton: document.getElementById("cancel-edit-btn"),
  submitButton: document.getElementById("submit-btn"),
  pinForm: document.getElementById("pin-form"),
  pinInput: document.getElementById("pin-input"),
  pinConfirmInput: document.getElementById("pin-confirm-input"),
  pinFeedback: document.getElementById("pin-feedback"),
  pinSaveButton: document.getElementById("pin-save-btn"),
  pinStatusBadge: document.getElementById("pin-status-badge"),
  profileSecuritySection: document.getElementById("profile-security"),
  pinModal: document.getElementById("pin-modal"),
  pinModalBackdrop: document.getElementById("pin-modal-backdrop"),
  pinModalTitle: document.getElementById("pin-modal-title"),
  pinModalDesc: document.getElementById("pin-modal-desc"),
  pinModalInput: document.getElementById("pin-modal-input"),
  pinModalFeedback: document.getElementById("pin-modal-feedback"),
  pinModalCancelButton: document.getElementById("pin-modal-cancel-btn"),
  pinModalConfirmButton: document.getElementById("pin-modal-confirm-btn"),
  toastRoot: document.getElementById("toast-root"),
};

const state = {
  user: null,
  transactions: [],
  filteredTransactions: [],
  deleteHistory: [],
  searchKeyword: "",
  editingId: "",
  isTransactionsLoading: true,
  isDeleteHistoryLoading: true,
  isSaving: false,
  isPinSaving: false,
  isPinChecking: false,
  deletingIds: new Set(),
  authResolved: false,
  unsubscribeTransactions: null,
  unsubscribeDeleteHistory: null,
  unsubscribeSecurityPin: null,
  pinHash: "",
  hasPin: false,
  dateTickTimeoutId: null,
  dateTickIntervalId: null,
  secureIntent: null,
};

initializeDashboard();

function initializeDashboard() {
  hideProfileSecuritySection();
  renderTodayDate();
  elements.dateInput.value = toDateInputValue(new Date());
  syncCategoryOptions(elements.typeInput.value);
  normalizeRupiahInputElement(elements.amountInput);
  bindEvents();
  startTodayAutoUpdate();
  applySearchFilter();
  renderAll();
  renderPinStatus();
  subscribeToAuth();
  updateSubmitState();
}

function bindEvents() {
  elements.globalSearch.addEventListener("input", handleSearchInput);
  elements.logoutButton.addEventListener("click", handleLogoutClick);
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.cancelEditButton.addEventListener("click", enterCreateMode);
  elements.typeInput.addEventListener("change", handleTypeChange);
  elements.descriptionInput.addEventListener("input", updateSubmitState);
  elements.categoryInput.addEventListener("change", updateSubmitState);
  elements.dateInput.addEventListener("change", updateSubmitState);
  elements.noteInput.addEventListener("input", updateSubmitState);
  elements.amountInput.addEventListener("keydown", handleAmountKeydown);
  elements.amountInput.addEventListener("input", handleAmountInput);
  elements.amountInput.addEventListener("focus", handleAmountFocus);
  elements.transactionList.addEventListener("click", handleTransactionActions);
  elements.pinForm.addEventListener("submit", handlePinFormSubmit);
  elements.pinModalCancelButton.addEventListener("click", closePinModal);
  elements.pinModalConfirmButton.addEventListener("click", confirmPinModal);
  elements.pinModalBackdrop.addEventListener("click", closePinModal);
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function renderTodayDate() {
  elements.todayDate.textContent = formatDisplayDate(new Date());
}

function scheduleNextDateTick() {
  if (state.dateTickTimeoutId) clearTimeout(state.dateTickTimeoutId);

  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const delay = Math.max(1, nextMidnight.getTime() - now.getTime());

  state.dateTickTimeoutId = window.setTimeout(() => {
    renderTodayDate();
    scheduleNextDateTick();
  }, delay);
}

function startTodayAutoUpdate() {
  renderTodayDate();
  scheduleNextDateTick();

  if (state.dateTickIntervalId) clearInterval(state.dateTickIntervalId);
  state.dateTickIntervalId = window.setInterval(() => {
    renderTodayDate();
  }, 60 * 1000);
}

function handleVisibilityChange() {
  if (document.visibilityState !== "visible") return;
  renderTodayDate();
  scheduleNextDateTick();
}

async function subscribeToAuth() {
  try {
    await waitForAuthReady();
  } catch (error) {
    console.error("Auth initialization failed:", error);
  }

  subscribeAuthState((user) => {
    state.authResolved = true;

    if (!user) {
      cleanupSubscriptions();
      resetAllState();
      window.location.replace("./index.html");
      return;
    }

    const isDifferentUser = state.user?.uid !== user.uid;
    state.user = user;
    renderUserIdentity();

    if (isDifferentUser) {
      resetPinStateForUserSwitch();
      subscribeToUserTransactions(user.uid);
      subscribeToDeleteHistoryCollection(user.uid);
      subscribeToSecurityPinCollection(user.uid);
    }
  });
}

function cleanupSubscriptions() {
  if (typeof state.unsubscribeTransactions === "function") state.unsubscribeTransactions();
  if (typeof state.unsubscribeDeleteHistory === "function") state.unsubscribeDeleteHistory();
  if (typeof state.unsubscribeSecurityPin === "function") state.unsubscribeSecurityPin();
  state.unsubscribeTransactions = null;
  state.unsubscribeDeleteHistory = null;
  state.unsubscribeSecurityPin = null;
}

function resetAllState() {
  state.transactions = [];
  state.filteredTransactions = [];
  state.deleteHistory = [];
  state.pinHash = "";
  state.hasPin = false;
  hideProfileSecuritySection();
}

function resetPinStateForUserSwitch() {
  state.pinHash = "";
  state.hasPin = false;
  closePinModal();
  setPinFeedback("", "");
  renderPinStatus();
  hideProfileSecuritySection();
}

function showProfileSecuritySection() {
  if (!elements.profileSecuritySection) return;
  elements.profileSecuritySection.hidden = false;
}

function hideProfileSecuritySection() {
  if (!elements.profileSecuritySection) return;
  elements.profileSecuritySection.hidden = true;
  elements.profileSecuritySection.classList.remove("pin-section--highlight");
}

function subscribeToUserTransactions(userId) {
  if (typeof state.unsubscribeTransactions === "function") state.unsubscribeTransactions();
  state.isTransactionsLoading = true;
  renderTransactionsSection();

  state.unsubscribeTransactions = subscribeUserTransactions(
    userId,
    (transactions) => {
      state.transactions = sortTransactions(transactions);
      applySearchFilter();
      state.isTransactionsLoading = false;
      renderAll();
    },
    () => {
      state.isTransactionsLoading = false;
      showToast("Failed loading transactions from Firestore.", "error");
      renderTransactionsSection();
    },
  );
}

function subscribeToDeleteHistoryCollection(userId) {
  if (typeof state.unsubscribeDeleteHistory === "function") state.unsubscribeDeleteHistory();
  state.deleteHistory = [];
  state.isDeleteHistoryLoading = true;
  renderDeleteHistorySection();

  state.unsubscribeDeleteHistory = subscribeDeleteHistory(
    userId,
    (historyItems) => {
      state.deleteHistory = [...historyItems];
      state.isDeleteHistoryLoading = false;
      renderDeleteHistorySection();
    },
    () => {
      state.isDeleteHistoryLoading = false;
      showToast("Failed loading delete history.", "error");
      renderDeleteHistorySection();
    },
  );
}

function subscribeToSecurityPinCollection(userId) {
  if (typeof state.unsubscribeSecurityPin === "function") state.unsubscribeSecurityPin();
  state.pinHash = "";
  state.hasPin = false;
  renderPinStatus();

  state.unsubscribeSecurityPin = subscribeSecurityPin(
    userId,
    (security) => {
      if (!state.user || state.user.uid !== userId) return;
      state.pinHash = security.pinHash || "";
      state.hasPin = Boolean(security.hasPin);
      renderPinStatus();
    },
    () => {
      showToast("Failed loading PIN settings.", "error");
    },
  );
}

function handleSearchInput(event) {
  state.searchKeyword = event.target.value.trim();
  applySearchFilter();
  renderTransactionsSection();
}

function applySearchFilter() {
  const keyword = state.searchKeyword.toLowerCase();

  if (!keyword) {
    state.filteredTransactions = [...state.transactions];
    return;
  }

  state.filteredTransactions = state.transactions.filter((transaction) => {
    const searchable = `${transaction.description} ${transaction.category} ${transaction.type}`.toLowerCase();
    return searchable.includes(keyword);
  });
}

function renderAll() {
  renderSummaryCards();
  renderTransactionsSection();
  renderDeleteHistorySection();
  updateSubmitState();
}

function renderUserIdentity() {
  const name = state.user?.displayName || "MoneyTracking User";
  const email = state.user?.email || "No email";
  const photo =
    state.user?.photoURL ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='100%25' height='100%25' fill='%23dbe6fb'/%3E%3Ctext x='50%25' y='56%25' text-anchor='middle' fill='%23315285' font-size='26' font-family='Arial'%3EU%3C/text%3E%3C/svg%3E";

  elements.userName.textContent = name;
  elements.userEmail.textContent = email;
  elements.userPhoto.src = photo;
  elements.userPhoto.alt = name;
}

function renderSummaryCards() {
  const balance = computeCurrentBalance();
  const income = state.transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = state.transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  elements.summaryIncome.textContent = formatCurrency(income);
  elements.summaryExpense.textContent = formatCurrency(expense);
  elements.summaryBalance.textContent = formatCurrency(balance);
  elements.summaryCount.textContent = String(state.transactions.length);
}

function renderTransactionsSection() {
  elements.transactionsLoading.hidden = !state.isTransactionsLoading;
  elements.transactionList.innerHTML = "";

  const visibleItems = state.filteredTransactions;
  elements.transactionCountBadge.textContent = `${visibleItems.length} item${visibleItems.length === 1 ? "" : "s"}`;

  if (state.isTransactionsLoading) {
    elements.transactionsEmpty.hidden = true;
    return;
  }

  if (!visibleItems.length) {
    renderEmptyState();
    return;
  }

  elements.transactionsEmpty.hidden = true;
  const fragment = document.createDocumentFragment();
  const keyword = state.searchKeyword;

  visibleItems.forEach((transaction) => {
    const listItem = document.createElement("li");
    const isEditing = state.editingId === transaction.id;
    listItem.className = `transaction-item${isEditing ? " transaction-item--editing" : ""}`;
    listItem.dataset.id = transaction.id;

    const typeLabel = transaction.type === "income" ? "Income" : "Expense";
    const categoryColor = getCategoryColor(transaction.category);
    const isDeleting = state.deletingIds.has(transaction.id);

    listItem.innerHTML = `
      <div class="transaction-main">
        <p class="transaction-title">${highlightMatch(transaction.description, keyword)}</p>
        <p class="transaction-note">${escapeHtml(transaction.note || "No note")}</p>
        <div class="transaction-badges">
          <span class="badge ${transaction.type === "income" ? "badge--income" : "badge--expense"}">${highlightMatch(typeLabel, keyword)}</span>
          <span class="badge badge--category" style="background:${categoryColor.bg}; color:${categoryColor.text};">${highlightMatch(transaction.category, keyword)}</span>
        </div>
      </div>
      <div class="transaction-amount-wrap">
        <p class="transaction-amount ${transaction.type === "income" ? "transaction-amount--income" : "transaction-amount--expense"}">
          ${transaction.type === "income" ? "+" : "-"} ${formatCurrency(transaction.amount)}
        </p>
        <p class="transaction-date">${formatDisplayDate(transaction.date)}</p>
      </div>
      <div class="transaction-actions">
        <button type="button" class="action-btn" data-action="edit" data-id="${transaction.id}" ${isDeleting ? "disabled" : ""}>Edit</button>
        <button type="button" class="action-btn action-btn--danger" data-action="delete" data-id="${transaction.id}" ${isDeleting ? "disabled" : ""}>
          ${isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    `;

    fragment.appendChild(listItem);
  });

  elements.transactionList.appendChild(fragment);
}

function renderEmptyState() {
  elements.transactionsEmpty.hidden = false;

  if (state.transactions.length === 0) {
    elements.emptyTitle.textContent = "No transactions yet";
    elements.emptyDescription.textContent = "Add your first income or expense to get started.";
    return;
  }

  elements.emptyTitle.textContent = "No transactions found";
  elements.emptyDescription.textContent = "Try using another keyword in search.";
}

function renderDeleteHistorySection() {
  elements.deleteHistoryLoading.hidden = !state.isDeleteHistoryLoading;
  elements.deleteHistoryList.innerHTML = "";

  if (state.isDeleteHistoryLoading) {
    elements.deleteHistoryEmpty.hidden = true;
    return;
  }

  if (!state.deleteHistory.length) {
    elements.deleteHistoryEmpty.hidden = false;
    return;
  }

  elements.deleteHistoryEmpty.hidden = true;
  const fragment = document.createDocumentFragment();

  state.deleteHistory.forEach((entry) => {
    const historyItem = document.createElement("li");
    historyItem.className = "history-item";
    const typeLabel = entry.type === "income" ? "Income" : "Expense";
    const categoryColor = getCategoryColor(entry.category);
    const deletedAt = formatDisplayDate(entry.deletedAt);

    historyItem.innerHTML = `
      <p class="history-title">${escapeHtml(entry.description)}</p>
      <div class="history-badges">
        <span class="badge ${entry.type === "income" ? "badge--income" : "badge--expense"}">${typeLabel}</span>
        <span class="badge badge--category" style="background:${categoryColor.bg}; color:${categoryColor.text};">${escapeHtml(entry.category)}</span>
      </div>
      <p class="history-meta">Deleted: ${deletedAt} • Amount: ${formatCurrency(entry.amount)}</p>
    `;

    fragment.appendChild(historyItem);
  });

  elements.deleteHistoryList.appendChild(fragment);
}

function renderPinStatus() {
  if (state.hasPin) {
    elements.pinStatusBadge.textContent = "PIN Active";
    return;
  }

  elements.pinStatusBadge.textContent = "Not Set";
}

function handleTypeChange(event) {
  syncCategoryOptions(event.target.value);
  updateSubmitState();
}

function syncCategoryOptions(type, preferredCategory = "") {
  const options = CATEGORY_OPTIONS[type] || CATEGORY_OPTIONS.expense;
  const categories = preferredCategory && !options.includes(preferredCategory)
    ? [preferredCategory, ...options]
    : options;

  elements.categoryInput.innerHTML = "";
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryInput.appendChild(option);
  });

  if (preferredCategory) {
    elements.categoryInput.value = preferredCategory;
  }
}

function handleAmountInput() {
  normalizeRupiahInputElement(elements.amountInput);
  updateSubmitState();
}

function handleAmountFocus() {
  if (!elements.amountInput.value) {
    elements.amountInput.value = "Rp ";
    elements.amountInput.dataset.raw = "";
  }
}

function getFormPayload() {
  return {
    description: String(elements.descriptionInput.value || "").trim(),
    amount: parseAmount(elements.amountInput.value),
    type: elements.typeInput.value,
    category: String(elements.categoryInput.value || "").trim(),
    date: parseDateInput(elements.dateInput.value),
    note: String(elements.noteInput.value || "").trim(),
  };
}

function computeCurrentBalance(excludedTransactionId = "") {
  return state.transactions.reduce((sum, item) => {
    if (excludedTransactionId && item.id === excludedTransactionId) return sum;
    return sum + (item.type === "income" ? item.amount : -item.amount);
  }, 0);
}

function validatePayload(payload) {
  if (!payload.description || payload.description.length < 2) {
    return { valid: false, message: "Description must be at least 2 characters." };
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return { valid: false, message: "Amount must be greater than 0." };
  }

  if (payload.type !== "income" && payload.type !== "expense") {
    return { valid: false, message: "Transaction type is invalid." };
  }

  if (!payload.category) {
    return { valid: false, message: "Category is required." };
  }

  if (!(payload.date instanceof Date) || Number.isNaN(payload.date.getTime())) {
    return { valid: false, message: "Please select a valid date." };
  }

  const baseBalance = computeCurrentBalance(state.editingId || "");
  const projectedBalance = baseBalance + (payload.type === "income" ? payload.amount : -payload.amount);

  if (projectedBalance < 0) {
    return {
      valid: false,
      message: "Saldo tidak cukup. Expense tidak boleh membuat saldo menjadi minus.",
    };
  }

  return { valid: true };
}

async function handleFormSubmit(event) {
  event.preventDefault();
  if (state.isSaving || !state.user) return;

  const payload = getFormPayload();
  const validation = validatePayload(payload);

  if (!validation.valid) {
    setFormFeedback(validation.message, "error");
    showToast(validation.message, "error");
    return;
  }

  setSavingState(true);

  try {
    if (state.editingId) {
      await updateTransaction(state.user.uid, state.editingId, payload);
      setFormFeedback("Transaction updated successfully.", "success");
      showToast("Transaction updated.", "success");
      enterCreateMode();
      renderAll();
    } else {
      await createTransaction(state.user.uid, payload);
      setFormFeedback("Transaction added successfully.", "success");
      showToast("Transaction saved.", "success");
      resetForm();
      renderAll();
    }
  } catch (error) {
    console.error("Save transaction failed:", error);
    const message = "Failed saving transaction. Please try again.";
    setFormFeedback(message, "error");
    showToast(message, "error");
  } finally {
    setSavingState(false);
  }
}

function handleTransactionActions(event) {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button || !state.user) return;

  const action = button.dataset.action;
  const transactionId = button.dataset.id;
  if (!transactionId) return;

  if (action === "edit") {
    startEditById(transactionId);
    return;
  }

  if (action !== "delete") return;

  if (!state.hasPin || !state.pinHash) {
    routeToProfileSecuritySetup();
    return;
  }

  openPinModal(transactionId);
}

function routeToProfileSecuritySetup() {
  showProfileSecuritySection();
  showToast("Buat PIN dulu di Profile Security sebelum delete transaksi.", "error");
  setPinFeedback("PIN wajib dibuat sebelum delete transaksi.", "error");

  const section = elements.profileSecuritySection;
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "center" });
    section.classList.add("pin-section--highlight");

    window.setTimeout(() => {
      section.classList.remove("pin-section--highlight");
    }, 1400);
  }

  window.setTimeout(() => {
    elements.pinInput.focus();
  }, 180);
}

function openPinModal(transactionId) {
  state.secureIntent = { transactionId };
  elements.pinModalTitle.textContent = "PIN Verification";
  elements.pinModalDesc.textContent = "Masukkan PIN untuk menghapus transaksi secara permanen.";
  elements.pinModalInput.value = "";
  setPinModalFeedback("", "");
  elements.pinModal.hidden = false;
  elements.pinModalInput.focus();
}

function closePinModal() {
  elements.pinModal.hidden = true;
  elements.pinModalInput.value = "";
  setPinModalFeedback("", "");
  state.secureIntent = null;
}

async function confirmPinModal() {
  if (!state.secureIntent || state.isPinChecking) return;

  if (!state.hasPin || !state.pinHash) {
    closePinModal();
    routeToProfileSecuritySetup();
    return;
  }

  const pinValue = String(elements.pinModalInput.value || "").trim();
  if (!/^\d{6}$/.test(pinValue)) {
    setPinModalFeedback("PIN must be exactly 6 digits.", "error");
    return;
  }

  state.isPinChecking = true;
  elements.pinModalConfirmButton.disabled = true;
  elements.pinModalCancelButton.disabled = true;
  elements.pinModalConfirmButton.textContent = "Checking...";

  try {
    const isValidPin = await verifySecurityPin(pinValue, state.pinHash);

    if (!isValidPin) {
      setPinModalFeedback("PIN is incorrect.", "error");
      return;
    }

    const { transactionId } = state.secureIntent;
    closePinModal();
    await confirmAndDeleteById(transactionId);
  } catch (error) {
    console.error("PIN verification failed:", error);
    setPinModalFeedback("Failed verifying PIN.", "error");
  } finally {
    state.isPinChecking = false;
    elements.pinModalConfirmButton.disabled = false;
    elements.pinModalCancelButton.disabled = false;
    elements.pinModalConfirmButton.textContent = "Confirm";
  }
}

async function handlePinFormSubmit(event) {
  event.preventDefault();
  if (state.isPinSaving || !state.user) return;

  const pin = String(elements.pinInput.value || "").trim();
  const confirmPin = String(elements.pinConfirmInput.value || "").trim();

  if (!/^\d{6}$/.test(pin)) {
    setPinFeedback("PIN must be exactly 6 digits.", "error");
    return;
  }

  if (pin !== confirmPin) {
    setPinFeedback("PIN confirmation does not match.", "error");
    return;
  }

  state.isPinSaving = true;
  elements.pinSaveButton.disabled = true;
  elements.pinSaveButton.textContent = "Saving...";

  try {
    await saveSecurityPin(state.user.uid, pin);
    elements.pinInput.value = "";
    elements.pinConfirmInput.value = "";
    setPinFeedback("PIN saved successfully.", "success");
    showToast("Security PIN saved.", "success");
  } catch (error) {
    console.error("Failed saving PIN:", error);
    const message = mapPinSaveError(error);
    setPinFeedback(message, "error");
    showToast(message, "error");
  } finally {
    state.isPinSaving = false;
    elements.pinSaveButton.disabled = false;
    elements.pinSaveButton.textContent = "Save PIN";
  }
}

function mapPinSaveError(error) {
  const code = String(error?.code || "").toLowerCase();
  const rawMessage = String(error?.message || "").toLowerCase();

  if (code.includes("permission-denied")) {
    return "Gagal simpan PIN: Firestore rules belum mengizinkan path settings/security.";
  }

  if (code.includes("unauthenticated")) {
    return "Sesi login tidak valid. Silakan login ulang.";
  }

  if (code.includes("unavailable") || code.includes("network")) {
    return "Koneksi ke Firestore bermasalah. Periksa internet lalu coba lagi.";
  }

  if (code.includes("failed-precondition")) {
    return "Firestore database belum aktif pada project Firebase.";
  }

  if (rawMessage.includes("crypto") || rawMessage.includes("subtle")) {
    return "Browser tidak mendukung Web Crypto untuk hashing PIN.";
  }

  return `Failed saving PIN (${code || "unknown error"}).`;
}

function setPinFeedback(message, tone) {
  elements.pinFeedback.textContent = message || "";
  elements.pinFeedback.classList.remove("form-feedback--error", "form-feedback--success");

  if (tone === "error") elements.pinFeedback.classList.add("form-feedback--error");
  if (tone === "success") elements.pinFeedback.classList.add("form-feedback--success");
}

function setPinModalFeedback(message, tone) {
  elements.pinModalFeedback.textContent = message || "";
  elements.pinModalFeedback.classList.remove("form-feedback--error", "form-feedback--success");

  if (tone === "error") elements.pinModalFeedback.classList.add("form-feedback--error");
  if (tone === "success") elements.pinModalFeedback.classList.add("form-feedback--success");
}

function startEditById(transactionId) {
  const transaction = state.transactions.find((item) => item.id === transactionId);
  if (!transaction) return;

  state.editingId = transaction.id;
  elements.editingId.value = transaction.id;
  elements.formMode.textContent = "EDIT";
  elements.formTitle.textContent = "Edit Transaction";
  elements.submitButton.textContent = "Update Transaction";
  elements.cancelEditButton.hidden = false;

  elements.descriptionInput.value = transaction.description;
  elements.amountInput.value = formatRupiahInputByDigits(sanitizeAmountDigits(String(transaction.amount)));
  elements.amountInput.dataset.raw = sanitizeAmountDigits(String(transaction.amount));
  elements.typeInput.value = transaction.type;
  syncCategoryOptions(transaction.type, transaction.category);
  elements.dateInput.value = toDateInputValue(transaction.date);
  elements.noteInput.value = transaction.note || "";
  setFormFeedback("Editing transaction.", "success");
  updateSubmitState();
  renderTransactionsSection();
  elements.descriptionInput.focus();
}

async function confirmAndDeleteById(transactionId) {
  const transaction = state.transactions.find((item) => item.id === transactionId);
  if (!transaction || !state.user) return;

  const confirmDelete = window.confirm(`Delete "${transaction.description}" permanently?`);
  if (!confirmDelete) return;

  state.deletingIds.add(transactionId);
  renderTransactionsSection();

  try {
    await deleteTransaction(state.user.uid, transaction);
    state.transactions = state.transactions.filter((item) => item.id !== transactionId);
    applySearchFilter();

    if (state.editingId === transactionId) {
      enterCreateMode();
    }

    renderAll();
    showToast("Transaction deleted.", "success");
  } catch (error) {
    console.error("Delete transaction failed:", error);
    showToast("Failed deleting transaction.", "error");
  } finally {
    state.deletingIds.delete(transactionId);
    renderTransactionsSection();
  }
}

function enterCreateMode() {
  state.editingId = "";
  elements.editingId.value = "";
  elements.formMode.textContent = "CREATE";
  elements.formTitle.textContent = "Add Transaction";
  elements.submitButton.textContent = "Save Transaction";
  elements.cancelEditButton.hidden = true;
  resetForm();
  setFormFeedback("", "");
  renderTransactionsSection();
}

function resetForm() {
  elements.descriptionInput.value = "";
  elements.typeInput.value = "expense";
  syncCategoryOptions("expense");
  elements.dateInput.value = toDateInputValue(new Date());
  elements.noteInput.value = "";
  elements.amountInput.value = "Rp ";
  elements.amountInput.dataset.raw = "";
  updateSubmitState();
}

function setFormFeedback(message, tone) {
  elements.formFeedback.textContent = message || "";
  elements.formFeedback.classList.remove("form-feedback--error", "form-feedback--success");

  if (tone === "error") elements.formFeedback.classList.add("form-feedback--error");
  if (tone === "success") elements.formFeedback.classList.add("form-feedback--success");
}

function updateSubmitState() {
  const payload = getFormPayload();
  const validation = validatePayload(payload);
  elements.submitButton.disabled = state.isSaving || !validation.valid;
}

function setSavingState(nextState) {
  state.isSaving = nextState;
  elements.descriptionInput.disabled = nextState;
  elements.amountInput.disabled = nextState;
  elements.typeInput.disabled = nextState;
  elements.categoryInput.disabled = nextState;
  elements.dateInput.disabled = nextState;
  elements.noteInput.disabled = nextState;
  elements.cancelEditButton.disabled = nextState;
  elements.submitButton.disabled = nextState || elements.submitButton.disabled;
  elements.submitButton.textContent = nextState
    ? (state.editingId ? "Updating..." : "Saving...")
    : (state.editingId ? "Update Transaction" : "Save Transaction");

  if (!nextState) updateSubmitState();
}

async function handleLogoutClick() {
  if (!state.user) return;

  const originalText = elements.logoutButton.textContent;
  elements.logoutButton.disabled = true;
  elements.logoutButton.textContent = "Signing out...";

  try {
    await logoutCurrentUser();
    window.location.replace("./index.html");
  } catch (error) {
    console.error("Logout failed:", error);
    showToast("Failed to logout. Try again.", "error");
  } finally {
    elements.logoutButton.disabled = false;
    elements.logoutButton.textContent = originalText;
  }
}

function sortTransactions(items) {
  return [...items].sort((a, b) => {
    const dateDiff = b.date.getTime() - a.date.getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function hexToRgba(hexColor, alpha) {
  const normalizedHex = hexColor.replace("#", "");
  if (normalizedHex.length !== 6) return `rgba(95, 110, 140, ${alpha})`;

  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getCategoryColor(category) {
  const fallback = "#4f6287";
  const color = CATEGORY_COLOR_MAP[category] || fallback;
  return { text: color, bg: hexToRgba(color, 0.16) };
}

function showToast(message, tone = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${tone === "error" ? "toast--error" : "toast--success"}`;
  toast.textContent = message;
  elements.toastRoot.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast--visible");
  });

  window.setTimeout(() => {
    toast.classList.remove("toast--visible");
    toast.addEventListener(
      "transitionend",
      () => {
        toast.remove();
      },
      { once: true },
    );
  }, 2600);
}
