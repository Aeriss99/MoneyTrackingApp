<template>
  <div class="neo-surface p-6">
    <div class="mb-4 flex items-center gap-3">
      <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-neo-primary/10 text-neo-primary text-lg border border-neo-primary/20">📈</div>
      <div>
        <h2 class="text-base font-black text-neo-dark dark:text-white leading-none">Tren Bulanan</h2>
        <span class="text-[10px] font-bold text-gray-400">Income vs Expense</span>
      </div>
    </div>
    
    <div v-if="hasData" class="relative h-60 mt-4">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div v-else class="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-6 py-12 text-center mt-4">
      <p class="text-sm font-bold text-gray-500">Belum ada data tren</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps({ data: { type: Array, default: () => [] } });
const chartCanvas = ref(null);
let chartInstance = null;

const hasData = computed(() => props.data.length > 0);

function getThemeTextColor() {
  return document.body.classList.contains("dark") ? "#E5E7EB" : "#1E1E2A";
}

function buildChart() {
  if (!chartCanvas.value || !hasData.value) return;
  if (chartInstance) chartInstance.destroy();

  const months = [...new Set(props.data.map((d) => d.month))].sort();
  const incomeData = months.map((m) => {
    const item = props.data.find((d) => d.month === m && d.type === "income");
    return item ? item.total : 0;
  });
  const expenseData = months.map((m) => {
    const item = props.data.find((d) => d.month === m && d.type === "expense");
    return item ? item.total : 0;
  });

  const labels = months.map((m) => {
    const [y, mo] = m.split("-");
    return new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" }).format(new Date(Number(y), Number(mo) - 1));
  });

  const textColor = getThemeTextColor();
  const isDark = document.body.classList.contains("dark");

  chartInstance = new Chart(chartCanvas.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "#6BCB77",
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        },
        {
          label: "Expense",
          data: expenseData,
          backgroundColor: "#FF6B9D",
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", drawBorder: false },
          ticks: { color: textColor, font: { family: "Space Grotesk", weight: "600", size: 10 } },
          border: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: "Space Grotesk", weight: "600", size: 11 } },
          border: { display: false }
        },
      },
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: {
            font: { family: "Space Grotesk", weight: "700", size: 11 },
            padding: 16,
            color: textColor,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: isDark ? '#FDFBF7' : '#1E1E2A',
          titleColor: isDark ? '#1E1E2A' : '#FDFBF7',
          bodyColor: isDark ? '#1E1E2A' : '#FDFBF7',
          titleFont: { family: "Space Grotesk", weight: "800", size: 13 },
          bodyFont: { family: "Space Grotesk", weight: "800", size: 13 },
          padding: 12,
          cornerRadius: 12,
          displayColors: true,
          boxPadding: 6
        }
      },
    },
  });
}

watch(() => props.data, buildChart, { deep: true });
onMounted(() => {
  buildChart();
  const observer = new MutationObserver(buildChart);
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  onUnmounted(() => observer.disconnect());
});
onUnmounted(() => { if (chartInstance) chartInstance.destroy(); });
</script>
