<template>
  <div class="neo-surface p-6">
    <div class="mb-5 flex items-center gap-3">
      <div class="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-neo-border dark:border-neo-darkBorder bg-neo-warning text-white text-lg shadow-soft-neo-sm dark:shadow-soft-neo-dark-sm">
        🎯
      </div>
      <div>
        <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Budgeting</span>
        <h2 class="text-xl font-black text-neo-dark dark:text-white leading-none">Target Anggaran</h2>
      </div>
    </div>

    <form @submit.prevent="handleSetBudget" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="relative z-10">
          <label class="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-300">Kategori</label>
          <NeoSelect v-model="form.category" :options="expenseCategories" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-300">Batas (Rp)</label>
          <input v-model="displayLimit" @input="handleLimitInput" type="text" placeholder="Rp 0" class="neo-input" />
        </div>
      </div>
      <button type="submit" :disabled="isSaving" class="neo-btn bg-neo-warning text-white w-full">
        {{ isSaving ? 'Menyimpan...' : 'Set Anggaran' }}
      </button>
    </form>

    <div v-if="budgetProgressList.length" class="mt-6 space-y-4">
      <div v-for="item in budgetProgressList" :key="item.category" class="space-y-2">
        <div class="flex items-center justify-between text-xs font-bold">
          <span class="text-neo-dark dark:text-white">{{ item.category }}</span>
          <span :class="item.percentage >= 100 ? 'text-neo-danger' : item.percentage >= 80 ? 'text-neo-warning' : 'text-neo-success'">
            {{ formatRp(item.spent) }} / {{ formatRp(item.limit) }} ({{ item.percentage }}%)
          </span>
        </div>
        <div class="h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neo-darkBg shadow-inner border border-gray-200 dark:border-white/10">
          <div
            :style="{ width: `${Math.min(item.percentage, 100)}%` }"
            :class="[
              'h-full transition-all duration-500 ease-out',
              item.percentage >= 100 ? 'bg-neo-danger' : item.percentage >= 80 ? 'bg-neo-warning' : 'bg-neo-success'
            ]"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useBudgetStore } from "../stores/budget.js";
import { useToastStore } from "../stores/toast.js";
import NeoSelect from "./NeoSelect.vue";

const expenseCategories = ["Makan", "Transport", "Tagihan", "Belanja", "Kesehatan", "Pendidikan", "Hiburan", "Lainnya"];

const props = defineProps({ userId: [String, Number], transactions: Array });
const emit = defineEmits(["updated"]);

const budgetStore = useBudgetStore();
const toast = useToastStore();

const isSaving = ref(false);
const limitValue = ref(0);
const form = ref({ category: "Makan" });

const displayLimit = computed(() => {
  if (!limitValue.value) return "";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(limitValue.value);
});

function handleLimitInput(e) {
  const digits = e.target.value.replace(/\D/g, "");
  limitValue.value = digits ? Number(digits) : 0;
}

const currentMonthStr = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
});

const budgetProgressList = computed(() => {
  const spentMap = {};
  const currentMonth = currentMonthStr.value;

  props.transactions.forEach((tx) => {
    if (tx.type === "expense" && tx.date.startsWith(currentMonth)) {
      spentMap[tx.category] = (spentMap[tx.category] || 0) + tx.amount;
    }
  });

  return budgetStore.budgets.map((b) => {
    const spent = spentMap[b.category] || 0;
    const percentage = b.limit_amount > 0 ? Math.round((spent / b.limit_amount) * 100) : 0;
    return {
      category: b.category,
      limit: b.limit_amount,
      spent,
      percentage
    };
  });
});

async function handleSetBudget() {
  if (!props.userId) return;
  if (!limitValue.value || limitValue.value <= 0) {
    toast.show("Nominal anggaran tidak boleh kosong atau nol.", "error");
    return;
  }
  
  isSaving.value = true;
  try {
    await budgetStore.setBudget(props.userId, form.value.category, limitValue.value, currentMonthStr.value);
    toast.show(`Anggaran ${form.value.category} berhasil diset.`, "success");
    limitValue.value = 0;
    emit("updated");
  } catch (error) {
    toast.show("Gagal menetapkan anggaran.", "error");
  } finally {
    isSaving.value = false;
  }
}

function formatRp(val) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}
</script>
