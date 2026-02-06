export function addTransaction(list, transaction) {
  return [...list, transaction];
}

export function removeTransaction(list, index) {
  return list.filter((_, i) => i !== index);
}

export function getTotals(list) {
  return list.reduce(
    (acc, item) => {
      if (item.type === "income") {
        acc.income += item.amount;
      } else {
        acc.expense += item.amount;
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
