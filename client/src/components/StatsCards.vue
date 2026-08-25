<template>
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Balance -->
    <div class="neo-surface neo-surface-hover bg-neo-primary border-neo-primary dark:border-neo-primary text-white p-6 relative overflow-hidden group">
      <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      <div class="flex items-center justify-between mb-4 relative z-10">
        <p class="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded border border-white/20">Total Saldo</p>
        <span class="text-2xl drop-shadow-sm">💰</span>
      </div>
      <p class="text-3xl font-black leading-none break-words relative z-10">{{ formatRp(stats?.balance || 0) }}</p>
      <p class="mt-2 text-xs font-bold opacity-80 flex items-center gap-1.5 relative z-10">
        <span class="w-1.5 h-1.5 rounded-full bg-white"></span> {{ stats?.transactionCount || 0 }} transaksi
      </p>
    </div>

    <!-- Monthly Income -->
    <div class="neo-surface neo-surface-hover bg-neo-success border-neo-success dark:border-neo-success text-neo-dark p-6 relative overflow-hidden group">
      <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      <div class="flex items-center justify-between mb-4 relative z-10">
        <p class="text-[10px] font-black uppercase tracking-widest bg-white/40 px-2 py-1 rounded border border-white/20">Pemasukan</p>
        <span class="text-2xl drop-shadow-sm">📈</span>
      </div>
      <p class="text-3xl font-black leading-none break-words relative z-10">{{ formatRp(stats?.monthlyIncome || 0) }}</p>
      <p class="mt-2 text-xs font-bold opacity-70 flex items-center gap-1.5 relative z-10">
        <span class="w-1.5 h-1.5 rounded-full bg-neo-dark"></span> Bulan ini
      </p>
    </div>

    <!-- Monthly Expense -->
    <div class="neo-surface neo-surface-hover bg-neo-danger border-neo-danger dark:border-neo-danger text-white p-6 relative overflow-hidden group">
      <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      <div class="flex items-center justify-between mb-4 relative z-10">
        <p class="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded border border-white/20">Pengeluaran</p>
        <span class="text-2xl drop-shadow-sm">📉</span>
      </div>
      <p class="text-3xl font-black leading-none break-words relative z-10">{{ formatRp(stats?.monthlyExpense || 0) }}</p>
      <p class="mt-2 text-xs font-bold opacity-80 flex items-center gap-1.5 relative z-10">
        <span class="w-1.5 h-1.5 rounded-full bg-white"></span> Bulan ini
      </p>
    </div>

    <!-- Today -->
    <div class="neo-surface neo-surface-hover bg-white dark:bg-neo-darkSurface p-6 relative overflow-hidden group">
      <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-neo-warning opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      <div class="flex items-center justify-between mb-4 relative z-10">
        <p class="text-[10px] font-black uppercase tracking-widest bg-neo-warning/20 text-neo-warning dark:text-neo-accent px-2 py-1 rounded border border-neo-warning/20">Hari Ini</p>
        <span class="text-2xl drop-shadow-sm">📅</span>
      </div>
      <p class="text-3xl font-black leading-none break-words relative z-10 text-neo-dark dark:text-white">{{ formatRp(stats?.todayExpense || 0) }}</p>
      <p class="mt-2 text-xs font-bold text-gray-500 flex items-center gap-1.5 relative z-10">
        <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Pengeluaran hari ini
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({ stats: Object });

function formatRp(val) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}
</script>
