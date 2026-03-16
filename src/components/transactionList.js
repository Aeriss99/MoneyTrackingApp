import { formatCurrency, formatDateTime } from "../utils/formatters.js";

function createBadge(text, className) {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = text;
  return badge;
}

export function renderTransactionList({
  listElement,
  emptyElement,
  wrapperElement,
  countElement,
  transactions,
}) {
  countElement.textContent = `${transactions.length} items`;
  listElement.innerHTML = "";

  if (!transactions.length) {
    emptyElement.classList.remove("hidden");
    wrapperElement.classList.add("hidden");
    return;
  }

  const fragment = document.createDocumentFragment();

  transactions.forEach((item) => {
    const li = document.createElement("li");
    li.className = "rounded-2xl border border-slate-200 bg-white p-4 shadow-fintech dark:border-slate-700 dark:bg-slate-900";

    const topRow = document.createElement("div");
    topRow.className = "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between";

    const infoWrap = document.createElement("div");
    infoWrap.className = "min-w-0";

    const badges = document.createElement("div");
    badges.className = "flex flex-wrap items-center gap-2";

    badges.append(
      createBadge(
        item.category,
        "inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
      )
    );
    badges.append(
      createBadge(
        item.type,
        `inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
          item.type === "income"
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
            : "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
        }`
      )
    );

    const note = document.createElement("p");
    note.className = "mt-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100";
    note.textContent = item.note || "Tanpa catatan";

    const meta = document.createElement("p");
    meta.className = "mt-1 text-[11px] text-slate-500 dark:text-slate-400";
    meta.textContent = `${item.date} • Updated ${formatDateTime(item.updatedAt)}`;

    infoWrap.append(badges, note, meta);

    const actionWrap = document.createElement("div");
    actionWrap.className = "flex items-center justify-between gap-3 sm:block sm:shrink-0 sm:text-right";

    const amount = document.createElement("p");
    amount.className = `text-sm font-bold ${item.type === "income" ? "text-emerald-500" : "text-rose-500"}`;
    amount.textContent = `${item.type === "income" ? "+" : "-"} ${formatCurrency(item.amount)}`;

    const actions = document.createElement("div");
    actions.className = "flex items-center justify-end gap-1.5 sm:mt-2";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.dataset.action = "edit";
    editButton.dataset.id = item.id;
    editButton.className = "rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200";
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = item.id;
    deleteButton.className = "rounded-lg border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-500";
    deleteButton.textContent = "Delete";

    actions.append(editButton, deleteButton);
    actionWrap.append(amount, actions);

    topRow.append(infoWrap, actionWrap);
    li.appendChild(topRow);
    fragment.appendChild(li);
  });

  listElement.appendChild(fragment);
  emptyElement.classList.add("hidden");
  wrapperElement.classList.remove("hidden");
}
