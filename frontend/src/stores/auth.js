import api from '@/plugins/axios'
import router from '@/router'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role || '',
  },
  actions: {
    async login(credentials) {
      const response = await api.post('/login', credentials)
      this.token = response.data.token
      this.user = response.data.user
      localStorage.setItem('token', this.token)
      return response
    },
    async register(data) {
      return await api.post('/register', data)
    },
    async fetchProfile() {
      try {
        const response = await api.get('/profile')
        this.user = response.data.user
        return response
      } catch (error) {
        this.logout()
        throw error
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      router.push('/login')
    },
  },
})
