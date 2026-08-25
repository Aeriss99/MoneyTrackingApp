import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  base: "./", // Menggunakan pure relative path agar aman dihosting di nama folder apa pun
  build: {
    outDir: "dist",
  }
});
