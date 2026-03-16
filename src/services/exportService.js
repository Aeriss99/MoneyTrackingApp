import { downloadCsv, toCsvString } from "../utils/csv.js";
import { formatCurrency } from "../utils/formatters.js";

export function exportTransactionsToCsv(transactions) {
  const headers = ["Date", "Type", "Category", "Amount", "Note"];
  const rows = transactions.map((item) => [
    item.date,
    item.type,
    item.category,
    formatCurrency(item.amount),
    item.note || "",
  ]);

  const csv = toCsvString(headers, rows);
  const filename = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsv(filename, csv);
}
