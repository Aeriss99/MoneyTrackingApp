import { CATEGORIES, TRANSACTION_TYPES } from "../utils/constants.js";
import { getMonthKey, getMonthLabel } from "../utils/formatters.js";

const categoryColorMap = CATEGORIES.reduce((acc, item) => {
  acc[item.value] = item.color;
  return acc;
}, {});

function getLastMonthKeys(total = 6) {
  const result = [];
  const now = new Date();
  const anchor = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let i = total - 1; i >= 0; i -= 1) {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    const key = getMonthKey(date);
    result.push({ key, label: getMonthLabel(key) });
  }

  return result;
}

function toggleEmpty(element, hasData) {
  if (!element) return;
  element.classList.toggle("hidden", hasData);
}

export class ChartController {
  constructor(elements) {
    this.elements = elements;
    this.expenseCategoryChart = null;
    this.incomeExpenseChart = null;
    this.monthlyTrendChart = null;
  }

  ensureCharts() {
    if (!window.Chart) return;

    if (!this.expenseCategoryChart) {
      this.expenseCategoryChart = new window.Chart(this.elements.expenseCategoryCanvas, {
        type: "doughnut",
        data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: { legend: { position: "bottom" } },
        },
      });
    }

    if (!this.incomeExpenseChart) {
      this.incomeExpenseChart = new window.Chart(this.elements.incomeExpenseCanvas, {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            { label: "Income", data: [], backgroundColor: "#10b981" },
            { label: "Expense", data: [], backgroundColor: "#f43f5e" },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    if (!this.monthlyTrendChart) {
      this.monthlyTrendChart = new window.Chart(this.elements.monthlyTrendCanvas, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Monthly Expense",
              data: [],
              borderColor: "#f43f5e",
              backgroundColor: "rgba(244,63,94,0.15)",
              fill: true,
              tension: 0.35,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
        },
      });
    }
  }

  updateExpenseCategoryChart(transactions) {
    const expenseByCategory = transactions.reduce((acc, item) => {
      if (item.type !== TRANSACTION_TYPES.EXPENSE) return acc;
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const labels = Object.keys(expenseByCategory);
    const values = labels.map((label) => expenseByCategory[label]);

    this.expenseCategoryChart.data.labels = labels;
    this.expenseCategoryChart.data.datasets[0].data = values;
    this.expenseCategoryChart.data.datasets[0].backgroundColor = labels.map(
      (label) => categoryColorMap[label] || "#64748b"
    );
    this.expenseCategoryChart.update();

    toggleEmpty(this.elements.expenseCategoryEmpty, labels.length > 0);
  }

  updateIncomeExpenseChart(transactions) {
    const months = getLastMonthKeys(6);
    const incomeMap = {};
    const expenseMap = {};

    months.forEach((item) => {
      incomeMap[item.key] = 0;
      expenseMap[item.key] = 0;
    });

    transactions.forEach((item) => {
      const monthKey = getMonthKey(item.date);
      if (!(monthKey in incomeMap)) return;
      if (item.type === TRANSACTION_TYPES.INCOME) incomeMap[monthKey] += item.amount;
      else expenseMap[monthKey] += item.amount;
    });

    this.incomeExpenseChart.data.labels = months.map((item) => item.label);
    this.incomeExpenseChart.data.datasets[0].data = months.map((item) => incomeMap[item.key]);
    this.incomeExpenseChart.data.datasets[1].data = months.map((item) => expenseMap[item.key]);
    this.incomeExpenseChart.update();

    const hasData = months.some((item) => incomeMap[item.key] > 0 || expenseMap[item.key] > 0);
    toggleEmpty(this.elements.incomeExpenseEmpty, hasData);
  }

  updateMonthlyTrendChart(transactions) {
    const months = getLastMonthKeys(6);
    const expenseMap = {};
    months.forEach((item) => {
      expenseMap[item.key] = 0;
    });

    transactions.forEach((item) => {
      if (item.type !== TRANSACTION_TYPES.EXPENSE) return;
      const monthKey = getMonthKey(item.date);
      if (monthKey in expenseMap) {
        expenseMap[monthKey] += item.amount;
      }
    });

    this.monthlyTrendChart.data.labels = months.map((item) => item.label);
    this.monthlyTrendChart.data.datasets[0].data = months.map((item) => expenseMap[item.key]);
    this.monthlyTrendChart.update();

    const hasData = months.some((item) => expenseMap[item.key] > 0);
    toggleEmpty(this.elements.monthlyTrendEmpty, hasData);
  }

  update(transactions) {
    this.ensureCharts();
    if (!this.expenseCategoryChart || !this.incomeExpenseChart || !this.monthlyTrendChart) return;

    this.updateExpenseCategoryChart(transactions);
    this.updateIncomeExpenseChart(transactions);
    this.updateMonthlyTrendChart(transactions);
  }
}
