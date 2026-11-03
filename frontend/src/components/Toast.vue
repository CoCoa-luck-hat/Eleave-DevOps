<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
const alertClass = (type) => {
  switch (type) {
    case 'success':
      return 'alert-success text-white'
    case 'error':
      return 'alert-error text-white'
    case 'warning':
      return 'alert-warning text-slate-900'
    default:
      return 'alert-info text-white'
  }
}
const alertIcon = (type) => {
  switch (type) {
    case 'success':
      return 'mdi mdi-check-circle'
    case 'error':
      return 'mdi mdi-alert-circle'
    case 'warning':
      return 'mdi mdi-alert'
    default:
      return 'mdi mdi-information'
  }
}
</script>
<template>
  <div class="toast toast-bottom toast-end z-[999999] p-4 space-y-2 pointer-events-none">
    <transition-group name="toast-anim">
      <div
        v-for="toast in toastStore.toast"
        :key="toast.id"
        class="alert shadow-lg flex items-center gap-2 pointer-events-auto transition-all duration-300 py-3 px-4 min-w-[280px] max-w-sm"
        :class="alertClass(toast.type)"
      >
        <i :class="alertIcon(toast.type)" class="text-xl"></i>
        <span class="test-sm font-medium flex-1">{{ toast.message }}</span>
        <button
          @click="toastStore.remove(toast.id)"
          class="btn btn-ghost btn-xs btn-circle opacity-75 hover:opacity-100"
        >
          X
        </button>
      </div>
    </transition-group>
  </div>
</template>
