<template>
  <div>
    <!-- Mobile Drawer Backdrop -->
    <div
      v-if="isOpen"
      @click="$emit('close')"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
    ></div>

    <!-- Sidebar Container -->
    <aside
      class="fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200/80 transition-transform duration-300 ease-in-out flex flex-col font-kanit"
      :class="[isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']"
    >
      <!-- Brand Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
            :class="accentBg"
          >
            <i class="mdi mdi-exit-run text-2xl"></i>
          </div>
          <div>
            <span class="font-extrabold text-lg text-slate-800 tracking-tight">E-Leave</span>
            <span class="text-xs text-slate-400 block -mt-1">Leave Management</span>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="btn btn-ghost btn-sm btn-circle lg:hidden text-slate-400 hover:text-slate-600"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          @click="$emit('close')"
          class="flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all group"
          :class="isRouteActive(item) ? activeLinkClass : inactiveLinkClass"
        >
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            :class="isRouteActive(item) ? activeIconBoxClass : inactiveIconBoxClass"
          >
            <i :class="item.icon" class="text-lg"></i>
          </div>
          <span class="flex-1">{{ item.title }}</span>
          <i v-if="isRouteActive(item)" class="mdi mdi-chevron-right text-base opacity-75"></i>
        </router-link>
      </nav>

    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getImageUrl } from '@/utils/imageUrl'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: 'user',
  },
})

defineEmits(['close'])

const route = useRoute()
const authStore = useAuthStore()

const profileUrl = computed(() => {
  if (authStore.user?.profile) {
    return getImageUrl(authStore.user.profile)
  }
  return null
})

// Static menu configuration per role
const allMenus = {
  admin: [
    { path: '/admin', title: 'แดชบอร์ดภาพรวม', icon: 'mdi mdi-view-dashboard' },
    {
      path: '/admin/leave-types',
      title: 'จัดการประเภทการลา',
      icon: 'mdi mdi-format-list-bulleted-type',
    },
  ],
  manager: [{ path: '/manager', title: 'พิจารณาอนุมัติใบลา', icon: 'mdi mdi-clipboard-check' }],
  user: [
    { path: '/user', title: 'ประวัติการลา', icon: 'mdi mdi-file-document-multiple' },
    { path: '/user/create-leave', title: 'สร้างใบลาใหม่', icon: 'mdi mdi-plus-circle' },
  ],
}
allMenus.employee = allMenus.user

const currentRole = computed(() => {
  const r = (props.role || authStore.role || 'user').toLowerCase()
  return r === 'employee' ? 'user' : r
})

const menuItems = computed(() => {
  return allMenus[currentRole.value] || allMenus.user
})

const isRouteActive = (item) => {
  return route.path === item.path
}

const accentBg = computed(() => {
  switch (currentRole.value) {
    case 'admin':
      return 'bg-blue-600 text-white'
    case 'manager':
      return 'bg-purple-600 text-white'
    default:
      return 'bg-brand-teal text-brand-navy'
  }
})

const activeLinkClass = computed(() => {
  switch (currentRole.value) {
    case 'admin':
      return 'bg-blue-50 text-blue-700 shadow-sm font-semibold'
    case 'manager':
      return 'bg-purple-50 text-purple-700 shadow-sm font-semibold'
    default:
      return 'bg-teal-50 text-teal-800 shadow-sm font-semibold'
  }
})

const inactiveLinkClass = 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'

const activeIconBoxClass = computed(() => {
  switch (currentRole.value) {
    case 'admin':
      return 'bg-blue-600 text-white shadow-sm'
    case 'manager':
      return 'bg-purple-600 text-white shadow-sm'
    default:
      return 'bg-brand-teal text-brand-navy shadow-sm'
  }
})

const inactiveIconBoxClass =
  'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700'
</script>
