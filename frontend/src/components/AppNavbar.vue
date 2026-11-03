<template>
  <header
    class="navbar bg-white/90 backdrop-blur border-b border-slate-200/80 px-4 sticky top-0 z-30 transition-all font-kanit"
  >
    <!-- Mobile Hamburger Button -->
    <div class="flex-none lg:hidden">
      <button
        @click="$emit('toggle-sidebar')"
        class="btn btn-square btn-ghost text-slate-700 hover:bg-slate-100"
        aria-label="Toggle Sidebar"
      >
        <i class="mdi mdi-menu text-2xl"></i>
      </button>
    </div>



    <!-- User Profile Dropdown -->
    <div class="flex-1 gap-2" style="
    display: flex;
    flex-direction: row-reverse;
">
      <div class="dropdown dropdown-end">
        <label
          tabindex="0"
          class="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-teal-400 transition-all"
        >
          <div
            class="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200"
          >
            <img
              v-if="profileUrl"
              :src="profileUrl"
              alt="User Avatar"
              class="w-full h-full object-cover"
            />
            <i v-else class="mdi mdi-account text-2xl text-slate-400"></i>
          </div>
        </label>
        <ul
          tabindex="0"
          class="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-white rounded-2xl w-60 border border-slate-100"
        >
          <li class="menu-title px-4 py-2 border-b border-slate-100 mb-1">
            <span class="font-bold text-slate-800 text-sm block truncate">{{
              authStore.user?.fullname || 'ผู้ใช้งาน'
            }}</span>
            <span class="text-xs text-slate-400 font-normal truncate block">{{
              authStore.user?.email || ''
            }}</span>
          </li>
          <li>
            <button
              @click="handleLogout"
              class="flex items-center gap-2 py-2.5 text-error hover:bg-red-50 rounded-xl"
            >
              <i class="mdi mdi-logout text-lg"></i>
              <span>ออกจากระบบ</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { getImageUrl } from '@/utils/imageUrl'

const props = defineProps({
  role: {
    type: String,
    default: 'user',
  },
})

defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const toastStore = useToastStore()

const profileUrl = computed(() => {
  if (authStore.user?.profile) {
    return getImageUrl(authStore.user.profile)
  }
  return null
})

const currentRole = computed(() => {
  const r = (props.role || authStore.role || 'user').toLowerCase()
  return r === 'employee' ? 'user' : r
})

const roleTitle = computed(() => {
  switch (currentRole.value) {
    case 'admin':
      return 'ผู้ดูแลระบบ'
    case 'manager':
      return 'ผู้จัดการ'
    default:
      return 'พนักงาน'
  }
})

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

const handleLogout = () => {
  authStore.logout()
  toastStore.add('ออกจากระบบสำเร็จ', 'info')
}
</script>
