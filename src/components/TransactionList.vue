<template>
  <div class="neo-surface p-6">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h2 class="text-xl font-black text-neo-dark dark:text-white">Riwayat Transaksi</h2>
        <span class="neo-badge bg-neo-primary text-white border-none shadow-none text-xs px-2 py-1">{{ filteredList.length }}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="showFilters = !showFilters"
          class="neo-btn !py-2 !px-4 text-xs"
          :class="showFilters ? 'bg-neo-primary text-white' : 'neo-btn-ghost'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {{ showFilters ? 'Tutup Filter' : 'Filter' }}
        </button>
        <button v-if="hasActiveFilters" type="button" @click="resetFilters" class="neo-btn neo-btn-danger !py-2 !px-4 text-xs">
          Reset
        </button>
      </div>
    </div>

    <!-- Search Input always visible -->
    <div class="mb-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input
          v-model="search"
          type="text"
          placeholder="Cari deskripsi, kategori, atau catatan..."
          class="neo-input !pl-10"
        />
      </div>
    </div>

    <Transition name="slide">
      <div v-if="showFilters" class="mb-6 neo-surface !bg-gray-50 dark:!bg-white/5 !shadow-none p-5">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="relative z-40">
            <label class="mb-1 block text-xs font-bold text-gray-500">Tipe</label>
            <NeoSelect v-model="filterType" :options="[{label: 'Semua tipe', value: 'all'}, {label: 'Income', value: 'income'}, {label: 'Expense', value: 'expense'}]" />
          </div>
          <div class="relative z-30">
            <label class="mb-1 block text-xs font-bold text-gray-500">Akun</label>
            <NeoSelect v-model="filterAccount" :options="['all', ...accountOptions]" />
          </div>
          <div class="relative z-20">
            <label class="mb-1 block text-xs font-bold text-gray-500">Urutkan</label>
            <NeoSelect v-model="sortBy" :options="[{label: 'Terbaru', value: 'newest'}, {label: 'Terlama', value: 'oldest'}, {label: 'Tertinggi', value: 'highest'}, {label: 'Terendah', value: 'lowest'}]" />
          </div>
          <div class="hidden lg:block"></div>
          
          <div class="relative z-10">
            <label class="mb-1 block text-xs font-bold text-gray-500">Dari Tanggal</label>
            <NeoDatePicker v-model="startDate" />
          </div>
          <div class="relative z-0">
            <label class="mb-1 block text-xs font-bold text-gray-500">Sampai Tanggal</label>
            <NeoDatePicker v-model="endDate" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold text-gray-500">Min (Rp)</label>
            <input v-model="minAmountInput" type="text" inputmode="numeric" placeholder="0" class="neo-input" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold text-gray-500">Max (Rp)</label>
            <input v-model="maxAmountInput" type="text" inputmode="numeric" placeholder="Tak hingga" class="neo-input" />
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="!filteredList.length" class="neo-surface !bg-transparent !border-dashed border-gray-300 dark:border-gray-700 px-6 py-12 text-center !shadow-none">
      <div class="w-16 h-16 mx-auto bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-4">📭</div>
      <p class="text-base font-bold text-neo-dark dark:text-white">Belum ada transaksi</p>
      <p class="mt-1 text-sm font-medium text-gray-500">Data yang dicari tidak ditemukan atau belum ditambahkan.</p>
    </div>

    <TransitionGroup name="list" tag="ul" class="space-y-3">
      <li v-for="tx in filteredList" :key="tx.id"
        class="neo-surface neo-surface-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 cursor-default">
        
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="neo-badge text-[10px] px-2 py-0.5"
                  :class="tx.type === 'income' ? 'bg-neo-success/20 text-neo-success border-neo-success/30' : 'bg-neo-danger/10 text-neo-danger border-neo-danger/30'">
              {{ tx.category }}
            </span>
            <span class="neo-badge bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10 text-[10px] px-2 py-0.5">
              {{ tx.account_name || 'Cash' }}
            </span>
          </div>
          
          <p class="truncate text-base font-bold text-neo-dark dark:text-white">{{ tx.description }}</p>
          <p class="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {{ formatDate(tx.date) }}<span v-if="tx.note" class="px-1 text-gray-300 dark:text-gray-600">•</span><span v-if="tx.note" class="truncate">{{ tx.note }}</span>
          </p>
        </div>

        <div class="flex shrink-0 items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t border-gray-100 sm:border-none dark:border-white/10">
          <p :class="[
            'text-lg font-black tracking-tight',
            tx.type === 'income' ? 'text-neo-success' : 'text-neo-dark dark:text-white'
          ]">
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatRp(tx.amount) }}
          </p>

          <div class="flex gap-2">
            <button @click="$emit('edit', tx)"
              class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-white/10"
              aria-label="Edit transaksi">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button @click="$emit('delete', tx.id)"
              class="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors border border-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/20"
              aria-label="Hapus transaksi">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </li>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import NeoSelect from "./NeoSelect.vue";
import NeoDatePicker from "./NeoDatePicker.vue";

const props = defineProps({ transactions: { type: Array, default: () => [] } });
defineEmits(["edit", "delete"]);

const search = ref("");
const filterType = ref("all");
const filterAccount = ref("all");
const sortBy = ref("newest");
const startDate = ref("");
const endDate = ref("");
const minAmountInput = ref("");
const maxAmountInput = ref("");
const showFilters = ref(false);

const hasActiveFilters = computed(() =>
  filterType.value !== "all" ||
  filterAccount.value !== "all" ||
  sortBy.value !== "newest" ||
  startDate.value ||
  endDate.value ||
  minAmountInput.value ||
  maxAmountInput.value
);

const accountOptions = computed(() => {
  const values = new Set(props.transactions.map((tx) => tx.account_name || tx.accountName || "Cash"));
  return Array.from(values).sort((a, b) => a.localeCompare(b));
});

const filteredList = computed(() => {
  let result = [...props.transactions];

  if (filterType.value !== "all") {
    result = result.filter((t) => t.type === filterType.value);
  }

  if (filterAccount.value !== "all") {
    result = result.filter((t) => (t.account_name || t.accountName || "Cash") === filterAccount.value);
  }

  if (startDate.value) {
    result = result.filter((t) => t.date >= startDate.value);
  }

  if (endDate.value) {
    result = result.filter((t) => t.date <= endDate.value);
  }

  const minAmount = normalizeAmount(minAmountInput.value);
  if (minAmount !== null) {
    result = result.filter((t) => Number(t.amount) >= minAmount);
  }

  const maxAmount = normalizeAmount(maxAmountInput.value);
  if (maxAmount !== null) {
    result = result.filter((t) => Number(t.amount) <= maxAmount);
  }

  if (search.value) {
    const q = search.value.toLowerCase();
    result = result.filter((t) =>
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.account_name || "").toLowerCase().includes(q) ||
      (t.note || "").toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => {
    if (sortBy.value === "oldest") return dateToNumber(a) - dateToNumber(b);
    if (sortBy.value === "highest") return Number(b.amount) - Number(a.amount) || dateToNumber(b) - dateToNumber(a);
    if (sortBy.value === "lowest") return Number(a.amount) - Number(b.amount) || dateToNumber(b) - dateToNumber(a);
    return dateToNumber(b) - dateToNumber(a);
  });

  return result;
});

function normalizeAmount(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function dateToNumber(tx) {
  const timestamp = new Date(tx.date).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function resetFilters() {
  search.value = "";
  filterType.value = "all";
  filterAccount.value = "all";
  sortBy.value = "newest";
  startDate.value = "";
  endDate.value = "";
  minAmountInput.value = "";
  maxAmountInput.value = "";
}

function formatRp(val) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

function formatDate(val) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(val));
}
</script>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.list-enter-from { opacity: 0; transform: translateY(10px) scale(0.98); }
.list-leave-to { opacity: 0; transform: scale(0.98); }
.list-move { transition: transform 0.3s ease; }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; overflow: hidden; margin-bottom: 0; border-width: 0; }
.slide-enter-to, .slide-leave-from { max-height: 400px; opacity: 1; }
</style>
