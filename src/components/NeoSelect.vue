<template>
  <div class="relative" ref="container">
    <div 
      @click="isOpen = !isOpen"
      class="neo-input cursor-pointer flex items-center justify-between select-none"
      :class="{ 'border-neo-primary dark:border-neo-accent -translate-y-0.5 shadow-soft-neo dark:shadow-soft-neo-dark': isOpen }"
      tabindex="0"
      @keydown.enter="isOpen = !isOpen"
      @keydown.esc="isOpen = false"
    >
      <span class="truncate pr-4" :class="{'text-gray-400 font-medium': !modelValue}">
        {{ displayLabel }}
      </span>
      <svg class="w-5 h-5 shrink-0 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <Transition name="dropdown">
      <div v-if="isOpen" class="absolute z-50 w-full mt-2 neo-surface bg-white dark:bg-neo-darkSurface p-1 max-h-60 overflow-y-auto outline-none">
        <div 
          v-for="option in options" 
          :key="option.value || option"
          @click="selectOption(option)"
          class="px-4 py-2.5 rounded-lg cursor-pointer font-semibold transition-colors duration-150 flex items-center justify-between group"
          :class="[
            (option.value || option) === modelValue 
              ? 'bg-neo-primary/10 text-neo-primary dark:bg-neo-accent/20 dark:text-neo-accent' 
              : 'hover:bg-gray-50 text-neo-dark dark:hover:bg-white/5 dark:text-white'
          ]"
        >
          <span>{{ option.label || option }}</span>
          <span v-if="(option.value || option) === modelValue" class="text-neo-primary dark:text-neo-accent text-lg leading-none">✓</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Pilih salah satu...' }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const container = ref(null);

const displayLabel = computed(() => {
  if (!props.modelValue) return props.placeholder;
  const selected = props.options.find(opt => (opt.value || opt) === props.modelValue);
  return selected ? (selected.label || selected) : props.modelValue;
});

function selectOption(option) {
  const value = option.value || option;
  emit('update:modelValue', value);
  emit('change', value);
  isOpen.value = false;
}

function handleClickOutside(e) {
  if (container.value && !container.value.contains(e.target)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.9) translateY(-10px);
}
</style>
