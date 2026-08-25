import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTransactionStore = defineStore("transactions", () => {
  const transactions = ref([]);
  const stats = ref(null);
  const isLoading = ref(false);

  // Load from local storage directly
  function loadFromStorage() {
    const saved = localStorage.getItem("mt:transactions");
    if (saved) {
      transactions.value = JSON.parse(saved);
    }
  }

  function saveToStorage() {
    localStorage.setItem("mt:transactions", JSON.stringify(transactions.value));
    calculateStats();
  }

  async function fetchAll(userId) {
    isLoading.value = true;
    try {
      loadFromStorage();
      calculateStats();
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function addTransaction(payload) {
    const newTx = {
      ...payload,
      id: Date.now() + Math.floor(Math.random() * 1000), // Simple unique ID
      created_at: new Date().toISOString()
    };
    transactions.value.unshift(newTx);
    saveToStorage();
    return newTx;
  }

  async function updateTransaction(id, payload) {
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions.value[index] = { ...transactions.value[index], ...payload };
      saveToStorage();
    }
    return transactions.value[index];
  }

  async function deleteTransaction(id, userId) {
    transactions.value = transactions.value.filter((t) => t.id !== id);
    saveToStorage();
  }

  // Frontend calculation matching backend logic
  function calculateStats() {
    const userTxs = transactions.value;
    
    let totalIncome = 0;
    let totalExpense = 0;
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayPrefix = currentMonthPrefix + `-${String(now.getDate()).padStart(2, '0')}`;
    
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let todayExpense = 0;
    
    const catMap = {};
    const accMap = {};
    const trendMap = {};

    userTxs.forEach(tx => {
      // Balance
      if (tx.type === 'income') totalIncome += tx.amount;
      if (tx.type === 'expense') totalExpense += tx.amount;
      
      // Monthly & Today
      if (tx.date.startsWith(currentMonthPrefix)) {
        if (tx.type === 'income') monthlyIncome += tx.amount;
        if (tx.type === 'expense') {
          monthlyExpense += tx.amount;
          catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
        }
      }
      if (tx.date.startsWith(todayPrefix) && tx.type === 'expense') {
        todayExpense += tx.amount;
      }
      
      // Account Breakdown
      const acc = tx.account_name || tx.accountName || 'Cash';
      if (!accMap[acc]) accMap[acc] = { account_name: acc, balance: 0, transaction_count: 0 };
      accMap[acc].transaction_count += 1;
      accMap[acc].balance += (tx.type === 'income' ? tx.amount : -tx.amount);
      
      // Trend
      const monthKey = tx.date.substring(0, 7); // YYYY-MM
      const tKey = `${monthKey}_${tx.type}`;
      if (!trendMap[tKey]) trendMap[tKey] = { month: monthKey, type: tx.type, total: 0 };
      trendMap[tKey].total += tx.amount;
    });

    const categoryBreakdown = Object.keys(catMap).map(k => ({ category: k, total: catMap[k] }))
                                   .sort((a,b) => b.total - a.total);
                                   
    stats.value = {
      balance: totalIncome - totalExpense,
      monthlyIncome,
      monthlyExpense,
      todayExpense,
      transactionCount: userTxs.length,
      categoryBreakdown,
      accountBalances: Object.values(accMap).sort((a,b) => b.balance - a.balance),
      monthlyTrend: Object.values(trendMap)
    };
  }

  // Add this strictly for frontend bulk imports
  function bulkAddTransactions(newTxs) {
    const formatted = newTxs.map(tx => ({
      ...tx,
      id: Date.now() + Math.floor(Math.random() * 10000),
      created_at: new Date().toISOString()
    }));
    transactions.value = [...formatted, ...transactions.value];
    saveToStorage();
    return formatted.length;
  }

  function overrideAll(newTransactions) {
    transactions.value = newTransactions;
    saveToStorage();
  }

  async function refreshStats(userId) {
    calculateStats();
  }

  return {
    transactions,
    stats,
    isLoading,
    fetchAll,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkAddTransactions,
    overrideAll,
    refreshStats,
  };
});
