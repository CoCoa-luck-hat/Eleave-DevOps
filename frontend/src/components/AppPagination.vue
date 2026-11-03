<template>
  <div
    v-if="totalItems > 0"
    class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-2 font-kanit text-sm"
  >
    <!-- Left: Items Info & Items per page selector -->
    <div class="flex items-center gap-3 text-slate-500 text-xs sm:text-sm">
      <span>
        แสดง <strong class="text-slate-700">{{ fromItem }}</strong> -
        <strong class="text-slate-700">{{ toItem }}</strong> จากทั้งหมด
        <strong class="text-slate-700">{{ totalItems }}</strong> รายการ
      </span>

      <div class="hidden sm:flex items-center gap-1.5 ml-2">
        <span>แถวต่อหน้า:</span>
        <select
          :value="itemsPerPage"
          @change="$emit('update:itemsPerPage', Number($event.target.value))"
          class="select select-bordered select-xs rounded-lg text-slate-700 bg-white focus:outline-none"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <!-- Right: Pagination Buttons -->
    <div class="flex items-center gap-1">
      <!-- Previous Page Button -->
      <button
        type="button"
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="btn btn-sm btn-ghost rounded-xl px-2.5 text-slate-600 disabled:bg-transparent disabled:text-slate-300"
        title="หน้าก่อนหน้า"
      >
        <i class="mdi mdi-chevron-left text-lg"></i>
        <span class="hidden sm:inline">ก่อนหน้า</span>
      </button>

      <!-- Page Numbers -->
      <div class="join">
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          @click="page !== '...' && goToPage(page)"
          class="join-item btn btn-sm rounded-xl min-w-[36px] px-2 font-medium transition-all"
          :class="[
            page === currentPage
              ? activeBtnClass
              : page === '...'
              ? 'btn-disabled bg-transparent text-slate-400 border-none'
              : 'btn-ghost text-slate-600 hover:bg-slate-100',
          ]"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
      </div>

      <!-- Next Page Button -->
      <button
        type="button"
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="btn btn-sm btn-ghost rounded-xl px-2.5 text-slate-600 disabled:bg-transparent disabled:text-slate-300"
        title="หน้าถัดไป"
      >
        <span class="hidden sm:inline">ถัดไป</span>
        <i class="mdi mdi-chevron-right text-lg"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    default: 5,
  },
  theme: {
    type: String,
    default: 'teal', // 'teal' | 'purple' | 'blue'
  },
})

const emit = defineEmits(['update:currentPage', 'update:itemsPerPage'])

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage) || 1
})

const fromItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const toItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})

const activeBtnClass = computed(() => {
  switch (props.theme) {
    case 'purple':
      return 'bg-purple-600 text-white hover:bg-purple-700 border-none shadow-sm shadow-purple-500/20'
    case 'blue':
      return 'bg-blue-600 text-white hover:bg-blue-700 border-none shadow-sm shadow-blue-500/20'
    case 'teal':
    default:
      return 'bg-brand-teal text-brand-navy hover:bg-teal-400 border-none shadow-sm shadow-teal-500/20 font-bold'
  }
})

const visiblePages = computed(() => {
  const current = props.currentPage
  const total = totalPages.value
  const pages = []

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) {
      pages.push('...')
    }

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('...')
    }
    pages.push(total)
  }

  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>
