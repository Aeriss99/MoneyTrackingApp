export function addTransaction(list, transaction) {
  return [...list, transaction];
}

export function removeTransaction(list, index) {
  return list.filter((_, i) => i !== index);
}

export function getTotals(list) {
  return list.reduce(
    (acc, item) => {
      const amount = Number(item.amount) || 0;

      if (item.type === "income") {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

export function getBalance(list) {
  const { income, expense } = getTotals(list);
  return income - expense;
}

export function getExpenseByCategory(list) {
  return list.reduce((acc, item) => {
    if (item.type !== "expense") return acc;

    const category = item.category || "Lainnya";
    const amount = Number(item.amount) || 0;

    if (!amount) return acc;

    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});
}
