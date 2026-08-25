<template>
  <Transition name="fade-scale">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop blur -->
      <div @click="close" class="absolute inset-0 bg-[#1E1E2A]/40 dark:bg-[#070707]/60 backdrop-blur-sm transition-opacity"></div>

      <!-- Modal Card (Neo-Surface) -->
      <div class="neo-surface relative w-full max-w-2xl bg-white dark:bg-neo-darkSurface p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10 flex flex-col gap-6">
        
        <!-- Close button -->
        <button @click="close" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-neo-danger hover:text-white dark:bg-white/10 dark:hover:bg-neo-danger text-gray-500 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <!-- Header -->
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neo-success/10 text-neo-success font-black text-[10px] uppercase tracking-widest mb-3 border border-neo-success/20">
            <span>⚡ AI PDF Parser</span>
          </div>
          <h3 class="text-2xl sm:text-3xl font-black text-neo-dark dark:text-white tracking-tight leading-none mb-2">Impor Mutasi Rekening</h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Upload file PDF mutasi dari bank untuk mengekstrak transaksi secara otomatis.
          </p>
        </div>

        <!-- Bank Selector -->
        <div class="relative z-20">
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">Pilih Bank / E-Wallet Asal</label>
          <NeoSelect v-model="selectedBank" :options="bankOptions" />
        </div>

        <!-- Dropzone / Drag Area -->
        <div 
          v-if="!parsedTransactions.length"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleDrop"
          :class="[
            'border-[3px] border-dashed rounded-[20px] p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4',
            dragOver ? 'border-neo-primary bg-neo-primary/5 dark:bg-neo-primary/10' : 'border-neo-border/30 bg-gray-50 hover:border-neo-primary hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-neo-accent'
          ]"
          @click="triggerFileInput"
        >
          <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="handleFileSelect" />
          
          <div v-if="!isParsing" class="w-16 h-16 rounded-full bg-white dark:bg-neo-darkBg flex items-center justify-center shadow-soft-neo-sm dark:shadow-soft-neo-dark-sm border-2 border-neo-border dark:border-neo-darkBorder">
            <svg class="w-8 h-8 text-neo-primary dark:text-neo-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <div v-else class="w-16 h-16 rounded-full border-4 border-neo-border dark:border-white border-t-neo-primary dark:border-t-neo-accent animate-spin"></div>
          
          <div>
            <p class="text-base font-black text-neo-dark dark:text-white">
              {{ isParsing ? 'Mengekstrak data...' : 'Klik atau Drag & Drop PDF di sini' }}
            </p>
            <p class="text-xs font-medium text-gray-500 mt-1">Maksimum ukuran file: 5MB</p>
          </div>
        </div>

        <!-- Preview Results Table -->
        <div v-if="parsedTransactions.length && !isParsing" class="flex flex-col gap-4 animate-[slideUp_0.4s_ease-out]">
          <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-neo-success/10 border border-neo-success/20">
            <div>
              <h4 class="text-base font-black text-neo-success leading-none">Berhasil Diekstrak</h4>
              <p class="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{{ parsedTransactions.length }} transaksi ditemukan</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="resetImport" class="neo-btn neo-btn-ghost !py-1.5 !px-3">Reset</button>
              <button @click="saveBulk" :disabled="isSaving" class="neo-btn bg-neo-success text-neo-dark !py-1.5 !px-4">
                {{ isSaving ? 'Menyimpan...' : 'Simpan Semua' }}
              </button>
            </div>
          </div>

          <div class="overflow-x-auto rounded-xl border-[2.5px] border-neo-border dark:border-neo-darkBorder max-h-[40vh] custom-scrollbar">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead class="sticky top-0 bg-gray-100 dark:bg-[#232332] z-10 border-b-[2.5px] border-neo-border dark:border-neo-darkBorder">
                <tr class="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th class="p-3">Tanggal</th>
                  <th class="p-3">Deskripsi</th>
                  <th class="p-3 min-w-[140px]">Kategori</th>
                  <th class="p-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody class="divide-y-2 divide-gray-100 dark:divide-white/5 text-sm font-semibold">
                <tr v-for="(tx, index) in parsedTransactions" :key="index" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td class="p-3 text-neo-dark dark:text-white">{{ tx.date }}</td>
                  <td class="p-3 truncate max-w-[200px] text-neo-dark dark:text-white" :title="tx.description">{{ tx.description }}</td>
                  <td class="p-3">
                    <select v-model="tx.category" class="w-full bg-white dark:bg-[#1E1E2A] border-2 border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:border-neo-primary cursor-pointer">
                      <option v-for="cat in (tx.type === 'income' ? incomeCategories : expenseCategories)" :key="cat" :value="cat">
                        {{ cat }}
                      </option>
                    </select>
                  </td>
                  <td class="p-3 text-right font-black" :class="tx.type === 'income' ? 'text-neo-success' : 'text-neo-dark dark:text-white'">
                    {{ tx.type === 'income' ? '+' : '-' }}{{ formatRp(tx.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useToastStore } from "../stores/toast.js";
import NeoSelect from "./NeoSelect.vue";

const incomeCategories = ["Gaji", "Bonus", "Freelance", "Investasi", "Hadiah", "Lainnya"];
const expenseCategories = ["Makan", "Transport", "Tagihan", "Belanja", "Kesehatan", "Pendidikan", "Hiburan", "Lainnya"];
const bankOptions = [
  { label: 'Deteksi Otomatis (Semua)', value: 'auto' },
  { label: 'BCA (Bank Central Asia)', value: 'bca' },
  { label: 'Mandiri', value: 'mandiri' },
  { label: 'GoPay (GoTo Financial)', value: 'gopay' }
];

const props = defineProps({ isOpen: Boolean, userId: [String, Number] });
const emit = defineEmits(["close", "imported"]);

const toast = useToastStore();
const fileInput = ref(null);
const dragOver = ref(false);
const isParsing = ref(false);
const isSaving = ref(false);
const parsedTransactions = ref([]);
const selectedBank = ref("auto");

function close() {
  if (!isParsing.value && !isSaving.value) {
    resetImport();
    emit("close");
  }
}

function resetImport() {
  parsedTransactions.value = [];
  isParsing.value = false;
  isSaving.value = false;
  selectedBank.value = "auto";
}

function triggerFileInput() {
  if (!isParsing.value) fileInput.value?.click();
}

function handleFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) uploadFile(file);
}

function handleDrop(e) {
  dragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type === "application/pdf") {
    uploadFile(file);
  } else {
    toast.show("Hanya file berformat PDF yang diperbolehkan.", "error");
  }
}

async function uploadFile(file) {
  isParsing.value = true;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bank", selectedBank.value);

  try {
    const { data } = await axios.post("/api/import/pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (data.transactions && data.transactions.length) {
      parsedTransactions.value = data.transactions;
      toast.show(`Berhasil mendeteksi ${data.transactions.length} mutasi!`, "success");
    } else {
      toast.show("Mutasi tidak terdeteksi. Silakan periksa format PDF Anda.", "warning");
    }
  } catch (error) {
    toast.show("Gagal memproses file PDF.", "error");
  } finally {
    isParsing.value = false;
  }
}

async function saveBulk() {
  if (!props.userId || !parsedTransactions.value.length) return;
  isSaving.value = true;
  try {
    const { data } = await axios.post("/api/import/bulk", {
      userId: props.userId,
      transactions: parsedTransactions.value
    });
    toast.show(`Berhasil menyimpan ${data.count} transaksi mutasi!`, "success");
    emit("imported");
    close();
  } catch (error) {
    toast.show("Gagal menyimpan transaksi.", "error");
  } finally {
    isSaving.value = false;
  }
}

function formatRp(val) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}

.fade-scale-enter-from .neo-surface,
.fade-scale-leave-to .neo-surface {
  transform: scale(0.95) translateY(10px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #E5E7EB;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #2A2A35;
}
</style>
