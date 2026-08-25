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

  async function loginWithFirebase(firebaseUser) {
    isLoading.value = true;
    try {
      const { data } = await axios.post("/api/auth/sync", {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        photoUrl: firebaseUser.photoURL || "",
      });
      user.value = {
        ...data.user,
        photoURL: firebaseUser.photoURL,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
      };
      localStorage.setItem("mt:user", JSON.stringify(user.value));
      return data.user;
    } catch (error) {
      console.error("Auth sync failed:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    user.value = null;
    localStorage.removeItem("mt:user");
  }

  return { user, isLoading, loginWithFirebase, logout };
});
