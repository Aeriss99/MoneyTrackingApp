import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", name: "Login", component: () => import("../views/LoginView.vue") },
  { path: "/dashboard", name: "Dashboard", component: () => import("../views/DashboardView.vue") },
];

const router = createRouter({
  // Tetap pakai hash history, tapi passing BASE_URL agar aman di sub-folder
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
