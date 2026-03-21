import {
  Timestamp,
  collection,
  db,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "./firebase.js";

function getUserTransactionsCollection(userId) {
  return collection(db, "users", userId, "transactions");
}

function getDeleteHistoryCollection(userId) {
  return collection(db, "users", userId, "delete_history");
}

function getTransactionDocRef(userId, transactionId) {
  return doc(db, "users", userId, "transactions", transactionId);
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  return null;
}

function toTimestamp(value) {
  const date = toDate(value);
  if (!date) return null;
  return Timestamp.fromDate(date);
}

function normalizeTransactionSnapshot(snapshotItem) {
  const data = snapshotItem.data();
  const date = toDate(data.date) || toDate(data.createdAt) || new Date();
  const createdAt = toDate(data.createdAt) || date;

  return {
    id: String(data.id || snapshotItem.id),
    description: String(data.description || "").trim(),
    amount: Number(data.amount || 0),
    type: data.type === "income" ? "income" : "expense",
    category: String(data.category || "").trim(),
    date,
    note: String(data.note || "").trim(),
    createdAt,
  };
}

function normalizeDeleteHistorySnapshot(snapshotItem) {
  const data = snapshotItem.data();
  const originalDate = toDate(data.originalDate) || toDate(data.date) || null;
  const createdAt = toDate(data.createdAt) || null;
  const deletedAt = toDate(data.deletedAt) || new Date();

  return {
    id: String(data.id || snapshotItem.id),
    transactionId: String(data.transactionId || ""),
    description: String(data.description || "").trim(),
    amount: Number(data.amount || 0),
    type: data.type === "income" ? "income" : "expense",
    category: String(data.category || "").trim(),
    note: String(data.note || "").trim(),
    originalDate,
    createdAt,
    deletedAt,
    deletedBy: String(data.deletedBy || ""),
  };
}

export function subscribeUserTransactions(userId, onData, onError) {
  const baseQuery = query(getUserTransactionsCollection(userId));

  return onSnapshot(
    baseQuery,
    (snapshot) => {
      const transactions = snapshot.docs
        .map(normalizeTransactionSnapshot)
        .filter((item) => item.description && item.amount > 0 && item.category);

      onData(transactions);
    },
    (error) => {
      console.error("Firestore transaction subscription error:", error);
      onError(error);
    },
  );
}

export function subscribeDeleteHistory(userId, onData, onError, maxItems = 20) {
  const baseQuery = query(getDeleteHistoryCollection(userId));

  return onSnapshot(
    baseQuery,
    (snapshot) => {
      const historyItems = snapshot.docs
        .map(normalizeDeleteHistorySnapshot)
        .filter((item) => item.transactionId && item.description)
        .sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime())
        .slice(0, maxItems);

      onData(historyItems);
    },
    (error) => {
      console.error("Firestore delete-history subscription error:", error);
      onError(error);
    },
  );
}

export async function createTransaction(userId, payload) {
  const collectionRef = getUserTransactionsCollection(userId);
  const transactionRef = doc(collectionRef);
  const dateTimestamp = Timestamp.fromDate(payload.date);

  await setDoc(transactionRef, {
    id: transactionRef.id,
    description: payload.description,
    amount: payload.amount,
    type: payload.type,
    category: payload.category,
    date: dateTimestamp,
    note: payload.note,
    createdAt: serverTimestamp(),
  });

  return transactionRef.id;
}

export async function updateTransaction(userId, transactionId, payload) {
  const transactionRef = getTransactionDocRef(userId, transactionId);
  const dateTimestamp = Timestamp.fromDate(payload.date);

  await updateDoc(transactionRef, {
    description: payload.description,
    amount: payload.amount,
    type: payload.type,
    category: payload.category,
    date: dateTimestamp,
    note: payload.note,
  });
}

export async function deleteTransaction(userId, transaction) {
  const transactionId = typeof transaction === "string" ? transaction : transaction?.id;
  if (!transactionId) {
    throw new Error("deleteTransaction requires a valid transaction id.");
  }

  const transactionRef = getTransactionDocRef(userId, transactionId);
  const historyRef = doc(getDeleteHistoryCollection(userId));
  const batch = writeBatch(db);

  if (transaction && typeof transaction === "object") {
    batch.set(historyRef, {
      id: historyRef.id,
      transactionId,
      description: String(transaction.description || "").trim(),
      amount: Number(transaction.amount || 0),
      type: transaction.type === "income" ? "income" : "expense",
      category: String(transaction.category || "").trim(),
      note: String(transaction.note || "").trim(),
      originalDate: toTimestamp(transaction.date),
      createdAt: toTimestamp(transaction.createdAt),
      deletedAt: serverTimestamp(),
      deletedBy: userId,
    });
  } else {
    batch.set(historyRef, {
      id: historyRef.id,
      transactionId,
      description: "(unknown)",
      amount: 0,
      type: "expense",
      category: "Unknown",
      note: "",
      deletedAt: serverTimestamp(),
      deletedBy: userId,
    });
  }

  batch.delete(transactionRef);
  await batch.commit();
}
