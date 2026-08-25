<template>
  <div class="relative" ref="container">
    <div 
      @click="isOpen = !isOpen"
      class="neo-input cursor-pointer flex items-center justify-between select-none"
      :class="{ 'border-neo-primary dark:border-neo-accent -translate-y-0.5 shadow-soft-neo dark:shadow-soft-neo-dark': isOpen }"
      tabindex="0"
    >
      <span :class="{'text-gray-400 font-medium': !modelValue}">
        {{ displayDate }}
      </span>
      <svg class="w-5 h-5 shrink-0 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>

    <Transition name="calendar">
      <div v-if="isOpen" class="absolute z-50 w-[280px] mt-2 neo-surface bg-white dark:bg-neo-darkSurface p-4 outline-none origin-top-left">
        
        <!-- Header: Month / Year -->
        <div class="flex items-center justify-between mb-4">
          <button @click.stop="prevMonth" type="button" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div class="font-bold text-sm select-none">
            {{ currentMonthName }} {{ currentYear }}
          </div>
          <button @click.stop="nextMonth" type="button" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <!-- Days of week -->
        <div class="grid grid-cols-7 mb-2">
          <div v-for="d in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']" :key="d" class="text-center text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none">
            {{ d }}
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-1">
          <button 
            v-for="(day, idx) in calendarDays" 
            :key="idx"
            type="button"
            @click.stop="selectDate(day)"
            :disabled="!day.isCurrentMonth"
            class="h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-150 relative select-none"
            :class="[
              !day.isCurrentMonth ? 'text-transparent cursor-default' : 'hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer',
              isSelected(day) ? '!bg-neo-primary text-white shadow-soft-neo-sm dark:!bg-neo-accent dark:text-neo-dark' : 'text-neo-dark dark:text-white',
              isToday(day) && !isSelected(day) ? 'border-2 border-neo-primary text-neo-primary dark:border-neo-accent dark:text-neo-accent' : ''
            ]"
          >
            {{ day.date.getDate() }}
          </button>
        </div>
        
        <div class="mt-4 pt-3 border-t-2 border-gray-100 dark:border-white/10 text-center">
          <button @click.stop="selectToday" type="button" class="text-xs font-bold text-neo-primary dark:text-neo-accent hover:underline">
            Pilih Hari Ini
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' }, // YYYY-MM-DD
});
const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const container = ref(null);
const currentDate = ref(new Date());

const displayDate = computed(() => {
  if (!props.modelValue) return 'Pilih tanggal...';
  const d = new Date(props.modelValue);
  if (isNaN(d.getTime())) return props.modelValue;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
});

const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(currentDate.value);
});
const currentYear = computed(() => currentDate.value.getFullYear());

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const startingDayOfWeek = firstDayOfMonth.getDay(); 
  
  const days = [];
  
  // Previous month padding
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ date: new Date(year, month, -startingDayOfWeek + i + 1), isCurrentMonth: false });
  }
  
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  
  // Next month padding (to complete 6 rows = 42 cells)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  
  return days;
});

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
}

function formatYYYYMMDD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function selectDate(dayObj) {
  if (!dayObj.isCurrentMonth) return;
  emit('update:modelValue', formatYYYYMMDD(dayObj.date));
  isOpen.value = false;
}

function selectToday() {
  const today = new Date();
  emit('update:modelValue', formatYYYYMMDD(today));
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1);
  isOpen.value = false;
}

function isSelected(dayObj) {
  if (!props.modelValue || !dayObj.isCurrentMonth) return false;
  return formatYYYYMMDD(dayObj.date) === props.modelValue;
}

function isToday(dayObj) {
  if (!dayObj.isCurrentMonth) return false;
  return formatYYYYMMDD(dayObj.date) === formatYYYYMMDD(new Date());
}

// Sync calendar view with selected date if any
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const d = new Date(newVal);
    if (!isNaN(d.getTime())) {
      currentDate.value = new Date(d.getFullYear(), d.getMonth(), 1);
    }
  }
}, { immediate: true });

function handleClickOutside(e) {
  if (container.value && !container.value.contains(e.target)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.calendar-enter-active,
.calendar-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
