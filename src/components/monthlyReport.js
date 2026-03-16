import { formatCurrency } from "../utils/formatters.js";

export function renderMonthlyReport(listElement, monthlyRows) {
  listElement.innerHTML = "";

  if (!monthlyRows.length) {
    const item = document.createElement("li");
    item.className = "rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";
    item.textContent = "Belum ada data bulanan.";
    listElement.appendChild(item);
    return;
  }

  const fragment = document.createDocumentFragment();

  monthlyRows.forEach((row) => {
    const item = document.createElement("li");
    item.className = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
    item.innerHTML = `
      <div class="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-100">
        <span>${row.label}</span>
        <span>${row.count} tx</span>
      </div>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-emerald-500">Income: ${formatCurrency(row.income)}</span>
        <span class="text-rose-500">Expense: ${formatCurrency(row.expense)}</span>
      </div>
      <p class="mt-1 text-slate-500 dark:text-slate-400">Top expense: ${row.topCategory || "-"}</p>
    `;
    fragment.appendChild(item);
  });

  listElement.appendChild(fragment);
}
