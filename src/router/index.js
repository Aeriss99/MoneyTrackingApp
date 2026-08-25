import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", name: "Login", component: () => import("../views/LoginView.vue") },
  { path: "/dashboard", name: "Dashboard", component: () => import("../views/DashboardView.vue") },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
