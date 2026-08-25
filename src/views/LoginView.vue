<template>
  <div class="min-h-screen bg-[#FDFBF7] dark:bg-[#0D0D12] text-[#1E1E2A] dark:text-[#FDFBF7] transition-colors duration-500 font-sans flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
    
    <!-- Soft Abstract Background Geometry -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-neo-yellow/10 dark:bg-neo-yellow/5 blur-[80px]"></div>
      <div class="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-neo-blue/10 dark:bg-neo-blue/5 blur-[80px]"></div>
      <!-- Subtle dot grid -->
      <div class="absolute inset-0 bg-[radial-gradient(#1E1E2A_1px,transparent_1px)] dark:bg-[radial-gradient(#FDFBF7_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.05]"></div>
    </div>

    <!-- Main Container Card (Modern Soft-Brutalism) -->
    <div class="relative z-10 w-full max-w-6xl">
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-white dark:bg-[#15151E] rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border-2 border-gray-100 dark:border-[#2A2A35] overflow-hidden">
        
        <!-- ============================================== -->
        <!-- LEFT COLUMN: Typography & Value Proposition      -->
        <!-- ============================================== -->
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
              <span class="relative z-10">tanpa pusing.</span>
              <span class="absolute bottom-1 left-0 w-full h-4 bg-neo-yellow/40 dark:bg-neo-yellow/20 -rotate-1 z-0"></span>
            </span>
          </h1>
          
          <p class="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg">
            Dashboard finansial personal yang bersih, cepat, dan 100% jalan di server lokal Anda.
          </p>
          
          <!-- Soft Feature Tags -->
          <div class="flex flex-wrap gap-3 mt-2">
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-[#1E1E2A] text-sm font-semibold border border-gray-100 dark:border-[#2A2A35]">
              <span class="text-neo-green text-lg">✦</span> Privacy-first
            </div>
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-[#1E1E2A] text-sm font-semibold border border-gray-100 dark:border-[#2A2A35]">
              <span class="text-neo-pink text-lg">✦</span> Budget Tracker
            </div>
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-[#1E1E2A] text-sm font-semibold border border-gray-100 dark:border-[#2A2A35]">
              <span class="text-neo-blue text-lg">✦</span> PDF Import
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- RIGHT COLUMN: Login Panel & Illustration Visual  -->
        <!-- ============================================== -->
        <div class="relative w-full">
          
          <!-- Decorative UI Elements floating around login box -->
          <div class="hidden sm:block absolute -top-8 -left-8 z-20 animate-[float_6s_ease-in-out_infinite]">
            <div class="bg-white dark:bg-[#1E1E2A] p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-[#2A2A35] flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-neo-green/10 flex items-center justify-center text-xl">💰</div>
              <div>
                <p class="text-xs text-gray-400 font-bold uppercase">Saldo Aktif</p>
                <p class="text-sm font-black text-neo-green">+ Rp 8.5M</p>
              </div>
            </div>
          </div>

          <div class="hidden sm:block absolute -bottom-6 -right-6 z-20 animate-[float_5s_ease-in-out_infinite_reverse]">
            <div class="bg-white dark:bg-[#1E1E2A] p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-[#2A2A35] flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-neo-pink/10 flex items-center justify-center text-xl">🛒</div>
              <div>
                <p class="text-xs text-gray-400 font-bold uppercase">Pengeluaran</p>
                <p class="text-sm font-black text-neo-pink">- Rp 3.2M</p>
              </div>
            </div>
          </div>

          <!-- Login Box -->
          <div class="relative z-10 bg-[#1E1E2A] text-white p-8 sm:p-10 rounded-[32px] shadow-2xl border-4 border-[#1E1E2A] transform transition-transform duration-300 hover:scale-[1.02]">
            
            <div class="mb-8">
              <h2 class="text-2xl sm:text-3xl font-black mb-2 text-white">Mulai sekarang.</h2>
              <p class="text-gray-400 text-sm font-medium leading-relaxed">
                Login aman menggunakan Google. Data transaksi Anda tidak akan pernah dikirim ke server luar.
              </p>
            </div>

            <!-- Custom Elegant Google Button -->
            <button 
              @click="handleGoogleLogin" 
              :disabled="isLoggingIn"
              class="w-full relative group overflow-hidden bg-white text-[#1E1E2A] rounded-2xl font-black text-base py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)]"
            >
              <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <svg v-if="!isLoggingIn" class="w-6 h-6 relative z-10" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.1-1.3 3.3-5.5 3.3-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.2.8 3.9 1.4l2.7-2.6C17.1 2.3 14.8 1 12 1 6.5 1 2 5.5 2 11s4.5 10 10 10c5.8 0 9.6-4 9.6-9.7 0-.7-.1-1.3-.2-1.9H12z" />
              </svg>
              <div v-else class="w-5 h-5 border-3 border-[#1E1E2A] border-t-transparent rounded-full animate-spin relative z-10"></div>
              
              <span class="relative z-10">{{ isLoggingIn ? 'Membuka dashboard...' : 'Lanjutkan dengan Google' }}</span>
            </button>

            <!-- Error Message -->
            <Transition name="fade-slide">
              <div v-if="errorMsg" class="mt-4 p-4 rounded-2xl bg-neo-red/10 border border-neo-red/20 text-neo-red text-sm font-bold flex items-start gap-3">
                <span class="shrink-0 text-lg leading-none">⚠️</span>
                <span>{{ errorMsg }}</span>
              </div>
            </Transition>

            <div class="mt-8 flex items-center justify-center gap-4 text-xs font-semibold text-gray-400">
              <div class="h-px flex-1 bg-gray-800"></div>
              <span class="uppercase tracking-widest">Secure Local Storage</span>
              <div class="h-px flex-1 bg-gray-800"></div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();
const isLoggingIn = ref(false);
const errorMsg = ref("");

async function handleGoogleLogin() {
  isLoggingIn.value = true;
  errorMsg.value = "";

  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const {
      getAuth,
      GoogleAuthProvider,
      signInWithPopup,
      browserLocalPersistence,
      setPersistence,
    } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");

    const firebaseConfig = {
      apiKey: "AIzaSyBlZPPpwN9C2gSKpdrhXJBtaYJ0D6VonNY",
      authDomain: "moneytrackingapp-6c94a.firebaseapp.com",
      projectId: "moneytrackingapp-6c94a",
      storageBucket: "moneytrackingapp-6c94a.firebasestorage.app",
      messagingSenderId: "826077908631",
      appId: "1:826077908631:web:54be252edbdc817016e3d2",
      measurementId: "G-EFD7ZTC929",
    };

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);

    await setPersistence(auth, browserLocalPersistence);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    provider.addScope("email");
    provider.addScope("profile");

    const result = await signInWithPopup(auth, provider);
    await authStore.loginWithFirebase(result.user);

    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push("/dashboard");
  } catch (error) {
    console.error("Login error:", error);

    const code = error?.code || "";
    // SMART BYPASS: Jika Firebase memblokir karena domain Vercel, kita akan membuat sesi Guest (Portofolio Mode)
    if (code.includes("unauthorized-domain") || error?.message?.includes("unauthorized")) {
      console.log("Firebase Domain Unauthorized. Bypassing into Demo Mode...");
      
      const demoUser = {
        uid: "demo-user-123",
        email: "demo@lingz99.finance",
        displayName: "Guest User",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=4D96FF"
      };
      
      await authStore.loginWithFirebase(demoUser);
      
      // Kasih tahu user ini mode demo
      errorMsg.value = "Login Google diblokir (Domain belum di-whitelist di Firebase). Masuk menggunakan Mode Demo/Guest...";
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/dashboard");
      return;
    }

    if (code.includes("popup-closed")) {
      errorMsg.value = "Popup ditutup sebelum login selesai.";
    } else if (code.includes("popup-blocked")) {
      errorMsg.value = "Popup diblokir browser. Izinkan popup untuk situs ini.";
    } else {
      errorMsg.value = error?.message || "Login gagal. Coba lagi.";
    }
  } finally {
    isLoggingIn.value = false;
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

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
