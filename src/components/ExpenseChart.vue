<template>
  <div class="neo-surface p-6">
    <div class="mb-4 flex items-center gap-3">
      <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-neo-danger/10 text-neo-danger text-lg border border-neo-danger/20">📉</div>
      <div>
        <h2 class="text-base font-black text-neo-dark dark:text-white leading-none">Pengeluaran</h2>
        <span class="text-[10px] font-bold text-gray-400">Berdasarkan kategori</span>
      </div>
    </div>
    
    <div v-if="hasData" class="relative h-60 mt-4">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div v-else class="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-6 py-12 text-center mt-4">
      <p class="text-sm font-bold text-gray-500">Belum ada data pengeluaran</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const COLORS = ["#FF6B9D", "#4D96FF", "#FFD93D", "#6BCB77", "#9B59B6", "#FF8C42", "#00D2D3", "#FF6B6B"];

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

  const labels = props.data.map((d) => d.category);
  const values = props.data.map((d) => d.total);
  const textColor = getThemeTextColor();
  const isDark = document.body.classList.contains("dark");

  chartInstance = new Chart(chartCanvas.value, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: COLORS.slice(0, labels.length),
        borderColor: isDark ? "#232332" : "#ffffff",
        borderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "right",
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
