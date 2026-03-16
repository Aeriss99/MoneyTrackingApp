import { formatCurrency } from "../utils/formatters.js";

export function renderDashboardCards(elements, stats) {
  elements.statTotalBalance.textContent = formatCurrency(stats.totalBalance);
  elements.statMonthIncome.textContent = formatCurrency(stats.monthIncome);
  elements.statMonthExpense.textContent = formatCurrency(stats.monthExpense);
  elements.statSavingsRate.textContent = `${stats.savingsRate.toFixed(1)}%`;
}
