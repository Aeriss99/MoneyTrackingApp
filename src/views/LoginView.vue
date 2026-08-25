<template>
  <div class="min-h-screen bg-[#FDFBF7] dark:bg-[#0D0D12] text-[#1E1E2A] dark:text-[#FDFBF7] transition-colors duration-500 font-sans flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
    
    <!-- Soft Abstract Background Geometry -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-neo-yellow/10 dark:bg-neo-yellow/5 blur-[80px]"></div>
      <div class="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-neo-blue/10 dark:bg-neo-blue/5 blur-[80px]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(#1E1E2A_1px,transparent_1px)] dark:bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.05]"></div>
    </div>

    <!-- Main Container Card -->
    <div class="relative z-10 w-full max-w-6xl">
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-white dark:bg-[#15151E] rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border-2 border-gray-100 dark:border-[#2A2A35] overflow-hidden">
        
        <!-- LEFT COLUMN: Typography & Value Proposition -->
        <div class="flex flex-col gap-6 lg:pr-8 relative z-20">
          <div class="inline-flex items-center gap-2 bg-neo-blue/10 dark:bg-neo-blue/20 text-neo-blue px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest self-start border border-neo-blue/20">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-neo-blue opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-neo-blue"></span>
            </span>
            Lingz99 Finance
          </div>
          
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
            Kelola uangmu <br/>
            <span class="relative inline-block mt-2">
              <span class="relative z-10 text-neo-primary">makin mudah.</span>
              <span class="absolute bottom-1 left-0 w-full h-4 bg-neo-yellow/40 dark:bg-neo-yellow/20 -rotate-1 z-0"></span>
            </span>
          </h1>
          
          <p class="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg">
            Dashboard finansial personal yang bersih dan cepat. Login instan tanpa password dengan akun Telegram Anda.
          </p>
          
          <!-- Soft Feature Tags -->
          <div class="flex flex-wrap gap-3 mt-2">
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-[#1E1E2A] text-sm font-semibold border border-gray-100 dark:border-[#2A2A35]">
              <span class="text-[#2AABEE] text-lg">✈️</span> Telegram Auth
            </div>
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-[#1E1E2A] text-sm font-semibold border border-gray-100 dark:border-[#2A2A35]">
              <span class="text-neo-pink text-lg">✦</span> Budget Tracker
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Telegram Login Panel -->
        <div class="relative w-full">
          <!-- Login Box -->
          <div class="relative z-10 bg-[#1E1E2A] text-white p-8 sm:p-10 rounded-[32px] shadow-2xl border-4 border-[#1E1E2A] transform transition-transform duration-300 hover:scale-[1.02]">
            
            <div class="mb-8">
              <h2 class="text-2xl sm:text-3xl font-black mb-2 text-white">Mulai sekarang.</h2>
              <p class="text-gray-400 text-sm font-medium leading-relaxed">
                Tautkan dengan akun Telegram Anda untuk masuk. Data Anda aman tersimpan dan terenkripsi.
              </p>
            </div>

            <!-- TELEGRAM WIDGET CONTAINER -->
            <div v-if="!isLoggingIn" class="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 min-h-[100px]">
              <div ref="telegramContainer" class="flex justify-center items-center w-full min-h-[40px]"></div>
              <p class="text-xs text-gray-500 mt-4 text-center">Data Anda aman tersimpan secara lokal.</p>
              
              <!-- Divider -->
              <div class="w-full flex items-center gap-3 my-6">
                <div class="h-px bg-white/10 flex-1"></div>
                <span class="text-xs font-bold text-white/30 uppercase tracking-widest">Atau</span>
                <div class="h-px bg-white/10 flex-1"></div>
              </div>

              <!-- Fallback / Demo Button -->
              <button @click="handleDemoLogin" class="neo-btn bg-white/5 hover:bg-white/10 text-white w-full border-white/20 hover:border-white/40 !shadow-none">
                👀 Masuk sebagai Guest (Demo)
              </button>
            </div>

            <div v-else class="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 min-h-[100px]">
              <div class="w-8 h-8 border-4 border-[#1E1E2A] border-t-[#2AABEE] rounded-full animate-spin relative z-10"></div>
              <p class="mt-4 text-sm font-bold text-white">Memverifikasi profil Telegram...</p>
            </div>

            <!-- Error Message -->
            <Transition name="fade-slide">
              <div v-if="errorMsg" class="mt-4 p-4 rounded-2xl bg-neo-red/10 border border-neo-red/20 text-neo-red text-sm font-bold flex items-start gap-3">
                <span class="shrink-0 text-lg leading-none">⚠️</span>
                <span>{{ errorMsg }}</span>
              </div>
            </Transition>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();
const isLoggingIn = ref(false);
const errorMsg = ref("");
const telegramContainer = ref(null);

// Wajib diganti dengan username bot yang dibuat oleh pengguna di BotFather!
const TELEGRAM_BOT_USERNAME = "lingz_finance_bot";

async function handleDemoLogin() {
  isLoggingIn.value = true;
  errorMsg.value = "";
  try {
    const demoUser = {
      id: "99999999",
      first_name: "Guest",
      last_name: "User",
      username: "guest_finance",
      photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=4D96FF"
    };
    await authStore.loginWithTelegram(demoUser);
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push("/dashboard");
  } catch (error) {
    errorMsg.value = "Gagal masuk mode Demo.";
    isLoggingIn.value = false;
  }
}

onMounted(() => {
  // Telegram callback (ketika user sukses klik Accept di Telegram)
  window.onTelegramAuth = async function(user) {
    isLoggingIn.value = true;
    errorMsg.value = "";
    try {
      await authStore.loginWithTelegram(user);
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/dashboard");
    } catch (error) {
      errorMsg.value = error.response?.data?.error || "Gagal masuk menggunakan Telegram.";
      isLoggingIn.value = false;
    }
  };

  if (telegramContainer.value) {
    // Pastikan container bersih sebelum me-render ulang
    telegramContainer.value.innerHTML = '';
    
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", TELEGRAM_BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "16");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    
    telegramContainer.value.appendChild(script);
  }
});
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
