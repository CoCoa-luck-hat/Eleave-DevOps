<template>
  <div class="min-h-screen bg-slate-50 font-kanit">
    <!-- Reusable Sidebar -->
    <AppSidebar :is-open="sidebarOpen" :role="currentRole" @close="sidebarOpen = false" />

    <!-- Main Wrapper with LG left margin for sidebar -->
    <div class="lg:pl-64 flex flex-col min-h-screen">
      <!-- Reusable Navbar -->
      <AppNavbar
        :role="currentRole"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'

const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(false)

const currentRole = computed(() => {
  const r = (route.meta?.role || authStore.role || 'user').toLowerCase()
  return r === 'employee' ? 'user' : r
})
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
