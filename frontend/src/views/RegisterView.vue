<script setup>
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useField, useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import * as yup from 'yup'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const validationSchema = yup.object({
  fullname: yup.string().required('กรุณากรอกชื่อ-นามสกุล'),
  email: yup.string().required('กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: yup.string().required('กรุณากรอกรหัสผ่าน').min(4, 'รหัสผ่านต้องมีอย่างน้อย 4 ตัว'),
})

const { handleSubmit, errors } = useForm({ validationSchema })
const { value: fullname } = useField('fullname')
const { value: email } = useField('email')
const { value: password } = useField('password')

const handleRegister = handleSubmit(async (value) => {
  try {
    const res = await authStore.register(value)
    toastStore.add(res.data.message || 'สมัครสมาชิกสำเร็จ', 'success')
    router.push('/login')
  } catch (error) {
    // Error Handling แสดงแจ้งเตือน Toast สีแดงผ่าน Axios Interceptor อัตโนมัติแล้ว
    console.error('Register error:', error)
  }
})
</script>

<template>
  <div class="w-full max-w-sm mx-auto">
    <div class="text-center mb-6">
      <div
        class="w-14 h-14 rounded-2xl bg-brand-teal/20 text-brand-navy flex items-center justify-center mx-auto mb-3 shadow-inner"
      >
        <i class="mdi mdi-account-plus text-2xl text-teal-500"></i>
      </div>
      <h2 class="text-2xl font-extrablod text-slate-800">สมัครสมาชิก</h2>
      <p class="text-slate-500 text-sm mt-1">Lorem, ipsum dolor.</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div class="form-control w-full">
        <label class="label py-1">
          <span class="label-text font-medium text-slate-700 text-sm"> ชื่อ-นามสกุล </span>
        </label>
        <div class="relative">
          <input
            type="text"
            v-model="fullname"
            placeholder="กรอกชื่อและนามสกุลจริง"
            class="input input-bordered w-full pl-5 rounded-2xl focus:border-brand-teal text-sm outline-0 border-2"
            :class="{ 'input-error': errors.fullname }"
          />
        </div>
        <span v-if="errors.fullname" class="text-error text-xs mt-1">{{ errors.fullname }}</span>
      </div>

      <div class="form-control w-full">
        <label class="label py-1">
          <span class="label-text font-medium text-slate-700 text-sm"> อีเมล </span>
        </label>
        <div class="relative">
          <input
            type="email"
            v-model="email"
            placeholder="name@example.com"
            class="input input-bordered w-full pl-5 rounded-2xl focus:border-brand-teal text-sm outline-0 border-2"
            :class="{ 'input-error': errors.email }"
          />
        </div>
        <span v-if="errors.email" class="text-error text-xs mt-1">{{ errors.email }}</span>
      </div>

      <div class="form-control w-full">
        <label class="label py-1">
          <span class="label-text font-medium text-slate-700 text-sm"> รหัสผ่าน </span>
        </label>
        <div class="relative">
          <input
            type="password"
            v-model="password"
            placeholder="กรอกรหัสผ่านของคุณ"
            class="input input-bordered w-full pl-5 rounded-2xl border-2 focus:border-brand-teal text-sm outline-0"
            :class="{ 'input-error': errors.password }"
          />
        </div>
        <span v-if="errors.password" class="text-error text-xs mt-1">{{ errors.password }}</span>
      </div>

      <button
        type="submit"
        class="btn bg-brand-teal hover:bg-teal-400 text-brand-navy border-none w-full rounded-2xl text-base font-bold shadow-md shadow-teal-500/20 mt-4 h4"
      >
        <span>สมัครสมาชิก</span>
      </button>
    </form>

    <div class="mt-6 text-center text-sm text-slate-500">
      มีบัญชีอยู่แล้วใช่หรือไม่?
      <router-link
        to="/login"
        class="text-teal-600 hover:text-teal-700 font-bold ml-1 hover:underline"
      >
        เข้าสู่ระบบ!
      </router-link>
    </div>
  </div>
</template>
