import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  base: "/MoneyTrackingApp/", // SANGAT PENTING: Wajib untuk GitHub Pages agar path aset tidak salah
  build: {
    outDir: "dist",
  }
});
