const STORAGE_PREFIX = "money-tracker:transactions";

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}:${userId || "guest"}`;
}

function parseTransactions(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse local transactions:", error);
    return [];
  }
}

function readTransactions(userId) {
  const key = getStorageKey(userId);
  const rawValue = localStorage.getItem(key);
  return parseTransactions(rawValue);
}

function writeTransactions(userId, transactions) {
  const key = getStorageKey(userId);
  localStorage.setItem(key, JSON.stringify(transactions));
}

function createTransactionId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `tx-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export async function fetchTransactions(userId) {
  const transactions = readTransactions(userId);
  return transactions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function createTransaction(userId, transaction) {
  const existing = readTransactions(userId);
  const payload = {
    ...transaction,
    id: createTransactionId(),
    createdAt: Date.now(),
  };

  writeTransactions(userId, [payload, ...existing]);
  return payload;
}

export async function deleteTransaction(userId, transactionId) {
  const existing = readTransactions(userId);
  const filtered = existing.filter((item) => item.id !== transactionId);
  writeTransactions(userId, filtered);
}
