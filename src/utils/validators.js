import { CATEGORIES, TRANSACTION_TYPES } from "./constants.js";

const categorySet = new Set(CATEGORIES.map((item) => item.value));
const typeSet = new Set(Object.values(TRANSACTION_TYPES));

export function validateTransactionInput(input) {
  if (!input) return { valid: false, message: "Data transaksi tidak valid." };

  if (!input.date) {
    return { valid: false, message: "Tanggal transaksi wajib diisi." };
  }

  const date = new Date(input.date);
  if (Number.isNaN(date.getTime())) {
    return { valid: false, message: "Format tanggal tidak valid." };
  }

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, message: "Jumlah harus lebih dari Rp0." };
  }

  if (!typeSet.has(input.type)) {
    return { valid: false, message: "Tipe transaksi tidak valid." };
  }

  if (!categorySet.has(input.category)) {
    return { valid: false, message: "Kategori transaksi tidak valid." };
  }

  if (String(input.note || "").trim().length > 180) {
    return { valid: false, message: "Catatan maksimal 180 karakter." };
  }

  return { valid: true, message: "" };
}
