import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/users')
        this.users = response.data.users || []
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/users/${id}`)
        this.currentUser = response.data.user
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUser(id, userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/users/${id}`, userData)
        await this.fetchUsers()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.delete(`/users/${id}`)
        this.users = this.users.filter((user) => user.user_id !== id)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้'
        throw error
      } finally {
        this.loading = false
      }
    },

    async changeUserRole(id, role) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/users/${id}/role`, { role })
        await this.fetchUsers()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนบทบาท'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/users', userData)
        await this.fetchUsers()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้'
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadUserProfile(id, formData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post(`/users/${id}/upload-profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        await this.fetchUsers()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
