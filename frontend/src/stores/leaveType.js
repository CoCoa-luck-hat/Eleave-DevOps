import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useLeaveTypeStore = defineStore('leaveType', {
  state: () => ({
    leaveTypes: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchLeaveTypes() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/leave-types')
        this.leaveTypes = response.data.leaveTypes || []
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดประเภทการลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createLeaveType(data) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/leave-types', data)
        await this.fetchLeaveTypes()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างประเภทการลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateLeaveType(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/leave-types/${id}`, data)
        await this.fetchLeaveTypes()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขประเภทการลา'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteLeaveType(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.delete(`/leave-types/${id}`)
        this.leaveTypes = this.leaveTypes.filter((type) => type.leave_type_id !== id)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบประเภทการลา'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
