import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useBudgetStore = defineStore("budget", () => {
  const budgets = ref([]);
  const isLoading = ref(false);

  async function fetchBudgets(userId, month) {
    isLoading.value = true;
    try {
      const { data } = await axios.get(`/api/budgets/${userId}/${month}`);
      budgets.value = data.budgets;
    } catch (error) {
      console.error("Failed fetching budgets:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function setBudget(userId, category, limitAmount, month) {
    try {
      const { data } = await axios.post("/api/budgets", {
        userId,
        category,
        limitAmount,
        month
      });
      const index = budgets.value.findIndex((b) => b.category === category && b.month === month);
      if (index !== -1) {
        budgets.value[index] = data.budget;
      } else {
        budgets.value.push(data.budget);
      }
      return data.budget;
    } catch (error) {
      console.error("Failed setting budget:", error);
      throw error;
    }
  }

  return { budgets, isLoading, fetchBudgets, setBudget };
});
