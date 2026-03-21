const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value) {
  return rupiahFormatter.format(value);
}

export function getRawAmount(value) {
  if (!value) return 0;
  const digits = value.toString().replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function syncAmountInput(inputElement) {
  const rawAmount = getRawAmount(inputElement.value);

  if (!rawAmount) {
    inputElement.value = "";
    inputElement.dataset.raw = "";
    return 0;
  }

  inputElement.dataset.raw = String(rawAmount);
  inputElement.value = formatRupiah(rawAmount);
  return rawAmount;
}

export function updateBalance(balanceElement, balance) {
  balanceElement.textContent = formatRupiah(balance);
}

export function updateSummary(summaryElement, totals, hasTransactions) {
  if (!hasTransactions) {
    summaryElement.textContent = "Belum ada transaksi. Tambahkan sekarang.";
    return;
  }

  summaryElement.textContent = `Pemasukan ${formatRupiah(totals.income)} | Pengeluaran ${formatRupiah(totals.expense)}`;
}

export function updateCount(countElement, count) {
  countElement.textContent = `${count} transaksi`;
}

export function renderTransactions(listElement, emptyElement, transactions) {
  listElement.innerHTML = "";

  if (!transactions.length) {
    emptyElement.classList.remove("hidden");
    return;
  }

  emptyElement.classList.add("hidden");
  const fragment = document.createDocumentFragment();

  transactions.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "flex items-center justify-between gap-3 rounded-2xl border border-[#d8dbdf] bg-white px-4 py-3 text-sm";

    const info = document.createElement("div");
    info.className = "flex flex-col";

    const description = document.createElement("span");
    description.className = "font-medium text-slate-800";
    description.textContent = item.desc || item.description || "-";

    const type = document.createElement("span");
    type.className = "text-xs text-slate-400";
    const typeLabel = item.type === "income" ? "Pemasukan" : "Pengeluaran";
    const categoryLabel = item.category || "Lainnya";
    type.textContent = `${typeLabel} • ${categoryLabel}`;

    info.append(description, type);

    const amountWrap = document.createElement("div");
    amountWrap.className = "flex items-center gap-2.5";

    const amount = document.createElement("span");
    amount.className = item.type === "income" ? "font-semibold text-emerald-600" : "font-semibold text-rose-500";
    amount.textContent = `${item.type === "income" ? "+" : "-"} ${formatRupiah(item.amount)}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.dataset.id = String(item.id || "");
    removeButton.className =
      "rounded-full border border-[#d8dbdf] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 transition hover:border-rose-200 hover:text-rose-600";
    removeButton.textContent = "Hapus";

    amountWrap.append(amount, removeButton);
    listItem.append(info, amountWrap);
    fragment.appendChild(listItem);
  });

  listElement.appendChild(fragment);
}
