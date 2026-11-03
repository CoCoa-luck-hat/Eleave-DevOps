<template>
  <div class="max-w-3xl mx-auto space-y-6 font-kanit">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2
          class="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2"
        >
          <i class="mdi mdi-file-document-plus text-teal-600"></i>
          สร้างใบลา
        </h2>
      </div>
      <router-link to="/user" class="btn btn-ghost btn-sm rounded-xl text-slate-600 gap-1">
        <i class="mdi mdi-arrow-left"></i>
        ย้อนกลับ
      </router-link>
    </div>

    <!-- Form Card -->
    <div class="card bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
      <form @submit.prevent="handleCreateLeave" class="space-y-5">
        <!-- Leave Type -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text font-medium text-slate-700"
              >ประเภทการลา <span class="text-error">*</span></span
            >
          </label>
          <select
            v-model="leaveTypeId"
            class="select select-bordered w-full rounded-2xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
            :class="{ 'select-error': errors.leave_type_id }"
          >
            <option value="" disabled selected>เลือกประเภทการลา</option>
            <option
              v-for="item in leaveTypes"
              :key="item.leave_type_id"
              :value="item.leave_type_id"
            >
              {{ item.leave_type_name }}
            </option>
          </select>
          <span v-if="errors.leave_type_id" class="text-error text-xs mt-1">{{
            errors.leave_type_id
          }}</span>
        </div>

        <!-- Dates Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Start Date -->
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-medium text-slate-700"
                >วันที่เริ่มต้น <span class="text-error">*</span></span
              >
            </label>
            <input
              v-model="leaveAt"
              type="date"
              class="input input-bordered w-full rounded-2xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
              :class="{ 'input-error': errors.leave_at }"
              @change="calculateDays"
            />
            <span v-if="errors.leave_at" class="text-error text-xs mt-1">{{
              errors.leave_at
            }}</span>
          </div>

          <!-- End Date -->
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-medium text-slate-700"
                >วันที่สิ้นสุด <span class="text-error">*</span></span
              >
            </label>
            <input
              v-model="leaveEnd"
              type="date"
              class="input input-bordered w-full rounded-2xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
              :class="{ 'input-error': errors.leave_end }"
              @change="calculateDays"
            />
            <span v-if="errors.leave_end" class="text-error text-xs mt-1">{{
              errors.leave_end
            }}</span>
          </div>
        </div>


        <!-- Reason -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text font-medium text-slate-700">เหตุผลการลา</span>
          </label>
          <textarea
            v-model="reason"
            rows="3"
            placeholder="ระบุเหตุผลในการขอลา"
            class="textarea textarea-bordered w-full rounded-2xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
          ></textarea>
        </div>

        <!-- File Attachment -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text font-medium text-slate-700"
              >เอกสารแนบ (ถ้ามี เช่น ใบรับรองแพทย์)</span
            >
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            @change="handleFileUpload"
            class="file-input file-input-bordered w-full rounded-2xl focus:border-teal-500 transition-all text-sm"
          />
        </div>

        <!-- Submit Actions -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          <router-link to="/user" class="btn btn-ghost w-full sm:w-auto rounded-2xl text-slate-600">
            ยกเลิก
          </router-link>
          <button
            type="submit"
            class="btn bg-brand-teal hover:bg-teal-400 text-brand-navy border-none w-full sm:w-auto px-8 rounded-2xl font-bold shadow-md shadow-teal-500/20"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span>ยื่นใบลา</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useLeaveStore } from '@/stores/leave'
import { useLeaveTypeStore } from '@/stores/leaveType'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const leaveStore = useLeaveStore()
const leaveTypeStore = useLeaveTypeStore()
const toastStore = useToastStore()

const loading = ref(false)
const leaveTypes = ref([])
const leaveDays = ref(1)
const selectedFile = ref(null)

const validationSchema = yup.object({
  leave_type_id: yup.string().required('กรุณาเลือกประเภทการลา'),
  leave_at: yup.string().required('กรุณาระบุวันที่เริ่มต้น'),
  leave_end: yup.string().required('กรุณาระบุวันที่สิ้นสุด'),
  reason: yup.string().nullable().optional(),
})

const { handleSubmit, errors } = useForm({
  validationSchema,
  initialValues: {
    leave_type_id: '',
    leave_at: '',
    leave_end: '',
    reason: '',
  },
})

const { value: leaveTypeId } = useField('leave_type_id')
const { value: leaveAt } = useField('leave_at')
const { value: leaveEnd } = useField('leave_end')
const { value: reason } = useField('reason')

const calculateDays = () => {
  if (leaveAt.value && leaveEnd.value) {
    const start = new Date(leaveAt.value)
    const end = new Date(leaveEnd.value)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1)
    leaveDays.value = diffDays
  }
}

const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleCreateLeave = handleSubmit(async (values) => {
  loading.value = true
  try {
    const finalDays = parseInt(leaveDays.value, 10) || 1
    const formDataToSend = new FormData()
    formDataToSend.append('leave_type_id', values.leave_type_id)
    formDataToSend.append('leave_at', values.leave_at)
    formDataToSend.append('leave_end', values.leave_end)
    formDataToSend.append('leave_days', finalDays)
    formDataToSend.append('reason', values.reason || '')

    if (selectedFile.value) {
      formDataToSend.append('file_report', selectedFile.value)
    }

    const response = await leaveStore.createLeave(formDataToSend)
    toastStore.add(response.data.message || 'ส่งใบลาสำเร็จเรียบร้อย', 'success')
    router.push('/user')
  } catch (error) {
    console.error(error)
    toastStore.add(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งใบลา', 'error')
  } finally {
    loading.value = false
  }
})

onMounted(async () => {
  try {
    await leaveTypeStore.fetchLeaveTypes()
    leaveTypes.value = leaveTypeStore.leaveTypes || []
  } catch (error) {
    console.error(error)
  }
})
</script>
