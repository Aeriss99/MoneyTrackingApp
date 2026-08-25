import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useTransactionStore = defineStore("transactions", () => {
  const transactions = ref([]);
  const stats = ref(null);
  const isLoading = ref(false);
  const filter = ref({
    search: "",
    type: "all",
    category: "all",
    account: "all",
    sort: "newest",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const filtered = computed(() => {
    let result = [...transactions.value];
    if (filter.value.type !== "all") {
      result = result.filter((t) => t.type === filter.value.type);
    }
    if (filter.value.category !== "all") {
      result = result.filter((t) => t.category === filter.value.category);
    }
    if (filter.value.search) {
      const q = filter.value.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.note || "").toLowerCase().includes(q)
      );
    }
    return result;
  });

  async function fetchAll(userId, query = {}) {
    isLoading.value = true;
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "all") {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      const [txRes, statsRes] = await Promise.all([
        axios.get(`/api/transactions/${userId}${queryString ? `?${queryString}` : ""}`),
        axios.get(`/api/stats/${userId}`),
      ]);
      transactions.value = txRes.data.transactions;
      stats.value = statsRes.data;
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function addTransaction(payload) {
    const { data } = await axios.post("/api/transactions", payload);
    transactions.value.unshift(data.transaction);
    return data.transaction;
  }

  async function updateTransaction(id, payload) {
    const { data } = await axios.put(`/api/transactions/${id}`, payload);
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index !== -1) transactions.value[index] = data.transaction;
    return data.transaction;
  }

  async function deleteTransaction(id, userId) {
    await axios.delete(`/api/transactions/${id}`, { data: { userId } });
    transactions.value = transactions.value.filter((t) => t.id !== id);
  }

  async function refreshStats(userId) {
    const { data } = await axios.get(`/api/stats/${userId}`);
    stats.value = data;
  }

  return {
    transactions,
    stats,
    isLoading,
    filter,
    filtered,
    fetchAll,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshStats,
  };
});
