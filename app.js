const STORAGE_KEY = "money-tracker-transactions-v2";

const TYPE_LABELS = {
  income: "Income",
  expense: "Expense",
};

const CATEGORY_MAP = {
  income: ["Salary", "Bonus", "Freelance", "Investment", "Gift", "Other Income"],
  expense: ["Food", "Transport", "Bills", "Shopping", "Health", "Education", "Other Expense"],
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const elements = {
  todayDate: document.getElementById("today-date"),
  balanceValue: document.getElementById("balance-value"),
  incomeValue: document.getElementById("income-value"),
  expenseValue: document.getElementById("expense-value"),
  countValue: document.getElementById("count-value"),
  transactionCount: document.getElementById("transaction-count"),
  transactionList: document.getElementById("transaction-list"),
  emptyState: document.getElementById("empty-state"),
  emptyActionBtn: document.getElementById("empty-action-btn"),
  addSampleBtn: document.getElementById("add-sample-btn"),
  searchInput: document.getElementById("search-input"),
  filterType: document.getElementById("filter-type"),
  clearFiltersBtn: document.getElementById("clear-filters-btn"),
  form: document.getElementById("transaction-form"),
  transactionId: document.getElementById("transaction-id"),
  descriptionInput: document.getElementById("description-input"),
  amountInput: document.getElementById("amount-input"),
  typeInput: document.getElementById("type-input"),
  categoryInput: document.getElementById("category-input"),
  dateInput: document.getElementById("date-input"),
  noteInput: document.getElementById("note-input"),
  formMode: document.getElementById("form-mode"),
  formTitle: document.getElementById("form-title"),
  formFeedback: document.getElementById("form-feedback"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  submitBtn: document.getElementById("submit-btn"),
  toastRoot: document.getElementById("toast-root"),
};

const state = {
  transactions: loadTransactions(),
  filters: {
    search: "",
    type: "all",
  },
  editingId: null,
};

let renderScheduled = false;
let searchDebounceTimer = null;

initializeApp();

function initializeApp() {
  elements.todayDate.textContent = dateFormatter.format(new Date());
  elements.dateInput.value = toInputDate(new Date());
  syncCategoryOptions(elements.typeInput.value);
  wireEvents();
  updateSubmitState();
  queueRender();
}

function wireEvents() {
  elements.amountInput.addEventListener("input", handleAmountInput);
  elements.descriptionInput.addEventListener("input", updateSubmitState);
  elements.typeInput.addEventListener("change", handleTypeChange);
  elements.categoryInput.addEventListener("change", updateSubmitState);
  elements.dateInput.addEventListener("change", updateSubmitState);
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.cancelEditBtn.addEventListener("click", enterCreateMode);
  elements.transactionList.addEventListener("click", handleTransactionAction);
  elements.addSampleBtn.addEventListener("click", addSampleTransaction);
  elements.emptyActionBtn.addEventListener("click", focusDescriptionInput);
  elements.clearFiltersBtn.addEventListener("click", clearFilters);
  elements.filterType.addEventListener("change", handleFilterTypeChange);
  elements.searchInput.addEventListener("input", handleSearchInput);
}

function handleAmountInput() {
  const value = parseAmountInput(elements.amountInput.value);
  elements.amountInput.dataset.raw = value ? String(value) : "";
  elements.amountInput.value = value ? numberFormatter.format(value) : "";
  updateSubmitState();
}

function handleTypeChange() {
  syncCategoryOptions(elements.typeInput.value);
  updateSubmitState();
}

function handleFilterTypeChange() {
  state.filters.type = elements.filterType.value;
  queueRender();
}

function handleSearchInput(event) {
  const nextValue = event.target.value;
  window.clearTimeout(searchDebounceTimer);
  searchDebounceTimer = window.setTimeout(() => {
    state.filters.search = nextValue.trim();
    queueRender();
  }, 120);
}

function clearFilters() {
  state.filters.search = "";
  state.filters.type = "all";
  elements.searchInput.value = "";
  elements.filterType.value = "all";
  queueRender();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const payload = getFormPayload();
  const validation = validatePayload(payload);

  if (!validation.valid) {
    showFormFeedback(validation.message, "error");
    showToast(validation.message, "error");
    updateSubmitState();
    return;
  }

  if (state.editingId) {
    const index = state.transactions.findIndex((transaction) => transaction.id === state.editingId);

    if (index === -1) {
      showFormFeedback("Transaction not found. Try again.", "error");
      return;
    }

    state.transactions[index] = {
      ...state.transactions[index],
      ...payload,
      updatedAt: Date.now(),
    };

    persistTransactions();
    queueRender();
    showToast("Transaction updated", "success");
    showFormFeedback("Transaction updated successfully.", "success");
    enterCreateMode();
    return;
  }

  const transaction = {
    id: createId(),
    ...payload,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  state.transactions.unshift(transaction);
  persistTransactions();
  queueRender();
  showToast("Transaction added", "success");
  showFormFeedback("Transaction added successfully.", "success");
  resetFormFields();
  updateSubmitState();
}

function getFormPayload() {
  const rawAmount = Number(elements.amountInput.dataset.raw || parseAmountInput(elements.amountInput.value));

  return {
    description: String(elements.descriptionInput.value || "").trim(),
    amount: rawAmount,
    type: elements.typeInput.value,
    category: String(elements.categoryInput.value || "").trim(),
    date: elements.dateInput.value,
    note: String(elements.noteInput.value || "").trim(),
  };
}

function validatePayload(payload) {
  if (payload.description.length < 2) {
    return { valid: false, message: "Description must be at least 2 characters." };
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return { valid: false, message: "Amount must be greater than 0." };
  }

  if (payload.type !== "income" && payload.type !== "expense") {
    return { valid: false, message: "Invalid transaction type." };
  }

  if (!payload.category) {
    return { valid: false, message: "Category is required." };
  }

  if (!isValidInputDate(payload.date)) {
    return { valid: false, message: "Date is required." };
  }

  return { valid: true, message: "" };
}

function handleTransactionAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const item = button.closest("li[data-id]");
  if (!item) return;

  const transaction = state.transactions.find((entry) => entry.id === item.dataset.id);
  if (!transaction) return;

  const action = button.dataset.action;

  if (action === "edit") {
    enterEditMode(transaction);
    return;
  }

  if (action === "delete") {
    const shouldDelete = window.confirm(`Delete transaction "${transaction.description}"?`);
    if (!shouldDelete) return;

    state.transactions = state.transactions.filter((entry) => entry.id !== transaction.id);
    persistTransactions();
    queueRender();
    showToast("Transaction deleted", "success");

    if (state.editingId === transaction.id) {
      enterCreateMode();
    }
  }
}

function enterEditMode(transaction) {
  state.editingId = transaction.id;
  elements.transactionId.value = transaction.id;
  elements.descriptionInput.value = transaction.description;
  elements.amountInput.dataset.raw = String(transaction.amount);
  elements.amountInput.value = numberFormatter.format(transaction.amount);
  elements.typeInput.value = transaction.type;
  syncCategoryOptions(transaction.type, transaction.category);
  elements.dateInput.value = transaction.date;
  elements.noteInput.value = transaction.note || "";
  elements.formMode.textContent = "EDIT";
  elements.formTitle.textContent = "Edit Transaction";
  elements.submitBtn.textContent = "Update Transaction";
  elements.cancelEditBtn.hidden = false;
  showFormFeedback("Editing mode is active.", "success");
  updateSubmitState();
  elements.descriptionInput.focus();
}

function enterCreateMode() {
  state.editingId = null;
  elements.formMode.textContent = "CREATE";
  elements.formTitle.textContent = "Add Transaction";
  elements.submitBtn.textContent = "Add Transaction";
  elements.cancelEditBtn.hidden = true;
  resetFormFields();
  showFormFeedback("", "");
  updateSubmitState();
}

function resetFormFields() {
  elements.transactionId.value = "";
  elements.descriptionInput.value = "";
  elements.amountInput.value = "";
  elements.amountInput.dataset.raw = "";
  elements.typeInput.value = "expense";
  syncCategoryOptions("expense");
  elements.dateInput.value = toInputDate(new Date());
  elements.noteInput.value = "";
}

function syncCategoryOptions(type, preferredCategory = "") {
  const options = CATEGORY_MAP[type] || CATEGORY_MAP.expense;
  const categories = preferredCategory && !options.includes(preferredCategory)
    ? [preferredCategory, ...options]
    : options;

  elements.categoryInput.innerHTML = "";

  categories.forEach((categoryName) => {
    const option = document.createElement("option");
    option.value = categoryName;
    option.textContent = categoryName;
    elements.categoryInput.appendChild(option);
  });

  if (preferredCategory) {
    elements.categoryInput.value = preferredCategory;
  }
}

function focusDescriptionInput() {
  elements.descriptionInput.focus();
  elements.form.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function queueRender() {
  if (renderScheduled) return;
  renderScheduled = true;

  window.requestAnimationFrame(() => {
    renderScheduled = false;
    renderApp();
  });
}

function renderApp() {
  const summary = calculateSummary(state.transactions);
  const visibleTransactions = getVisibleTransactions(state.transactions, state.filters);

  elements.balanceValue.textContent = formatCurrency(summary.balance);
  elements.incomeValue.textContent = formatCurrency(summary.income);
  elements.expenseValue.textContent = formatCurrency(summary.expense);
  elements.countValue.textContent = String(summary.count);

  elements.transactionCount.textContent = `${visibleTransactions.length} record${visibleTransactions.length === 1 ? "" : "s"}`;
  renderTransactionList(visibleTransactions);
  renderEmptyState(visibleTransactions.length, state.transactions.length);
}

function calculateSummary(transactions) {
  let income = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") income += transaction.amount;
    else expense += transaction.amount;
  });

  return {
    income,
    expense,
    balance: income - expense,
    count: transactions.length,
  };
}

function getVisibleTransactions(transactions, filters) {
  const normalizedSearch = filters.search.toLowerCase();

  return [...transactions]
    .filter((transaction) => (filters.type === "all" ? true : transaction.type === filters.type))
    .filter((transaction) => {
      if (!normalizedSearch) return true;
      const searchableText = `${transaction.description} ${transaction.category} ${transaction.note} ${transaction.type}`.toLowerCase();
      return searchableText.includes(normalizedSearch);
    })
    .sort(sortTransactions);
}

function renderTransactionList(transactions) {
  elements.transactionList.innerHTML = "";

  if (!transactions.length) return;

  const fragment = document.createDocumentFragment();

  transactions.forEach((transaction) => {
    const item = document.createElement("li");
    item.className = "transaction-item";
    item.dataset.id = transaction.id;

    const main = document.createElement("div");
    main.className = "transaction-main";

    const title = document.createElement("p");
    title.className = "transaction-title";
    title.textContent = transaction.description;

    const note = document.createElement("p");
    note.className = "transaction-note";
    note.textContent = transaction.note || "No note";

    const badges = document.createElement("div");
    badges.className = "transaction-badges";

    const typeBadge = document.createElement("span");
    typeBadge.className = `badge ${transaction.type === "income" ? "badge--type-income" : "badge--type-expense"}`;
    typeBadge.textContent = TYPE_LABELS[transaction.type];

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "badge badge--category";
    categoryBadge.textContent = transaction.category;

    badges.append(typeBadge, categoryBadge);
    main.append(title, note, badges);

    const amountGroup = document.createElement("div");
    amountGroup.className = "transaction-amount-group";

    const amount = document.createElement("p");
    amount.className = `transaction-amount ${transaction.type === "income" ? "transaction-amount--income" : "transaction-amount--expense"}`;
    amount.textContent = `${transaction.type === "income" ? "+" : "-"} ${formatCurrency(transaction.amount)}`;

    const date = document.createElement("p");
    date.className = "transaction-date";
    date.textContent = formatDisplayDate(transaction.date);

    amountGroup.append(amount, date);

    const actions = document.createElement("div");
    actions.className = "transaction-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-button";
    editButton.dataset.action = "edit";
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-button action-button--danger";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Delete";

    actions.append(editButton, deleteButton);

    item.append(main, amountGroup, actions);
    fragment.appendChild(item);
  });

  elements.transactionList.appendChild(fragment);
}

function renderEmptyState(visibleCount, totalCount) {
  if (visibleCount > 0) {
    elements.emptyState.hidden = true;
    return;
  }

  elements.emptyState.hidden = false;

  const title = elements.emptyState.querySelector(".empty-title");
  const description = elements.emptyState.querySelector(".empty-description");

  if (totalCount > 0) {
    title.textContent = "No matching transactions";
    description.textContent = "Try changing your search text or filters.";
    return;
  }

  title.textContent = "No transactions yet";
  description.textContent = "Start by adding your first income or expense.";
}

function updateSubmitState() {
  const description = elements.descriptionInput.value.trim();
  const amount = Number(elements.amountInput.dataset.raw || parseAmountInput(elements.amountInput.value));
  const category = elements.categoryInput.value.trim();
  const date = elements.dateInput.value;

  const isValid = description.length >= 2 && amount > 0 && !!category && isValidInputDate(date);
  elements.submitBtn.disabled = !isValid;
}

function addSampleTransaction() {
  const samplePool = [
    { description: "Monthly Salary", amount: 8500000, type: "income", category: "Salary", note: "Main job payment" },
    { description: "Groceries", amount: 320000, type: "expense", category: "Food", note: "Weekly groceries" },
    { description: "Ride Hailing", amount: 76000, type: "expense", category: "Transport", note: "Office commute" },
  ];

  const sample = samplePool[Math.floor(Math.random() * samplePool.length)];

  state.transactions.unshift({
    id: createId(),
    ...sample,
    date: toInputDate(new Date()),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  persistTransactions();
  queueRender();
  showToast("Sample transaction added", "success");
}

function persistTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeTransaction)
      .filter(Boolean)
      .sort(sortTransactions);
  } catch (error) {
    console.error("Failed to load transactions:", error);
    return [];
  }
}

function normalizeTransaction(transaction) {
  if (!transaction || typeof transaction !== "object") return null;

  const description = String(transaction.description || transaction.desc || "").trim();
  const amount = Number(transaction.amount ?? parseAmountInput(transaction.amount));
  const type = transaction.type === "income" ? "income" : "expense";
  const category = String(transaction.category || defaultCategory(type)).trim();
  const date = normalizeDate(transaction.date);
  const note = String(transaction.note || "").trim();

  if (!description || amount <= 0 || !date) return null;

  return {
    id: String(transaction.id || createId()),
    description,
    amount,
    type,
    category,
    date,
    note,
    createdAt: Number(transaction.createdAt) || Date.now(),
    updatedAt: Number(transaction.updatedAt) || Date.now(),
  };
}

function normalizeDate(value) {
  if (typeof value === "string" && isValidInputDate(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toInputDate(date);
}

function toInputDate(date) {
  const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return adjustedDate.toISOString().slice(0, 10);
}

function isValidInputDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseAmountInput(value) {
  const numeric = String(value || "").replace(/[^\d]/g, "");
  return numeric ? Number(numeric) : 0;
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `tx-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function defaultCategory(type) {
  return (CATEGORY_MAP[type] && CATEGORY_MAP[type][0]) || "Other";
}

function sortTransactions(a, b) {
  if (a.date === b.date) return b.updatedAt - a.updatedAt;
  return b.date.localeCompare(a.date);
}

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatDisplayDate(dateInput) {
  const date = new Date(`${dateInput}T00:00:00`);
  return Number.isNaN(date.getTime()) ? dateInput : dateFormatter.format(date);
}

function showFormFeedback(message, tone) {
  elements.formFeedback.textContent = message;
  elements.formFeedback.classList.remove("form-feedback--error", "form-feedback--success");

  if (tone === "error") {
    elements.formFeedback.classList.add("form-feedback--error");
  } else if (tone === "success") {
    elements.formFeedback.classList.add("form-feedback--success");
  }
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
  }, 2200);
}
