import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(loadUserFromStorage());
  const isLoading = ref(false);

  function loadUserFromStorage() {
    const saved = localStorage.getItem("mt:user");
    return saved ? JSON.parse(saved) : null;
  }

  // Menggantikan Firebase dengan verifikasi Telegram
  async function loginWithTelegram(telegramUser) {
    isLoading.value = true;
    try {
      // Endpoint ini akan memverifikasi hash kriptografi Telegram agar hacker tidak bisa menembus
      const { data } = await axios.post("/api/auth/telegram", telegramUser);
      
      user.value = {
        id: data.user.id,
        telegramId: telegramUser.id,
        displayName: telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : ''),
        username: telegramUser.username || "",
        photoURL: telegramUser.photo_url || "",
        email: `tg_${telegramUser.id}@telegram.local` // dummy email untuk struktur database
      };
      
      localStorage.setItem("mt:user", JSON.stringify(user.value));
      return user.value;
    } catch (error) {
      console.error("Telegram Auth sync failed:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    user.value = null;
    localStorage.removeItem("mt:user");
  }

  return { user, isLoading, loginWithTelegram, logout };
});
