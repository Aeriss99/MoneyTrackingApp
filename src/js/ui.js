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
      "flex items-center justify-between gap-3 rounded-2xl border border-[#d8dbdf] bg-white px-4 py-3 text-sm transition hover:border-[#bfc5cd]";

    const info = document.createElement("div");
    info.className = "flex flex-col";

    const desc = document.createElement("span");
    desc.className = "font-medium text-slate-800";
    desc.textContent = item.desc;

    const type = document.createElement("span");
<<<<<<< HEAD
    type.className = "text-xs text-slate-400";
    const typeLabel = item.type === "income" ? "Pemasukan" : "Pengeluaran";
    const categoryLabel = item.category || "Lainnya";
    type.textContent = `${typeLabel} • ${categoryLabel}`;
=======
    type.className = "text-xs uppercase tracking-[0.15em] text-slate-400";
    type.textContent = item.type === "income" ? "Pemasukan" : "Pengeluaran";
>>>>>>> 101d5ec (feat(ui): update index page and add home.html)

    info.append(desc, type);

    const amountWrap = document.createElement("div");
    amountWrap.className = "flex items-center gap-2.5";

    const amount = document.createElement("span");
    amount.className =
      item.type === "income" ? "font-semibold text-emerald-600" : "font-semibold text-rose-500";
    amount.textContent = `${item.type === "income" ? "+" : "-"} ${formatRupiah(item.amount)}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.dataset.id = String(item.id || "");
    removeBtn.className =
      "rounded-full border border-[#d8dbdf] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 transition hover:border-rose-200 hover:text-rose-600";
    removeBtn.textContent = "Hapus";

    amountWrap.append(amount, removeBtn);
    li.append(info, amountWrap);
    fragment.appendChild(li);
  });

  listEl.appendChild(fragment);
}
