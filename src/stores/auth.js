import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(loadUserFromStorage());
  const isLoading = ref(false);

  function loadUserFromStorage() {
    const saved = localStorage.getItem("mt:user");
    return saved ? JSON.parse(saved) : null;
  }

  async function loginWithTelegram(telegramUser) {
    isLoading.value = true;
    try {
      // Karena ini mode Frontend-only, kita memalsukan respons sukses API dan mempercayai Telegram
      user.value = {
        id: telegramUser.id,
        telegramId: telegramUser.id,
        displayName: telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : ''),
        username: telegramUser.username || "",
        photoURL: telegramUser.photo_url || "",
        email: `tg_${telegramUser.id}@telegram.local`
      };
      
      localStorage.setItem("mt:user", JSON.stringify(user.value));
      return user.value;
    } catch (error) {
      console.error("Telegram Auth failed:", error);
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
