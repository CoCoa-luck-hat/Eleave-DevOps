import { defineStore } from 'pinia'
import { remove } from 'vue'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toast: [],
  }),
  actions: {
    add(message, type = 'info') {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
      this.toast.push({ id, message, type })
      setTimeout(() => {
        this.remove(id)
      }, 3000)
    },
    remove(id) {
      const index = this.toast.findIndex((t) => t.id === id)
      if (index !== -1) this.toast.splice(index, 1)
    },
  },
})
