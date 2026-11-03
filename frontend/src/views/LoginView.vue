<script setup>
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { getUserRole } from '@/utils/auth'
import { useField, useForm } from 'vee-validate'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)

const validationSchema = yup.object({
  email: yup.string().required('กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: yup
    .string()
    .required('กรุณากรอกรหัสผ่าน')
    .min(4, 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัว'),
})

const { handleSubmit, errors } = useForm({ validationSchema })
const { value: email } = useField('email')
const { value: password } = useField('password')

const handleLogin = handleSubmit(async (value) => {
  try {
    const res = await authStore.login(value)
    toastStore.add(res.data.message || 'เข้าสู่ระบบสำเร็จ', 'success')

    const role = getUserRole(res.data.token)
    if (role === 'admin') router.push('/admin')
    else if (role === 'manager') router.push('/manager')
    else router.push('/user')
  } catch (error) {
    toastStore.add(error.response?.data.message)
  }
})
</script>

<template>
  <div class="w-full max-w-sm mx-auto">
    <div class="text-center mb-6">
      <div
        class="w-14 h-14 rounded-2xl bg-brand-teal/20 text-brand-navy flex items-center justify-center mx-auto mb-3 shadow-inner"
      >
        <i class="mdi mdi-lock-outline text-2xl text-teal-500"></i>
      </div>
      <h2 class="text-2xl font-extrablod text-slate-800">เข้าสู่ระบบ</h2>
      <p class="text-slate-500 text-sm mt-1">Lorem, ipsum dolor.</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
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
            class="input input-bordered w-full pl-5 rounded-2xl focus:border-brand-teal text-sm outline-0 border-2"
            :class="{ 'input-error': errors.password }"
          />
        </div>
        <span v-if="errors.password" class="text-error text-xs mt-1">{{ errors.password }}</span>
      </div>

      <button
        type="submit"
        class="btn bg-brand-teal hover:bg-teal-400 text-brand-navy border-none w-full rounded-2xl text-base font-bold shadow-md shadow-teal-500/20 mt-4 h4"
      >
        <span>เข้าสู่ระบบ</span>
      </button>
    </form>
    <div class="mt-6 text-center text-sm text-slate-500">
      ยังไม่มีบัญชีใช่หรือไม่?
      <router-link
        to="/register"
        class="text-teal-600 hover:text-teal-700 font-bold ml-1 hover:underline"
      >
        สมัครสมาชิก!
      </router-link>
    </div>
  </div>
</template>
