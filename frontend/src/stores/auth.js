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
    async editProfile(data) {
      const response = await api.put('/profile', data)
      if (this.user && data.fullname) {
        this.user.fullname = data.fullname
      }
      if (this.user && data.email) {
        this.user.email = data.email
      }
      return response
    },
    async uploadProfileImage(userId, formData) {
      const response = await api.post(`/users/${userId}/upload-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (this.user && response.data.filename) {
        this.user.profile = response.data.filename
      }
      return response
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      router.push('/login')
    },
  },
})
