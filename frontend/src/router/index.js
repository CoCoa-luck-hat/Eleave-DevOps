import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// User Views
import UserDashboardView from '@/views/user/UserDashboardView.vue'
import UserCreateLeaveView from '@/views/user/UserCreateLeaveView.vue'

// Manager Views (Phase 2)
import ManagerDashboardView from '@/views/manager/ManagerDashboardView.vue'

// Admin Views (Phase 3)
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminLeaveTypesView from '@/views/admin/AdminLeaveTypesView.vue'
import AdminUsersView from '@/views/admin/AdminUsersView.vue'

import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { isTokenExpired, getUserRole } from '@/utils/auth'

const routes = [
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: '',
        redirect: '/login',
      },
      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: { guestOnly: true },
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterView,
        meta: { guestOnly: true },
      },
    ],
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      // User / Employee Routes
      {
        path: 'user',
        name: 'user-dashboard',
        component: UserDashboardView,
        meta: { requiresAuth: true, role: 'employee', title: 'ประวัติการลา' },
      },
      {
        path: 'user/create-leave',
        name: 'user-create-leave',
        component: UserCreateLeaveView,
        meta: { requiresAuth: true, role: 'employee', title: 'สร้างใบลาใหม่' },
      },
      // Manager Routes
      {
        path: 'manager',
        name: 'manager-dashboard',
        component: ManagerDashboardView,
        meta: { requiresAuth: true, role: 'manager', title: 'พิจารณาอนุมัติใบลา' },
      },
      // Admin Routes
      {
        path: 'admin',
        name: 'admin-dashboard',
        component: AdminDashboardView,
        meta: { requiresAuth: true, role: 'admin', title: 'แดชบอร์ดภาพรวม' },
      },
      {
        path: 'admin/leave-types',
        name: 'admin-leave-types',
        component: AdminLeaveTypesView,
        meta: { requiresAuth: true, role: 'admin', title: 'จัดการประเภทการลา' },
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: AdminUsersView,
        meta: { requiresAuth: true, role: 'admin', title: 'จัดการผู้ใช้' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const getHomePathForRole = (role) => {
  const r = (role || '').toLowerCase()
  if (r === 'admin') return '/admin'
  if (r === 'manager') return '/manager'
  return '/user'
}

const isRoleAllowed = (userRole, requiredRole) => {
  const uRole = (userRole || '').toLowerCase()
  const rRole = (requiredRole || '').toLowerCase()

  // treat employee and user as equivalent
  if (uRole === 'employee' || uRole === 'user') {
    return rRole === 'employee' || rRole === 'user'
  }
  return uRole === rRole
}

router.beforeEach(async (to, from) => {
  const token = localStorage.getItem('token')
  const authStore = useAuthStore()
  const toastStore = useToastStore()

  if (to.meta.requiresAuth) {
    if (!token) {
      return { name: 'login' }
    }

    if (isTokenExpired(token)) {
      authStore.logout()
      toastStore.add('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', 'warning')
      return { name: 'login' }
    }

    // Load profile if not present
    if (!authStore.user) {
      try {
        await authStore.fetchProfile()
      } catch (err) {
        authStore.logout()
        return { name: 'login' }
      }
    }

    // Role-based Access Control
    const userRole = (authStore.role || getUserRole(token) || '').toLowerCase()
    if (to.meta.role) {
      if (!isRoleAllowed(userRole, to.meta.role)) {
        toastStore.add('คุณไม่มีสิทธิ์เข้าถึงหน้านี้', 'warning')
        const targetHome = getHomePathForRole(userRole)
        if (to.path !== targetHome) {
          return targetHome
        }
        return false
      }
    }

    return true
  }

  // If user is already logged in and navigates to guestOnly pages (/login, /register)
  if (to.meta.guestOnly && token && !isTokenExpired(token)) {
    const userRole = (authStore.role || getUserRole(token) || '').toLowerCase()
    const targetHome = getHomePathForRole(userRole)
    if (to.path !== targetHome) {
      return targetHome
    }
    return false
  }

  return true
})

export default router
