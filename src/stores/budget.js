import { defineStore } from "pinia";
import { ref } from "vue";

export const useBudgetStore = defineStore("budget", () => {
  const budgets = ref([]);
  const isLoading = ref(false);

  function loadFromStorage() {
    const saved = localStorage.getItem("mt:budgets");
    if (saved) {
      budgets.value = JSON.parse(saved);
    }
  }

  function saveToStorage() {
    localStorage.setItem("mt:budgets", JSON.stringify(budgets.value));
  }

  async function fetchBudgets(userId, month) {
    isLoading.value = true;
    try {
      loadFromStorage();
      // Filter is done visually on frontend, or we just return all
    } catch (error) {
      console.error("Failed fetching budgets:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function setBudget(userId, category, limitAmount, month) {
    const index = budgets.value.findIndex((b) => b.category === category && b.month === month);
    let newBudget;
    if (index !== -1) {
      budgets.value[index].limit_amount = limitAmount;
      newBudget = budgets.value[index];
    } else {
      newBudget = { id: Date.now(), user_id: userId, category, limit_amount: limitAmount, month };
      budgets.value.push(newBudget);
    }
    saveToStorage();
    return newBudget;
  }

  function overrideAll(newBudgets) {
    budgets.value = newBudgets;
    saveToStorage();
  }

  return { budgets, isLoading, fetchBudgets, setBudget, overrideAll };
});
