<template>
  <Transition name="toast">
    <div v-if="toast.visible" :class="['neo-toast', bgClass]">
      <span class="mr-2">{{ icon }}</span>
      {{ toast.message }}
    </div>
  </Transition>
</template>

<script setup>
import { computed } from "vue";
import { useToastStore } from "../stores/toast.js";

const toast = useToastStore();

const bgClass = computed(() => ({
  "bg-neo-green text-neo-dark": toast.type === "success",
  "bg-neo-red text-white": toast.type === "error",
  "bg-neo-yellow text-neo-dark": toast.type === "warning",
  "bg-white text-neo-dark": toast.type === "neutral",
}));

const icon = computed(() => {
  const map = { success: "✅", error: "❌", warning: "⚠️", neutral: "ℹ️" };
  return map[toast.type] || "ℹ️";
});
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(16px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }
</style>
