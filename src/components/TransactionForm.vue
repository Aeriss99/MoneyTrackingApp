<template>
  <div class="neo-surface p-6">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-neo-border dark:border-neo-darkBorder text-lg shadow-soft-neo-sm dark:shadow-soft-neo-dark-sm" :class="editing ? 'bg-neo-warning text-white' : 'bg-neo-primary text-white'">
          {{ editing ? '✏️' : '➕' }}
        </div>
        <div>
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Formulir</span>
          <h2 class="text-xl font-black text-neo-dark dark:text-white leading-none">{{ editing ? 'Edit Transaksi' : 'Transaksi Baru' }}</h2>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-300">Deskripsi</label>
        <input v-model="form.description" type="text" maxlength="100"
          placeholder="Cth: Gaji, makan siang, listrik..."
          class="neo-input" />
      </div>

      <div>
        <label class="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-300">Jumlah (Rp)</label>
        <input :value="displayAmount" @input="handleAmountInput" type="text" inputmode="numeric"
          placeholder="Rp 0" class="neo-input !text-lg !font-black !bg-neo-accent/10 dark:!bg-neo-accent/5 !text-neo-primary dark:!text-neo-accent focus:!bg-white dark:focus:!bg-neo-darkSurface" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="relative z-30">
          <label class="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-300">Tipe</label>
          <NeoSelect v-model="form.type" :options="[{label: '📉 Expense', value: 'expense'}, {label: '📈 Income', value: 'income'}]" @change="onTypeChange" />
        </div>
        <div class="relative z-20">
          <label class="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-300">Kategori</label>
          <NeoSelect v-model="form.category" :options="categoryOptions" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="relative z-10">
          <label class="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-300">Akun</label>
          <NeoSelect v-model="form.accountName" :options="accountOptions" />
        </div>
        <div class="relative z-0">
          <label class="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-300">Tanggal</label>
          <NeoDatePicker v-model="form.date" />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-300">Catatan <span class="font-normal opacity-70">(opsional)</span></label>
        <textarea v-model="form.note" rows="2" maxlength="180"
          placeholder="Tambahkan catatan jika perlu..." class="neo-input resize-none"></textarea>
      </div>

      <div class="flex gap-3 pt-2">
        <button v-if="editing" type="button" @click="$emit('cancel')" class="neo-btn neo-btn-ghost flex-1">
          Batal
        </button>
        <button type="submit" :disabled="saving"
          class="neo-btn flex-1"
          :class="editing ? 'neo-btn-warning bg-neo-warning text-white' : 'neo-btn-primary'">
          {{ saving ? 'Menyimpan...' : (editing ? 'Update Transaksi' : 'Simpan Transaksi') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import NeoSelect from "./NeoSelect.vue";
import NeoDatePicker from "./NeoDatePicker.vue";
import { useToastStore } from "../stores/toast.js";

const toast = useToastStore();

const CATEGORIES = {
  income: ["Gaji", "Bonus", "Freelance", "Investasi", "Hadiah", "Lainnya"],
  expense: ["Makan", "Transport", "Tagihan", "Belanja", "Kesehatan", "Pendidikan", "Hiburan", "Lainnya"],
};

const ACCOUNT_OPTIONS = ["Cash", "Bank", "E-Wallet", "Savings", "Credit Card"];

const props = defineProps({ editData: Object, saving: Boolean });
const emit = defineEmits(["submit", "cancel"]);

const editing = computed(() => !!props.editData?.id);

const form = ref(getDefaultForm());

const categoryOptions = computed(() => CATEGORIES[form.value.type] || CATEGORIES.expense);

const displayAmount = computed(() => {
  if (!form.value.amount) return "";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(form.value.amount);
});

const accountOptions = computed(() => ACCOUNT_OPTIONS);

function getDefaultForm() {
  const now = new Date();
  return {
    description: "",
    amount: 0,
    type: "expense",
    category: "Makan",
    accountName: "Cash",
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    note: "",
  };
}

function handleAmountInput(e) {
  const digits = e.target.value.replace(/\D/g, "");
  form.value.amount = digits ? Number(digits) : 0;
}

function onTypeChange() {
  form.value.category = categoryOptions.value[0];
}

function handleSubmit() {
  if (!form.value.description) {
    toast.show("Deskripsi transaksi tidak boleh kosong.", "error");
    return;
  }
  if (!form.value.amount || form.value.amount <= 0) {
    toast.show("Nominal transaksi tidak boleh kosong atau nol.", "error");
    return;
  }
  if (!form.value.date) {
    toast.show("Tanggal transaksi harus dipilih.", "error");
    return;
  }
  
  emit("submit", { ...form.value, id: props.editData?.id });
}

watch(() => props.editData, (data) => {
  if (data?.id) {
    form.value = {
      ...getDefaultForm(),
      ...data,
      accountName: data.account_name || data.accountName || "Cash",
    };
  } else {
    form.value = getDefaultForm();
  }
}, { immediate: true, deep: true });

defineExpose({
  reset() { form.value = getDefaultForm(); }
});
</script>
