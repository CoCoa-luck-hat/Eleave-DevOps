<template>
  <div class="space-y-6 font-kanit">
    <!-- Header with Create Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2
          class="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2"
        >
          <i class="mdi mdi-file-document-multiple text-teal-600"></i>
          ประวัติการลา
        </h2>
      </div>
      <router-link
        to="/user/create-leave"
        class="btn bg-brand-teal hover:bg-teal-400 text-brand-navy border-none rounded-2xl shadow-md shadow-teal-500/20 font-bold px-6 flex items-center gap-2"
      >
        <i class="mdi mdi-plus text-xl"></i>
        <span>สร้างใบลาใหม่</span>
      </router-link>
    </div>

    <!-- Filter & Search Card -->
    <div
      class="card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
        <!-- Search Input -->
        <div class="relative w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาประเภทการลา, เหตุผล หรือวันที่..."
            class="input input-bordered input-sm w-full pl-3 pr-8 rounded-xl focus:border-teal-500 text-sm"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            type="button"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            aria-label="ล้างคำค้นหา"
          >
            <i class="mdi mdi-close-circle text-base"></i>
          </button>
        </div>

        <!-- Status Filter -->
        <div class="w-full sm:w-44">
          <select
            v-model="filterStatus"
            class="select select-bordered select-sm w-full rounded-xl focus:border-teal-500 text-sm"
          >
            <option value="">ทั้งหมดทุกสถานะ</option>
            <option value="pending">รออนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ปฏิเสธ</option>
          </select>
        </div>
      </div>

      <div class="text-xs text-slate-400 self-end sm:self-center whitespace-nowrap">
        พบข้อมูลทั้งหมด {{ filteredLeaves.length }} รายการ
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-3">
      <span class="loading loading-spinner loading-lg text-teal-500"></span>
      <p class="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลประวัติการลา...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredLeaves.length === 0"
      class="card bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
    >
      <h3 class="text-lg font-bold text-slate-700">ไม่พบข้อมูล</h3>
      <p class="text-slate-400 text-sm mt-1">ไม่พบรายการใบลาที่ตรงกับคำค้นหาหรือตัวกรอง</p>
      <div v-if="searchQuery || filterStatus" class="mt-4">
        <button
          @click="resetFilters"
          class="btn btn-ghost btn-sm text-teal-600 hover:bg-teal-50 rounded-xl"
        >
          <i class="mdi mdi-refresh"></i> ล้างการค้นหา
        </button>
      </div>
    </div>

    <!-- Hybrid Content: Desktop Table / Mobile Cards -->
    <div v-else>
      <!-- 1. Desktop / Tablet View (Table) -->
      <div
        class="hidden sm:block card bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full text-left">
            <thead
              class="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="py-4 px-6">ประเภทการลา</th>
                <th class="py-4 px-6">ช่วงวันที่ลา</th>
                <th class="py-4 px-6 text-center">จำนวนวัน</th>
                <th class="py-4 px-6 text-center">สถานะ</th>
                <th class="py-4 px-6 text-center">เอกสารแนบ</th>
                <th class="py-4 px-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
              <tr
                v-for="leave in paginatedLeaves"
                :key="leave.report_id"
                class="hover:bg-teal-50/30 transition-colors"
              >
                <td class="py-4 px-6 font-semibold text-slate-800">
                  {{ leave.leave_type_name }}
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <div class="font-medium">{{ formatDate(leave.leave_at) }}</div>
                  <div class="text-xs text-slate-400">ถึง {{ formatDate(leave.leave_end) }}</div>
                </td>
                <td class="py-4 px-6 text-center font-bold text-slate-800">
                  {{ leave.leave_days }} วัน
                </td>
                <td class="py-4 px-6 text-center">
                  <span
                    class="badge badge-sm font-semibold py-2.5 px-3 rounded-full"
                    :class="statusBadgeClass(leave.status)"
                  >
                    {{ getStatusText(leave.status) }}
                  </span>
                </td>
                <td class="py-4 px-6 text-center">
                  <a
                    v-if="leave.file_report"
                    :href="getFileUrl(leave.file_report)"
                    target="_blank"
                    class="btn btn-ghost btn-xs btn-circle text-teal-600 hover:bg-teal-50"
                    title="ดาวน์โหลดไฟล์แนบ"
                  >
                    <i class="mdi mdi-file-download text-lg"></i>
                  </a>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                  <button
                    @click="viewDetails(leave)"
                    class="btn btn-ghost btn-xs rounded-lg text-teal-600 hover:bg-teal-50"
                  >
                    รายละเอียด
                  </button>
                  <button
                    v-if="leave.status === 'pending'"
                    @click="confirmDelete(leave)"
                    class="btn btn-ghost btn-xs rounded-lg text-error hover:bg-red-50"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Mobile View (Card List) -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="leave in paginatedLeaves"
          :key="leave.report_id"
          class="card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3"
        >
          <!-- Top Row: Leave Type & Status -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="font-bold text-slate-800 text-base block">{{
                leave.leave_type_name
              }}</span>
              <span class="text-xs text-slate-400">
                {{ formatDate(leave.leave_at) }} - {{ formatDate(leave.leave_end) }}
              </span>
            </div>
            <span
              class="badge badge-sm font-semibold py-2 px-2.5 rounded-full"
              :class="statusBadgeClass(leave.status)"
            >
              {{ getStatusText(leave.status) }}
            </span>
          </div>

          <!-- Middle Row: Days & Reason preview -->
          <div
            class="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 flex justify-between items-center"
          >
            <span
              >จำนวนวันลา: <strong class="text-slate-800">{{ leave.leave_days }} วัน</strong></span
            >
            <a
              v-if="leave.file_report"
              :href="getFileUrl(leave.file_report)"
              target="_blank"
              class="text-teal-600 flex items-center gap-1 font-semibold hover:underline"
            >
              <i class="mdi mdi-paperclip"></i> ดูเอกสาร
            </a>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              @click="viewDetails(leave)"
              class="btn btn-ghost btn-xs rounded-lg text-teal-600 hover:bg-teal-50"
            >
              <i class="mdi mdi-eye"></i> ดูรายละเอียด
            </button>
            <button
              v-if="leave.status === 'pending'"
              @click="confirmDelete(leave)"
              class="btn btn-ghost btn-xs rounded-lg text-error hover:bg-red-50"
            >
              <i class="mdi mdi-trash-can-outline"></i> ยกเลิกใบลา
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination Component -->
      <AppPagination
        v-model:current-page="currentPage"
        v-model:items-per-page="itemsPerPage"
        :total-items="filteredLeaves.length"
        theme="teal"
      />
    </div>

    <!-- Detail Modal -->
    <div v-if="detailDialog" class="modal modal-open z-50">
      <div class="modal-box bg-white rounded-3xl p-6 sm:p-8 max-w-lg shadow-2xl relative">
        <button
          @click="detailDialog = false"
          class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
        <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i class="mdi mdi-information-outline text-teal-600"></i>
          รายละเอียดคำขอลา
        </h3>

        <div v-if="selectedLeave" class="space-y-4 text-sm divide-y divide-slate-100">
          <div class="pt-2 flex justify-between">
            <span class="text-slate-400">ประเภทการลา:</span>
            <span class="font-bold text-slate-800">{{ selectedLeave.leave_type_name }}</span>
          </div>
          <div class="pt-3 flex justify-between">
            <span class="text-slate-400">ช่วงวันที่ลา:</span>
            <span class="font-medium text-slate-800"
              >{{ formatDate(selectedLeave.leave_at) }} ถึง
              {{ formatDate(selectedLeave.leave_end) }}</span
            >
          </div>
          <div class="pt-3 flex justify-between">
            <span class="text-slate-400">จำนวนวันทั้งหมด:</span>
            <span class="font-bold text-teal-600">{{ selectedLeave.leave_days }} วัน</span>
          </div>
          <div class="pt-3 flex justify-between items-center">
            <span class="text-slate-400">สถานะปัจจุบัน:</span>
            <span
              class="badge badge-sm font-semibold py-2 px-3 rounded-full"
              :class="statusBadgeClass(selectedLeave.status)"
            >
              {{ getStatusText(selectedLeave.status) }}
            </span>
          </div>
          <div class="pt-3">
            <span class="text-slate-400 block mb-1">เหตุผลการลา:</span>
            <p class="bg-slate-50 rounded-xl p-3 text-slate-700 leading-relaxed">
              {{ selectedLeave.reason || '-' }}
            </p>
          </div>
          <div
            v-if="selectedLeave.status === 'rejected' && selectedLeave.reject_reason"
            class="pt-3"
          >
            <span class="text-error font-medium block mb-1">เหตุผลที่ปฏิเสธ:</span>
            <p class="bg-red-50 border border-red-100 rounded-xl p-3 text-error leading-relaxed">
              {{ selectedLeave.reject_reason }}
            </p>
          </div>
          <div v-if="selectedLeave.file_report" class="pt-3 flex justify-between items-center">
            <span class="text-slate-400">เอกสารแนบ:</span>
            <a
              :href="getFileUrl(selectedLeave.file_report)"
              target="_blank"
              class="btn btn-sm btn-outline border-teal-500 text-teal-700 hover:bg-teal-500 hover:text-white rounded-xl gap-1"
            >
              <i class="mdi mdi-download"></i> เปิดไฟล์แนบ
            </a>
          </div>
        </div>

        <div class="modal-action pt-4">
          <button @click="detailDialog = false" class="btn btn-ghost rounded-xl w-full">ปิด</button>
        </div>
      </div>
      <div class="modal-backdrop bg-slate-900/40" @click="detailDialog = false"></div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="deleteDialog" class="modal modal-open z-50">
      <div class="modal-box bg-white rounded-3xl p-6 sm:p-8 max-w-sm shadow-2xl text-center">
        <div
          class="w-14 h-14 rounded-2xl bg-red-100 text-error flex items-center justify-center mx-auto mb-4 text-3xl"
        >
          <i class="mdi mdi-alert-circle-outline"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-800">ยืนยันการยกเลิกใบลา?</h3>
        <p class="text-slate-500 text-xs mt-2">
          คุณต้องการลบคำขอลาหยุดนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>

        <div class="flex items-center justify-center gap-3 mt-6">
          <button
            class="btn btn-ghost rounded-xl flex-1 text-slate-600"
            @click="deleteDialog = false"
            :disabled="deleteLoading"
          >
            ยกเลิก
          </button>
          <button
            class="btn btn-error text-white rounded-xl flex-1 font-bold"
            @click="deleteLeave"
            :disabled="deleteLoading"
          >
            <span v-if="deleteLoading" class="loading loading-spinner loading-xs"></span>
            ยืนยันลบ
          </button>
        </div>
      </div>
      <div class="modal-backdrop bg-slate-900/40" @click="deleteDialog = false"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLeaveStore } from '@/stores/leave'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { getImageUrl } from '@/utils/imageUrl'
import AppPagination from '@/components/AppPagination.vue'

const leaveStore = useLeaveStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const selectedLeave = ref(null)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const deleteLoading = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(5)

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
}

const filteredLeaves = computed(() => {
  let list = leaveStore.leaves || []
  if (filterStatus.value) {
    list = list.filter((leave) => leave.status === filterStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter((leave) => {
      const typeName = (leave.leave_type_name || '').toLowerCase()
      const reason = (leave.reason || '').toLowerCase()
      const leaveAt = (leave.leave_at || '').toLowerCase()
      const leaveEnd = (leave.leave_end || '').toLowerCase()
      return (
        typeName.includes(q) || reason.includes(q) || leaveAt.includes(q) || leaveEnd.includes(q)
      )
    })
  }
  return list
})

const paginatedLeaves = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredLeaves.value.slice(start, start + itemsPerPage.value)
})

watch([searchQuery, filterStatus, itemsPerPage], () => {
  currentPage.value = 1
})

const getStatusText = (status) => {
  switch (status) {
    case 'approved':
      return 'อนุมัติแล้ว'
    case 'rejected':
      return 'ปฏิเสธ'
    case 'pending':
    default:
      return 'รออนุมัติ'
  }
}

const statusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 border-none'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-none'
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-800 border-none'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getFileUrl = (filename) => {
  return getImageUrl(filename)
}

const viewDetails = (item) => {
  selectedLeave.value = item
  detailDialog.value = true
}

const confirmDelete = (item) => {
  selectedLeave.value = item
  deleteDialog.value = true
}

const deleteLeave = async () => {
  if (!selectedLeave.value) return
  deleteLoading.value = true
  try {
    await leaveStore.deleteLeave(selectedLeave.value.report_id)
    toastStore.add('ลบใบลาสำเร็จ', 'success')
    deleteDialog.value = false
    await loadUserLeaves()
  } catch (error) {
    toastStore.add(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบใบลา', 'error')
  } finally {
    deleteLoading.value = false
  }
}

const loadUserLeaves = async () => {
  loading.value = true
  try {
    if (!authStore.user) {
      await authStore.fetchProfile()
    }
    const userId = authStore.user?.user_id
    if (userId) {
      await leaveStore.fetchUserLeaves(userId)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserLeaves()
})
</script>
