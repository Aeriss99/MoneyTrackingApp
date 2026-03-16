import { STORAGE_PREFIX, TRANSACTION_TYPES } from "../utils/constants.js";
import { parseAmountInput, toInputDate } from "../utils/formatters.js";

function buildStorageKey(userId) {
  return `${STORAGE_PREFIX}:transactions:${userId || "guest"}`;
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `tx-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeTransaction(item) {
  if (!item || typeof item !== "object") return null;

  const amount = Number(item.amount ?? parseAmountInput(item.amount));
  const type = item.type === TRANSACTION_TYPES.INCOME ? TRANSACTION_TYPES.INCOME : TRANSACTION_TYPES.EXPENSE;
  const date = item.date ? toInputDate(item.date) : "";
  const note = String(item.note || "").trim();
  const category = String(item.category || "").trim();

  if (!amount || amount <= 0 || !date || !category) return null;

  return {
    id: String(item.id || createId()),
    date,
    amount,
    category,
    type,
    note,
    createdAt: Number(item.createdAt) || Date.now(),
    updatedAt: Number(item.updatedAt) || Date.now(),
  };
}

export function loadTransactions(userId) {
  try {
    const raw = localStorage.getItem(buildStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeTransaction)
      .filter(Boolean)
      .sort((a, b) => {
        if (a.date === b.date) return b.createdAt - a.createdAt;
        return b.date.localeCompare(a.date);
      });
  } catch (error) {
    console.error("Failed loading transactions:", error);
    return [];
  }
}

export function saveTransactions(userId, transactions) {
  localStorage.setItem(buildStorageKey(userId), JSON.stringify(transactions));
}

export function createTransaction(payload) {
  return {
    id: createId(),
    date: payload.date,
    amount: Number(payload.amount),
    category: payload.category,
    type: payload.type,
    note: String(payload.note || "").trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function updateTransaction(existing, payload) {
  return {
    ...existing,
    date: payload.date,
    amount: Number(payload.amount),
    category: payload.category,
    type: payload.type,
    note: String(payload.note || "").trim(),
    updatedAt: Date.now(),
  };
}
