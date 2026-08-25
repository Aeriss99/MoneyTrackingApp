<template>
  <div class="neo-surface p-6">
    <div class="mb-4 flex items-center gap-3">
      <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-neo-accent/20 text-neo-dark text-lg border border-neo-accent/30 dark:bg-neo-accent/10 dark:text-neo-accent">
        💾
      </div>
      <div>
        <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Database</span>
        <h2 class="text-base font-black text-neo-dark dark:text-white leading-none">Backup & Restore</h2>
      </div>
    </div>
    
    <p class="mb-5 text-xs font-medium text-gray-500 dark:text-gray-400">
      Simpan riwayat transaksimu ke file lokal (JSON) atau kembalikan data dari backup sebelumnya.
    </p>

    <div class="grid grid-cols-2 gap-3">
      <button @click="downloadBackup" :disabled="isWorking" class="neo-btn bg-white dark:bg-neo-darkBg text-neo-dark dark:text-white" aria-label="Download backup">
        <svg class="w-4 h-4 text-neo-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Download
      </button>
      <button @click="triggerRestoreInput" :disabled="isWorking" class="neo-btn bg-neo-primary text-white" aria-label="Upload backup">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        Upload
      </button>
    </div>

    <input ref="restoreInput" type="file" accept=".json" class="hidden" @change="handleRestoreUpload" />

    <p v-if="isWorking" class="mt-4 text-center text-xs font-bold text-neo-primary dark:text-neo-accent animate-pulse">
      ⏳ Memproses data cadangan...
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useToastStore } from "../stores/toast.js";

const props = defineProps({ userId: [String, Number] });
const emit = defineEmits(["restored"]);

const toast = useToastStore();
const restoreInput = ref(null);
const isWorking = ref(false);

async function downloadBackup() {
  if (!props.userId) return;
  isWorking.value = true;
  try {
    const { data } = await axios.get(`/api/backup/${props.userId}`);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `money_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.show("Backup berhasil diunduh.", "success");
  } catch (error) {
    toast.show("Gagal mengunduh backup.", "error");
  } finally {
    isWorking.value = false;
  }
}

function triggerRestoreInput() {
  restoreInput.value?.click();
}

async function handleRestoreUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const backupData = JSON.parse(event.target.result);
      if (!backupData.transactions) {
        toast.show("Format file backup tidak valid.", "error");
        return;
      }

      if (!confirm("Mengunggah backup akan menghapus semua data transaksi saat ini. Lanjutkan?")) {
        return;
      }

      isWorking.value = true;
      const { data } = await axios.post(`/api/backup/restore/${props.userId}`, {
        transactions: backupData.transactions,
        budgets: backupData.budgets || []
      });

      toast.show(`Data dipulihkan. (${data.transactionsCount} transaksi)`, "success");
      emit("restored");
    } catch (err) {
      toast.show("Gagal membaca file JSON backup.", "error");
    } finally {
      isWorking.value = false;
    }
  };
  reader.readAsText(file);
}
</script>
