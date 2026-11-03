import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useLeaveStore = defineStore('leave', {
  state: () => ({
    leaves: [],
    currentLeave: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchLeaves() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/reports')
        this.leaves = response.data.reports || []
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดใบลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserLeaves(userId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/reports/user/${userId}`)
        this.leaves = response.data.reports || []
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดใบลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLeaveById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/reports/${id}`)
        this.currentLeave = response.data.report
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลใบลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createLeave(formData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/reports', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างใบลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateLeave(id, formData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/reports/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขใบลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteLeave(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.delete(`/reports/${id}`)
        this.leaves = this.leaves.filter((leave) => leave.report_id !== id)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบใบลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async approveLeave(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/reports/${id}/status`, { status: 'approved' })
        await this.fetchLeaves()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติใบลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async rejectLeave(id, reason) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/reports/${id}/status`, {
          status: 'rejected',
          reject_reason: reason,
        })
        await this.fetchLeaves()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธใบลา'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
