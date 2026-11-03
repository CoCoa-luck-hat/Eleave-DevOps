<template>
  <div class="space-y-6 font-kanit">
    <!-- Header with Add User Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2
          class="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2"
        >
          <i class="mdi mdi-account-multiple text-blue-600"></i>
          จัดการผู้ใช้
        </h2>
      </div>
      <button
        @click="openAddDialog"
        class="btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-2xl shadow-md shadow-blue-500/20 font-bold px-6 flex items-center gap-2"
      >
        <i class="mdi mdi-account-plus text-xl"></i>
        <span>เพิ่มผู้ใช้ใหม่</span>
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
          placeholder="ค้นหาชื่อ, อีเมล หรือบทบาท..."
          class="input input-bordered input-sm w-full pl-9 rounded-xl focus:border-blue-500 text-sm"
        />
      </div>
      <div class="text-xs text-slate-400 self-end sm:self-center">
        ทั้งหมด {{ filteredUsers.length }} บัญชีผู้ใช้
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="userStore.loading" class="flex flex-col items-center justify-center py-16 gap-3">
      <span class="loading loading-spinner loading-lg text-blue-600"></span>
      <p class="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredUsers.length === 0"
      class="card bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
    >
      <div
        class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-3xl mb-3"
      >
        <i class="mdi mdi-account-search text-3xl"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-700">ไม่พบผู้ใช้งาน</h3>
      <p class="text-slate-400 text-sm mt-1">ยังไม่มีข้อมูลผู้ใช้งาน หรือไม่ตรงกับคำค้นหา</p>
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
                <th class="py-4 px-6">ชื่อ-นามสกุล</th>
                <th class="py-4 px-6">อีเมล</th>
                <th class="py-4 px-6 text-center">บทบาท (Role)</th>
                <th class="py-4 px-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
              <tr
                v-for="user in paginatedUsers"
                :key="user.user_id"
                class="hover:bg-blue-50/30 transition-colors"
              >
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0"
                    >
                      <img
                        v-if="user.profile"
                        :src="getImageUrl(user.profile)"
                        alt="Avatar"
                        class="w-full h-full object-cover"
                      />
                      <i v-else class="mdi mdi-account text-slate-400 text-lg"></i>
                    </div>
                    <span class="font-bold text-slate-800">{{ user.fullname }}</span>
                  </div>
                </td>
                <td class="py-4 px-6 text-slate-600">
                  {{ user.email }}
                </td>
                <td class="py-4 px-6 text-center">
                  <span
                    class="badge badge-sm font-semibold py-2.5 px-3 rounded-full"
                    :class="getRoleBadgeClass(user.role)"
                  >
                    {{ getRoleText(user.role) }}
                  </span>
                </td>
                <td class="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                  <button
                    @click="openEditDialog(user)"
                    class="btn btn-ghost btn-xs rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <i class="mdi mdi-pencil"></i> แก้ไข
                  </button>
                  <button
                    @click="confirmDelete(user)"
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
          v-for="user in paginatedUsers"
          :key="user.user_id"
          class="card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              <img
                v-if="user.profile"
                :src="getImageUrl(user.profile)"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <i v-else class="mdi mdi-account text-slate-400 text-xl"></i>
            </div>
            <div class="flex-1 min-w-0">
              <span class="font-bold text-slate-800 text-base block truncate">{{
                user.fullname
              }}</span>
              <span class="text-xs text-slate-400 block truncate">{{ user.email }}</span>
            </div>
            <span
              class="badge badge-sm font-semibold py-2 px-2.5 rounded-full"
              :class="getRoleBadgeClass(user.role)"
            >
              {{ getRoleText(user.role) }}
            </span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              @click="openEditDialog(user)"
              class="btn btn-ghost btn-xs rounded-lg text-blue-600"
            >
              แก้ไข
            </button>
            <button @click="confirmDelete(user)" class="btn btn-ghost btn-xs rounded-lg text-error">
              ลบ
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination Component -->
      <AppPagination
        v-model:current-page="currentPage"
        v-model:items-per-page="itemsPerPage"
        :total-items="filteredUsers.length"
        theme="blue"
      />
    </div>

    <!-- Add/Edit User Modal -->
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
            :class="
              isEdit ? 'mdi mdi-account-edit text-blue-600' : 'mdi mdi-account-plus text-blue-600'
            "
          ></i>
          {{ isEdit ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่' }}
        </h3>

        <form @submit.prevent="handleSave" class="space-y-4">
          <!-- Fullname -->
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-medium text-slate-700"
                >ชื่อ-นามสกุล <span class="text-error">*</span></span
              >
            </label>
            <input
              v-model="fullname"
              type="text"
              placeholder="กรอกชื่อ-นามสกุล"
              class="input input-bordered w-full rounded-2xl focus:border-blue-500 transition-all text-sm"
              :class="{ 'input-error': errors.fullname }"
            />
            <span v-if="errors.fullname" class="text-error text-xs mt-1">{{
              errors.fullname
            }}</span>
          </div>

          <!-- Email -->
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-medium text-slate-700"
                >อีเมล <span class="text-error">*</span></span
              >
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="example@company.com"
              class="input input-bordered w-full rounded-2xl focus:border-blue-500 transition-all text-sm"
              :class="{ 'input-error': errors.email }"
            />
            <span v-if="errors.email" class="text-error text-xs mt-1">{{ errors.email }}</span>
          </div>

          <!-- Password (Always required) -->
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-medium text-slate-700">
                {{ isEdit ? 'รหัสผ่านใหม่' : 'รหัสผ่าน' }} <span class="text-error">*</span>
              </span>
            </label>
            <input
              v-model="password"
              type="password"
              :placeholder="isEdit ? 'กำหนดรหัสผ่านใหม่' : 'กำหนดรหัสผ่านเริ่มต้น'"
              class="input input-bordered w-full rounded-2xl focus:border-blue-500 transition-all text-sm"
              :class="{ 'input-error': errors.password }"
            />
            <span v-if="errors.password" class="text-error text-xs mt-1">{{
              errors.password
            }}</span>
          </div>

          <!-- Role Select -->
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-medium text-slate-700"
                >บทบาท (Role) <span class="text-error">*</span></span
              >
            </label>
            <select
              v-model="role"
              class="select select-bordered w-full rounded-2xl focus:border-blue-500 transition-all text-sm"
              :class="{ 'select-error': errors.role }"
            >
              <option value="employee">พนักงาน (Employee)</option>
              <option value="manager">ผู้จัดการ (Manager)</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            </select>
            <span v-if="errors.role" class="text-error text-xs mt-1">{{ errors.role }}</span>
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
              {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างบัญชีผู้ใช้' }}
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
        <h3 class="text-lg font-bold text-slate-800">ยืนยันการลบบัญชีผู้ใช้?</h3>
        <p class="text-slate-500 text-xs mt-2">
          คุณต้องการลบบัญชีของ "{{ selectedUser?.fullname }}" ใช่หรือไม่?
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
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { getImageUrl } from '@/utils/imageUrl'
import AppPagination from '@/components/AppPagination.vue'

const userStore = useUserStore()
const toastStore = useToastStore()

const search = ref('')
const isEdit = ref(false)
const selectedUser = ref(null)
const editDialog = ref(false)
const deleteDialog = ref(false)
const saveLoading = ref(false)
const deleteLoading = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(5)

const validationSchema = yup.object({
  fullname: yup
    .string()
    .required('กรุณากรอกชื่อ-นามสกุล')
    .min(2, 'ต้องมีความยาวอย่างน้อย 2 ตัวอักษร'),
  email: yup.string().required('กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: yup
    .string()
    .required('กรุณากรอกรหัสผ่าน')
    .min(4, 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร'),
  role: yup.string().required('กรุณาเลือกบทบาท'),
})

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    fullname: '',
    email: '',
    password: '',
    role: 'employee',
  },
})

const { value: fullname } = useField('fullname')
const { value: email } = useField('email')
const { value: password } = useField('password')
const { value: role } = useField('role')

const filteredUsers = computed(() => {
  const users = userStore.users || []
  if (!search.value.trim()) return users
  const q = search.value.toLowerCase()
  return users.filter(
    (u) =>
      (u.fullname && u.fullname.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)),
  )
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUsers.value.slice(start, start + itemsPerPage.value)
})

watch([search, itemsPerPage], () => {
  currentPage.value = 1
})

const getRoleText = (roleName) => {
  switch (roleName) {
    case 'admin':
      return 'ผู้ดูแลระบบ'
    case 'manager':
      return 'ผู้จัดการ'
    case 'employee':
    default:
      return 'พนักงาน'
  }
}

const getRoleBadgeClass = (roleName) => {
  switch (roleName) {
    case 'admin':
      return 'bg-blue-100 text-blue-800 border-none'
    case 'manager':
      return 'bg-purple-100 text-purple-800 border-none'
    case 'employee':
    default:
      return 'bg-teal-100 text-teal-800 border-none'
  }
}

const openAddDialog = () => {
  isEdit.value = false
  selectedUser.value = null
  resetForm({
    values: {
      fullname: '',
      email: '',
      password: '',
      role: 'employee',
    },
  })
  editDialog.value = true
}

const openEditDialog = (user) => {
  isEdit.value = true
  selectedUser.value = user
  setValues({
    fullname: user.fullname,
    email: user.email,
    password: '',
    role: user.role,
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
    if (isEdit.value && selectedUser.value) {
      await userStore.updateUser(selectedUser.value.user_id, {
        fullname: values.fullname,
        email: values.email,
        password: values.password,
      })

      if (selectedUser.value.role !== values.role) {
        await userStore.changeUserRole(selectedUser.value.user_id, values.role)
      }

      toastStore.add('แก้ไขข้อมูลผู้ใช้สำเร็จ', 'success')
    } else {
      await userStore.createUser({
        fullname: values.fullname,
        email: values.email,
        password: values.password,
        role: values.role,
      })
      toastStore.add('เพิ่มผู้ใช้ใหม่สำเร็จ', 'success')
    }
    closeEditDialog()
  } catch (error) {
    toastStore.add(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error')
  } finally {
    saveLoading.value = false
  }
})

const confirmDelete = (user) => {
  selectedUser.value = user
  deleteDialog.value = true
}

const handleDelete = async () => {
  if (!selectedUser.value) return
  deleteLoading.value = true
  try {
    const res = await userStore.deleteUser(selectedUser.value.user_id)
    toastStore.add(res.data.message || 'ลบผู้ใช้สำเร็จ', 'success')
    deleteDialog.value = false
  } catch (error) {
    toastStore.add(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้', 'error')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  userStore.fetchUsers()
})
</script>
