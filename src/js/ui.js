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

export function syncAmountInput(inputEl) {
  const raw = getRawAmount(inputEl.value);
  if (!raw) {
    inputEl.value = "";
    inputEl.dataset.raw = "";
    return 0;
  }

  inputEl.dataset.raw = String(raw);
  inputEl.value = formatRupiah(raw);
  return raw;
}

export function updateBalance(balanceEl, balance) {
  balanceEl.textContent = formatRupiah(balance);
}

export function updateSummary(summaryEl, totals, hasTransactions) {
  if (!hasTransactions) {
    summaryEl.textContent = "Belum ada transaksi. Tambahkan sekarang.";
    return;
  }

  summaryEl.textContent = `Pemasukan ${formatRupiah(totals.income)} | Pengeluaran ${formatRupiah(totals.expense)}`;
}

export function updateCount(countEl, count) {
  countEl.textContent = `${count} transaksi`;
}

export function renderTransactions(listEl, emptyEl, transactions) {
  listEl.innerHTML = "";

  if (!transactions.length) {
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");

  const fragment = document.createDocumentFragment();

  transactions.forEach((item) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md";

    const info = document.createElement("div");
    info.className = "flex flex-col";

    const desc = document.createElement("span");
    desc.className = "font-medium text-slate-700";
    desc.textContent = item.desc;

    const type = document.createElement("span");
    type.className = "text-xs text-slate-400";
    type.textContent = item.type === "income" ? "Pemasukan" : "Pengeluaran";

    info.append(desc, type);

    const amountWrap = document.createElement("div");
    amountWrap.className = "flex items-center gap-3";

    const amount = document.createElement("span");
    amount.className =
      item.type === "income" ? "font-semibold text-emerald-600" : "font-semibold text-rose-500";
    amount.textContent = `${item.type === "income" ? "+" : "-"} ${formatRupiah(item.amount)}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.dataset.id = String(item.id || "");
    removeBtn.className =
      "rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-500";
    removeBtn.textContent = "Hapus";

    amountWrap.append(amount, removeBtn);
    li.append(info, amountWrap);
    fragment.appendChild(li);
  });

  listEl.appendChild(fragment);
}
