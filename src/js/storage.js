import { collection, addDoc, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "./firebase.js";
import { db } from "./firebase.js";

export async function fetchTransactions(userId) {
  const transactionsRef = collection(db, "users", userId, "transactions");
  const q = query(transactionsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function createTransaction(userId, transaction) {
  const transactionsRef = collection(db, "users", userId, "transactions");
  const payload = { ...transaction, createdAt: serverTimestamp() };
  await addDoc(transactionsRef, payload);
}

export async function deleteTransaction(userId, transactionId) {
  const transactionRef = doc(db, "users", userId, "transactions", transactionId);
  await deleteDoc(transactionRef);
}
