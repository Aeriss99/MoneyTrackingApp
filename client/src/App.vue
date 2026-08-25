<template>
  <div class="min-h-screen">
    <Transition name="page" mode="out-in">
      <router-view />
    </Transition>
    <ToastNotification />
  </div>
</template>

<script setup>
import ToastNotification from "./components/ToastNotification.vue";
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
