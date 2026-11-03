<template>
  <div class="space-y-6 font-kanit">
    <!-- Header -->
    <div>
      <h2
        class="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2"
      >
        <i class="mdi mdi-clipboard-check text-purple-600"></i>
        แดชบอร์ดผู้จัดการ
      </h2>
    </div>


    <!-- Filter & Search Toolbar -->
    <div
      class="card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4"
    >
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <!-- Search -->
        <div class="relative w-full sm:w-72">
          <span
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
          >
            <i class="mdi mdi-magnify text-lg"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาชื่อพนักงาน, ประเภทลา หรือเหตุผล..."
            class="input input-bordered input-sm w-full pl-9 pr-8 rounded-xl focus:border-purple-500 text-sm"
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
        <select
          v-model="filterStatus"
          class="select select-bordered select-sm w-full sm:w-44 rounded-xl focus:border-purple-500 text-sm"
        >
          <option value="">ทุกสถานะ</option>
          <option value="pending">รออนุมัติ</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="rejected">ปฏิเสธ</option>
        </select>
      </div>

      <div class="text-xs text-slate-400 self-end md:self-center">
        พบคำขอทั้งหมด {{ filteredLeaves.length }} รายการ
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-3">
      <span class="loading loading-spinner loading-lg text-purple-600"></span>
      <p class="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลคำขอลา...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredLeaves.length === 0"
      class="card bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
    >
      <div
        class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-3xl mb-3"
      >
        <i v-if="searchQuery || filterStatus" class="mdi mdi-file-search-outline"></i>
        <i v-else class="mdi mdi-file-check-outline"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-700">ไม่พบข้อมูล</h3>
      <p class="text-slate-400 text-sm mt-1">
        {{
          searchQuery || filterStatus
            ? 'ไม่พบรายการคำขอลาที่ตรงกับเงื่อนไขการค้นหาของคุณ'
            : 'ไม่มีรายการคำขอลาในระบบขณะนี้'
        }}
      </p>
      <div v-if="searchQuery || filterStatus" class="mt-4">
        <button
          @click="resetFilters"
          class="btn btn-ghost btn-sm text-purple-600 hover:bg-purple-50 rounded-xl"
        >
          <i class="mdi mdi-refresh"></i> ล้างการค้นหา
        </button>
      </div>
    </div>

    <!-- Hybrid Content: Desktop Table / Mobile Cards -->
    <div v-else>
      <!-- 1. Desktop / Tablet View -->
      <div
        class="hidden sm:block card bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full text-left">
            <thead
              class="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="py-4 px-6">ผู้ยื่นคำขอ</th>
                <th class="py-4 px-6">ประเภทการลา</th>
                <th class="py-4 px-6">ช่วงวันที่ลา</th>
                <th class="py-4 px-6 text-center">จำนวนวัน</th>
                <th class="py-4 px-6 text-center">สถานะ</th>
                <th class="py-4 px-6 text-center">เอกสาร</th>
                <th class="py-4 px-6 text-right">การพิจารณา</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
              <tr
                v-for="leave in paginatedLeaves"
                :key="leave.report_id"
                class="hover:bg-purple-50/30 transition-colors"
              >
                <td class="py-4 px-6">
                  <div class="font-bold text-slate-800">{{ leave.fullname }}</div>
                  <div class="text-xs text-slate-400">{{ leave.email }}</div>
                </td>
                <td class="py-4 px-6 font-medium text-slate-700">
                  {{ leave.leave_type_name }}
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <div>{{ formatDate(leave.leave_at) }}</div>
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
                    class="btn btn-ghost btn-xs btn-circle text-purple-600 hover:bg-purple-50"
                    title="ดาวน์โหลดไฟล์แนบ"
                  >
                    <i class="mdi mdi-file-download text-lg"></i>
                  </a>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                  <button
                    @click="viewDetails(leave)"
                    class="btn btn-ghost btn-xs rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    รายละเอียด
                  </button>
                  <template v-if="leave.status === 'pending'">
                    <button
                      @click="handleApprove(leave)"
                      class="btn btn-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                      :disabled="actionLoading"
                    >
                      อนุมัติ
                    </button>
                    <button
                      @click="openRejectModal(leave)"
                      class="btn btn-xs rounded-lg bg-rose-500 hover:bg-rose-600 text-white border-none"
                      :disabled="actionLoading"
                    >
                      ปฏิเสธ
                    </button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Mobile Cards View -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="leave in paginatedLeaves"
          :key="leave.report_id"
          class="card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3"
        >
          <!-- Top Row -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="font-bold text-slate-800 text-base">{{ leave.fullname }}</div>
              <div class="text-xs text-slate-400">{{ leave.leave_type_name }}</div>
            </div>
            <span
              class="badge badge-sm font-semibold py-2 px-2.5 rounded-full"
              :class="statusBadgeClass(leave.status)"
            >
              {{ getStatusText(leave.status) }}
            </span>
          </div>

          <!-- Dates & Days -->
          <div
            class="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 flex justify-between items-center"
          >
            <span>{{ formatDate(leave.leave_at) }} - {{ formatDate(leave.leave_end) }}</span>
            <span class="font-bold text-purple-700">{{ leave.leave_days }} วัน</span>
          </div>

          <!-- Bottom Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              @click="viewDetails(leave)"
              class="btn btn-ghost btn-xs rounded-lg text-slate-600"
            >
              <i class="mdi mdi-eye"></i> รายละเอียด
            </button>
            <div v-if="leave.status === 'pending'" class="flex gap-1.5">
              <button
                @click="openRejectModal(leave)"
                class="btn btn-xs rounded-lg bg-rose-500 text-white border-none"
                :disabled="actionLoading"
              >
                ปฏิเสธ
              </button>
              <button
                @click="handleApprove(leave)"
                class="btn btn-xs rounded-lg bg-emerald-500 text-white border-none"
                :disabled="actionLoading"
              >
                อนุมัติ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Component -->
      <AppPagination
        v-model:current-page="currentPage"
        v-model:items-per-page="itemsPerPage"
        :total-items="filteredLeaves.length"
        theme="purple"
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
          <i class="mdi mdi-information-outline text-purple-600"></i>
          รายละเอียดคำขอลา
        </h3>

        <div v-if="selectedLeave" class="space-y-4 text-sm divide-y divide-slate-100">
          <div class="pt-2 flex justify-between">
            <span class="text-slate-400">ผู้ยื่นคำขอ:</span>
            <span class="font-bold text-slate-800"
              >{{ selectedLeave.fullname }} ({{ selectedLeave.email }})</span
            >
          </div>
          <div class="pt-3 flex justify-between">
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
            <span class="font-bold text-purple-600">{{ selectedLeave.leave_days }} วัน</span>
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
              class="btn btn-sm btn-outline border-purple-500 text-purple-700 hover:bg-purple-600 hover:text-white rounded-xl gap-1"
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

    <!-- Reject Reason Modal -->
    <div v-if="rejectDialog" class="modal modal-open z-50">
      <div class="modal-box bg-white rounded-3xl p-6 sm:p-8 max-w-md shadow-2xl relative">
        <button
          @click="closeRejectModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
        <h3 class="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <i class="mdi mdi-close-circle-outline text-error"></i>
          ปฏิเสธคำขอลา
        </h3>
        <p class="text-slate-500 text-xs mb-4">
          กรุณาระบุเหตุผลในการไม่อนุมัติคำขอนี้ เพื่อแจ้งให้พนักงานทราบ
        </p>

        <form @submit.prevent="handleRejectSubmit" class="space-y-4">
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-medium text-slate-700"
                >เหตุผลที่ไม่อนุมัติ <span class="text-error">*</span></span
              >
            </label>
            <textarea
              v-model="rejectReason"
              rows="3"
              placeholder="ระบุเหตุผล เช่น ติดภารกิจด่วน, พนักงานในแผนกหยุดชนกัน"
              class="textarea textarea-bordered w-full rounded-2xl focus:border-purple-500 transition-all text-sm"
              :class="{ 'textarea-error': errors.reject_reason }"
            ></textarea>
            <span v-if="errors.reject_reason" class="text-error text-xs mt-1">{{
              errors.reject_reason
            }}</span>
          </div>

          <div class="modal-action pt-2 flex gap-2">
            <button
              type="button"
              class="btn btn-ghost rounded-xl flex-1 text-slate-600"
              @click="closeRejectModal"
              :disabled="actionLoading"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="btn bg-rose-500 hover:bg-rose-600 text-white border-none rounded-xl px-6 flex-1 font-bold shadow-md shadow-red-500/20"
              :disabled="actionLoading"
            >
              <span v-if="actionLoading" class="loading loading-spinner loading-xs"></span>
              ยืนยันปฏิเสธ
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop bg-slate-900/40" @click="closeRejectModal"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useLeaveStore } from '@/stores/leave'
import { useToastStore } from '@/stores/toast'
import { getImageUrl } from '@/utils/imageUrl'
import AppPagination from '@/components/AppPagination.vue'

const leaveStore = useLeaveStore()
const toastStore = useToastStore()

const loading = ref(false)
const actionLoading = ref(false)
const filterStatus = ref('')
const searchQuery = ref('')
const selectedLeave = ref(null)
const detailDialog = ref(false)
const rejectDialog = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(5)

const validationSchema = yup.object({
  reject_reason: yup
    .string()
    .required('กรุณาระบุเหตุผลในการปฏิเสธ')
    .min(3, 'เหตุผลต้องมีความยาวอย่างน้อย 3 ตัวอักษร'),
})

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema,
  initialValues: {
    reject_reason: '',
  },
})

const { value: rejectReason } = useField('reject_reason')

const stats = computed(() => {
  const leaves = leaveStore.leaves || []
  return {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  }
})

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
}

const filteredLeaves = computed(() => {
  let list = leaveStore.leaves || []

  if (filterStatus.value) {
    list = list.filter((l) => l.status === filterStatus.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(
      (l) =>
        (l.fullname && l.fullname.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.leave_type_name && l.leave_type_name.toLowerCase().includes(q)) ||
        (l.reason && l.reason.toLowerCase().includes(q)) ||
        (l.leave_at && l.leave_at.toLowerCase().includes(q)) ||
        (l.leave_end && l.leave_end.toLowerCase().includes(q)),
    )
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
    case 'pending':
      return 'รออนุมัติ'
    case 'approved':
      return 'อนุมัติแล้ว'
    case 'rejected':
      return 'ปฏิเสธ'
    default:
      return status
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

const handleApprove = async (leave) => {
  actionLoading.value = true
  try {
    const res = await leaveStore.approveLeave(leave.report_id)
    toastStore.add(res.data.message || 'อนุมัติใบลาสำเร็จ', 'success')
  } catch (error) {
    toastStore.add(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติ', 'error')
  } finally {
    actionLoading.value = false
  }
}

const openRejectModal = (leave) => {
  selectedLeave.value = leave
  resetForm()
  rejectDialog.value = true
}

const closeRejectModal = () => {
  if (!actionLoading.value) {
    rejectDialog.value = false
    resetForm()
  }
}

const handleRejectSubmit = handleSubmit(async (values) => {
  if (!selectedLeave.value) return
  actionLoading.value = true
  try {
    const res = await leaveStore.rejectLeave(selectedLeave.value.report_id, values.reject_reason)
    toastStore.add(res.data.message || 'ปฏิเสธใบลาสำเร็จ', 'success')
    closeRejectModal()
  } catch (error) {
    toastStore.add(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธ', 'error')
  } finally {
    actionLoading.value = false
  }
})

const loadReports = async () => {
  loading.value = true
  try {
    await leaveStore.fetchLeaves()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReports()
})
</script>
