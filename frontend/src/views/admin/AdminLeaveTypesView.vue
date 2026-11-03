<template>
  <div class="space-y-6 font-kanit">
    <!-- Header with Add Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2
          class="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2"
        >
          <i class="mdi mdi-format-list-bulleted-type text-blue-600"></i>
          จัดการประเภทการลา
        </h2>
        <p class="text-slate-500 text-sm mt-1">
          กำหนดและจัดการประเภทการลาสำหรับพนักงานในระบบ
        </p>
      </div>
      <button
        @click="openAddDialog"
        class="btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-2xl shadow-md shadow-blue-500/20 font-bold px-6 flex items-center gap-2"
      >
        <i class="mdi mdi-plus text-xl"></i>
        <span>เพิ่มประเภทการลา</span>
      </button>
    </div>

    <!-- Search & Filter Card -->
    <div
      class="card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div class="relative w-full sm:w-80">
        <span
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
        >
          <i class="mdi mdi-magnify text-lg"></i>
        </span>
        <input
          v-model="search"
          type="text"
          placeholder="ค้นหาชื่อประเภทการลา..."
          class="input input-bordered input-sm w-full pl-9 rounded-xl focus:border-blue-500 text-sm"
        />
      </div>
      <div class="text-xs text-slate-400 self-end sm:self-center">
        ทั้งหมด {{ filteredLeaveTypes.length }} ประเภท
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="leaveTypeStore.loading"
      class="flex flex-col items-center justify-center py-16 gap-3"
    >
      <span class="loading loading-spinner loading-lg text-blue-600"></span>
      <p class="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลประเภทการลา...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredLeaveTypes.length === 0"
      class="card bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
    >
      <div
        class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-3xl mb-3"
      >
        <i class="mdi mdi-format-list-bulleted text-3xl"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-700">ไม่พบประเภทการลา</h3>
      <p class="text-slate-400 text-sm mt-1">ยังไม่มีข้อมูลประเภทการลา หรือไม่พบชื่อที่ค้นหา</p>
    </div>

    <!-- Hybrid Content: Desktop Table / Mobile Cards -->
    <div v-else>
      <!-- 1. Desktop Table -->
      <div
        class="hidden sm:block card bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full text-left">
            <thead
              class="bg-slate-50/80 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="py-4 px-6 text-center w-24">ลำดับ</th>
                <th class="py-4 px-6">ชื่อประเภทการลา</th>
                <th class="py-4 px-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
              <tr
                v-for="(item, index) in paginatedLeaveTypes"
                :key="item.leave_type_id"
                class="hover:bg-blue-50/30 transition-colors"
              >
                <td class="py-4 px-6 text-center font-semibold text-slate-400">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="py-4 px-6 font-bold text-slate-800">
                  {{ item.leave_type_name }}
                </td>
                <td class="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                  <button
                    @click="openEditDialog(item)"
                    class="btn btn-ghost btn-xs rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <i class="mdi mdi-pencil"></i> แก้ไข
                  </button>
                  <button
                    @click="confirmDelete(item)"
                    class="btn btn-ghost btn-xs rounded-lg text-error hover:bg-red-50"
                  >
                    <i class="mdi mdi-trash-can-outline"></i> ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="(item, index) in paginatedLeaveTypes"
          :key="item.leave_type_id"
          class="card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="badge badge-ghost badge-sm font-bold text-slate-400"
                >#{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span
              >
              <span class="font-bold text-slate-800 text-base">{{ item.leave_type_name }}</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              @click="openEditDialog(item)"
              class="btn btn-ghost btn-xs rounded-lg text-blue-600"
            >
              แก้ไข
            </button>
            <button @click="confirmDelete(item)" class="btn btn-ghost btn-xs rounded-lg text-error">
              ลบ
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination Component -->
      <AppPagination
        v-model:current-page="currentPage"
        v-model:items-per-page="itemsPerPage"
        :total-items="filteredLeaveTypes.length"
        theme="blue"
      />
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="editDialog" class="modal modal-open z-50">
      <div class="modal-box bg-white rounded-3xl p-6 sm:p-8 max-w-md shadow-2xl relative">
        <button
          @click="closeEditDialog"
          class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
        <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i
            :class="isEdit ? 'mdi mdi-pencil text-blue-600' : 'mdi mdi-plus-circle text-blue-600'"
          ></i>
          {{ isEdit ? 'แก้ไขประเภทการลา' : 'เพิ่มประเภทการลาใหม่' }}
        </h3>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-medium text-slate-700"
                >ชื่อประเภทการลา <span class="text-error">*</span></span
              >
            </label>
            <input
              v-model="leaveTypeName"
              type="text"
              placeholder="เช่น ลาป่วย, ลากิจ, ลาคลอด"
              class="input input-bordered w-full rounded-2xl focus:border-blue-500 transition-all text-sm"
              :class="{ 'input-error': errors.leave_type_name }"
            />
            <span v-if="errors.leave_type_name" class="text-error text-xs mt-1">{{
              errors.leave_type_name
            }}</span>
          </div>

          <div class="modal-action pt-4 flex gap-2">
            <button
              type="button"
              class="btn btn-ghost rounded-xl flex-1 text-slate-600"
              @click="closeEditDialog"
              :disabled="saveLoading"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-6 flex-1 font-bold shadow-md shadow-blue-500/20"
              :disabled="saveLoading"
            >
              <span v-if="saveLoading" class="loading loading-spinner loading-xs"></span>
              {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างประเภทการลา' }}
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop bg-slate-900/40" @click="closeEditDialog"></div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="deleteDialog" class="modal modal-open z-50">
      <div class="modal-box bg-white rounded-3xl p-6 sm:p-8 max-w-sm shadow-2xl text-center">
        <div
          class="w-14 h-14 rounded-2xl bg-red-100 text-error flex items-center justify-center mx-auto mb-4 text-3xl"
        >
          <i class="mdi mdi-alert-circle-outline"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-800">ยืนยันการลบประเภทการลา?</h3>
        <p class="text-slate-500 text-xs mt-2">
          คุณต้องการลบ "{{ selectedItem?.leave_type_name }}" ใช่หรือไม่?
          การกระทำนี้ไม่สามารถย้อนกลับได้
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
            @click="handleDelete"
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
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useLeaveTypeStore } from '@/stores/leaveType'
import { useToastStore } from '@/stores/toast'
import AppPagination from '@/components/AppPagination.vue'

const leaveTypeStore = useLeaveTypeStore()
const toastStore = useToastStore()

const search = ref('')
const isEdit = ref(false)
const selectedItem = ref(null)
const editDialog = ref(false)
const deleteDialog = ref(false)
const saveLoading = ref(false)
const deleteLoading = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(5)

const validationSchema = yup.object({
  leave_type_name: yup.string().required('กรุณาระบุชื่อประเภทการลา'),
})

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    leave_type_name: '',
  },
})

const { value: leaveTypeName } = useField('leave_type_name')

const filteredLeaveTypes = computed(() => {
  const list = leaveTypeStore.leaveTypes || []
  if (!search.value.trim()) return list
  return list.filter(
    (item) =>
      item.leave_type_name &&
      item.leave_type_name.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const paginatedLeaveTypes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredLeaveTypes.value.slice(start, start + itemsPerPage.value)
})

watch([search, itemsPerPage], () => {
  currentPage.value = 1
})

const openAddDialog = () => {
  isEdit.value = false
  selectedItem.value = null
  resetForm({
    values: {
      leave_type_name: '',
    },
  })
  editDialog.value = true
}

const openEditDialog = (item) => {
  isEdit.value = true
  selectedItem.value = item
  setValues({
    leave_type_name: item.leave_type_name,
  })
  editDialog.value = true
}

const closeEditDialog = () => {
  if (!saveLoading.value) {
    editDialog.value = false
    resetForm()
  }
}

const handleSave = handleSubmit(async (values) => {
  saveLoading.value = true
  try {
    if (isEdit.value && selectedItem.value) {
      const res = await leaveTypeStore.updateLeaveType(selectedItem.value.leave_type_id, values)
      toastStore.add(res.data.message || 'แก้ไขประเภทการลาสำเร็จ', 'success')
    } else {
      const res = await leaveTypeStore.createLeaveType(values)
      toastStore.add(res.data.message || 'เพิ่มประเภทการลาสำเร็จ', 'success')
    }
    closeEditDialog()
  } catch (error) {
    toastStore.add(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error')
  } finally {
    saveLoading.value = false
  }
})

const confirmDelete = (item) => {
  selectedItem.value = item
  deleteDialog.value = true
}

const handleDelete = async () => {
  if (!selectedItem.value) return
  deleteLoading.value = true
  try {
    const res = await leaveTypeStore.deleteLeaveType(selectedItem.value.leave_type_id)
    toastStore.add(res.data.message || 'ลบประเภทการลาสำเร็จ', 'success')
    deleteDialog.value = false
  } catch (error) {
    toastStore.add(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ', 'error')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  leaveTypeStore.fetchLeaveTypes()
})
</script>
