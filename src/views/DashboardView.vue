<template>
  <div class="min-h-screen pb-12 transition-colors duration-300" :class="{ 'dark bg-neo-darkBg text-white': isDark }">
    
    <!-- HEADER (Soft Neo-Brutalism) -->
    <header class="sticky top-0 z-40 bg-white/90 dark:bg-neo-darkSurface/90 backdrop-blur-md border-b-[2.5px] border-neo-border dark:border-neo-darkBorder shadow-sm">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-8">
        
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border-[2.5px] border-neo-border bg-neo-primary text-lg font-black text-white shadow-soft-neo-sm dark:border-neo-darkBorder dark:shadow-soft-neo-dark-sm transition-transform hover:scale-105 cursor-pointer">
            L
          </span>
          <div class="hidden sm:block">
            <p class="text-[10px] font-black uppercase tracking-widest text-neo-primary dark:text-neo-accent mb-0.5">Finance</p>
            <h1 class="text-lg font-black tracking-tight text-neo-dark dark:text-white leading-none">Lingz99 Dashboard</h1>
          </div>
          <!-- Singkatan buat mobile agar header tidak sesak -->
          <div class="sm:hidden flex flex-col">
            <h1 class="text-base font-black tracking-tight text-neo-dark dark:text-white leading-none">Lingz99</h1>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <span class="neo-chip bg-neo-accent text-neo-dark hidden md:inline-flex shadow-none">{{ todayLabel }}</span>

          <button @click="isImportOpen = true" class="neo-btn bg-neo-success text-neo-dark shadow-none hover:shadow-soft-neo-sm !px-3 sm:!px-4" aria-label="Impor mutasi PDF">
            <span class="hidden sm:inline">📄 Impor PDF</span>
            <span class="sm:hidden">📄</span>
          </button>

          <button @click="toggleDarkMode" class="neo-btn bg-gray-50 text-neo-dark dark:bg-white/10 dark:text-white shadow-none hover:shadow-soft-neo-sm !px-2.5 sm:!px-3" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
            <span class="text-base sm:text-lg">{{ isDark ? '☀️' : '🌙' }}</span>
          </button>

          <!-- User Profile -->
          <div class="flex items-center gap-2 rounded-xl border-[2.5px] border-neo-border bg-white px-1.5 sm:px-2 py-1.5 shadow-none dark:border-neo-darkBorder dark:bg-neo-darkSurface dark:text-white transition-colors hover:bg-gray-50 cursor-pointer">
            <img v-if="auth.user?.photoURL" :src="auth.user.photoURL" class="h-6 w-6 sm:h-7 sm:w-7 rounded-lg border-2 border-neo-border object-cover dark:border-neo-darkBorder" :alt="auth.user?.displayName" />
            <div v-else class="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg border-2 border-neo-border bg-neo-accent text-[10px] sm:text-xs font-black text-neo-dark dark:border-neo-darkBorder">
              {{ firstName.slice(0, 1) }}
            </div>
            <span class="hidden text-sm font-bold md:inline px-1">{{ firstName }}</span>
          </div>

          <button @click="handleLogout" class="neo-btn bg-white text-neo-danger border-neo-danger/30 hover:bg-neo-danger hover:text-white shadow-none hover:shadow-soft-neo-sm !px-2.5 sm:!px-3" aria-label="Logout">
            <span class="hidden sm:inline">Logout</span>
            <span class="sm:hidden text-lg">✕</span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="store.isLoading" class="mx-auto flex max-w-7xl items-center justify-center px-4 py-32 md:px-8">
      <div class="neo-surface p-12 text-center flex flex-col items-center justify-center animate-pulse">
        <div class="h-10 w-10 border-4 border-neo-border dark:border-white border-t-neo-primary dark:border-t-neo-accent rounded-full animate-spin"></div>
        <p class="mt-4 text-base font-bold text-gray-500 dark:text-gray-400">Menyiapkan data keuangan...</p>
      </div>
    </div>

    <main v-else class="mx-auto max-w-7xl px-4 py-8 md:px-8">
      
      <!-- HERO WELCOME SECTION -->
      <section class="mb-8 neo-surface p-6 sm:p-8 bg-gradient-to-br from-white to-gray-50 dark:from-neo-darkSurface dark:to-[#1a1a2e]">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div class="inline-flex bg-neo-primary/10 text-neo-primary dark:bg-neo-accent/10 dark:text-neo-accent px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-neo-primary/20 dark:border-neo-accent/20 mb-3">Ringkasan Bulan Ini</div>
            <h2 class="text-3xl font-black tracking-tight sm:text-4xl text-neo-dark dark:text-white">Halo, {{ firstName }}! 👋</h2>
            <p class="mt-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">Pantau terus pengeluaranmu. Sedikit demi sedikit, lama-lama menjadi bukit.</p>
          </div>
          
          <!-- Account Balances as Minimal Chips -->
          <div v-if="store.stats?.accountBalances?.length" class="flex flex-wrap gap-2 lg:justify-end">
            <span
              v-for="account in (store.stats?.accountBalances || []).slice(0, 4)"
              :key="account.account_name"
              class="neo-chip bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-none !py-1.5"
            >
              <span class="text-gray-500 dark:text-gray-400 font-medium">{{ account.account_name }}</span> 
              <span class="font-black text-neo-primary dark:text-neo-accent">{{ formatRp(account.balance || 0) }}</span>
            </span>
          </div>
        </div>
      </section>

      <!-- STATS CARDS -->
      <StatsCards :stats="store.stats" />

      <!-- CHARTS SECTION -->
      <section class="mt-8 grid gap-6 md:grid-cols-2">
        <ExpenseChart :data="store.stats?.categoryBreakdown || []" />
        <MonthlyTrendChart :data="store.stats?.monthlyTrend || []" />
      </section>

      <!-- MAIN CONTENT (FORM & LIST) -->
      <section class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <!-- Sidebar Controls -->
        <div class="space-y-6">
          <TransactionForm
            ref="formRef"
            :editData="editingTransaction"
            :saving="isSaving"
            @submit="handleFormSubmit"
            @cancel="cancelEdit"
          />

          <BudgetManager
            :userId="auth.user?.id"
            :transactions="store.transactions"
            @updated="refreshData"
          />

          <BackupRestoreManager
            :userId="auth.user?.id"
            @restored="refreshData"
          />
        </div>

        <!-- Transaction List -->
        <div>
          <TransactionList
            :transactions="store.transactions"
            @edit="startEdit"
            @delete="handleDelete"
          />
        </div>
      </section>
    </main>

    <ImportPdfModal
      :isOpen="isImportOpen"
      :userId="auth.user?.id"
      @close="isImportOpen = false"
      @imported="handleImportSuccess"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { useTransactionStore } from "../stores/transactions.js";
import { useBudgetStore } from "../stores/budget.js";
import { useToastStore } from "../stores/toast.js";
import StatsCards from "../components/StatsCards.vue";
import TransactionForm from "../components/TransactionForm.vue";
import TransactionList from "../components/TransactionList.vue";
import ExpenseChart from "../components/ExpenseChart.vue";
import MonthlyTrendChart from "../components/MonthlyTrendChart.vue";
import ImportPdfModal from "../components/ImportPdfModal.vue";
import BudgetManager from "../components/BudgetManager.vue";
import BackupRestoreManager from "../components/BackupRestoreManager.vue";

const router = useRouter();
const auth = useAuthStore();
const store = useTransactionStore();
const budgetStore = useBudgetStore();
const toast = useToastStore();

const formRef = ref(null);
const editingTransaction = ref(null);
const isSaving = ref(false);
const isDark = ref(localStorage.getItem("theme") === "dark");
const isImportOpen = ref(false);
const firstName = computed(() => {
  const name = auth.user?.displayName?.trim() || "";
  return name ? name.split(/\s+/)[0] : "Kamu";
});
const todayLabel = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "2-digit",
  month: "short",
}).format(new Date());

onMounted(() => {
  if (!auth.user) {
    router.push("/");
    return;
  }
  document.body.classList.toggle("dark", isDark.value);
  refreshData();
});

async function refreshData() {
  if (!auth.user) return;
  await store.fetchAll(auth.user.id);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  await budgetStore.fetchBudgets(auth.user.id, currentMonth);
}

function toggleDarkMode() {
  isDark.value = !isDark.value;
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
  document.body.classList.toggle("dark", isDark.value);
  toast.show(isDark.value ? "Mode Gelap Aktif" : "Mode Terang Aktif", "neutral");
}

async function handleFormSubmit(data) {
  if (!auth.user) return;
  isSaving.value = true;
  try {
    if (data.id) {
      await store.updateTransaction(data.id, { ...data, userId: auth.user.id });
      toast.show("Transaksi berhasil diupdate.", "success");
    } else {
      await store.addTransaction({ ...data, userId: auth.user.id });
      toast.show("Transaksi berhasil ditambahkan.", "success");
    }
    await refreshData();
    editingTransaction.value = null;
    formRef.value?.reset();
  } catch (error) {
    toast.show("Gagal menyimpan transaksi.", "error");
  } finally {
    isSaving.value = false;
  }
}

function startEdit(tx) {
  editingTransaction.value = { ...tx };
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  editingTransaction.value = null;
  formRef.value?.reset();
}

async function handleDelete(id) {
  if (!confirm("Hapus transaksi ini?")) return;
  try {
    await store.deleteTransaction(id, auth.user.id);
    await refreshData();
    if (editingTransaction.value?.id === id) cancelEdit();
    toast.show("Transaksi dihapus.", "neutral");
  } catch {
    toast.show("Gagal menghapus.", "error");
  }
}

async function handleImportSuccess() {
  await refreshData();
}

async function handleLogout() {
  auth.logout();
  router.push("/");
}

function formatRp(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}
</script>
