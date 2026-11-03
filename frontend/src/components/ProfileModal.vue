<template>
  <div v-if="modelValue" class="modal modal-open z-50 font-kanit">
    <div class="modal-box max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
      <!-- Close button -->
      <button
        @click="closeModal"
        class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        aria-label="Close"
      >
        ✕
      </button>

      <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <i class="mdi mdi-account-edit text-teal-600 text-2xl"></i>
        แก้ไขข้อมูลโปรไฟล์
      </h3>

      <form @submit.prevent="handleSave" class="space-y-4">
        <!-- Avatar Preview & Upload -->
        <div class="flex flex-col items-center gap-3 py-2">
          <div class="avatar relative group">
            <div
              class="w-24 h-24 rounded-full ring ring-teal-300 ring-offset-base-100 ring-offset-2 overflow-hidden bg-slate-100 flex items-center justify-center"
            >
              <img
                v-if="previewUrl || currentProfileUrl"
                :src="previewUrl || currentProfileUrl"
                alt="Profile Preview"
                class="w-full h-full object-cover"
              />
              <i v-else class="mdi mdi-account text-5xl text-slate-400"></i>
            </div>
          </div>
          <label
            class="btn btn-sm btn-outline border-teal-500 text-teal-700 hover:bg-teal-500 hover:text-white rounded-xl flex items-center gap-1 cursor-pointer"
          >
            เลือกรูปภาพโปรไฟล์
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              class="hidden"
              @change="onFileChange"
            />
          </label>
        </div>

        <!-- Fullname Input with Vee-Validate -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text font-medium text-slate-700"
              >ชื่อ-นามสกุล <span class="text-error">*</span></span
            >
          </label>
          <input
            v-model="fullname"
            type="text"
            placeholder="กรอกชื่อ-นามสกุลของคุณ"
            class="input input-bordered w-full rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
            :class="{ 'input-error': errors.fullname }"
          />
          <span v-if="errors.fullname" class="text-error text-xs mt-1">{{ errors.fullname }}</span>
        </div>

        <!-- Email (Disabled/Read-only) -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text font-medium text-slate-700">อีเมล (ไม่สามารถแก้ไขได้)</span>
          </label>
          <input
            :value="authStore.user?.email || ''"
            type="email"
            disabled
            class="input input-bordered w-full rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed text-sm"
          />
        </div>

        <!-- Action Buttons -->
        <div class="modal-action pt-4 flex gap-2">
          <button
            type="button"
            class="btn btn-ghost rounded-xl flex-1 text-slate-600"
            @click="closeModal"
            :disabled="loading"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            class="btn bg-brand-teal hover:bg-teal-400 text-brand-navy border-none rounded-xl px-6 flex-1 font-bold shadow-md shadow-teal-500/20"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs"></span>
            บันทึกข้อมูล
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop bg-slate-900/40" @click="closeModal"></div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { getImageUrl } from '@/utils/imageUrl'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const selectedFile = ref(null)
const previewUrl = ref(null)

const validationSchema = yup.object({
  fullname: yup
    .string()
    .required('กรุณากรอกชื่อ-นามสกุล')
    .min(2, 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร'),
})

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    fullname: '',
  },
})

const { value: fullname } = useField('fullname')

const currentProfileUrl = computed(() => {
  if (authStore.user?.profile) {
    return getImageUrl(authStore.user.profile)
  }
  return null
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      setValues({
        fullname: authStore.user?.fullname || '',
      })
      selectedFile.value = null
      previewUrl.value = null
    }
  },
)

const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const closeModal = () => {
  if (!loading.value) {
    emit('update:modelValue', false)
    resetForm()
  }
}

const handleSave = handleSubmit(async (values) => {
  loading.value = true
  try {
    await authStore.editProfile({
      fullname: values.fullname,
    })

    if (selectedFile.value && authStore.user?.user_id) {
      const formData = new FormData()
      formData.append('profile', selectedFile.value)
      await authStore.uploadProfileImage(authStore.user.user_id, formData)
    }

    await authStore.fetchProfile()
    toastStore.add('แก้ไขโปรไฟล์สำเร็จ', 'success')
    closeModal()
  } catch (error) {
    console.error(error)
    toastStore.add(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error')
  } finally {
    loading.value = false
  }
})
</script>
