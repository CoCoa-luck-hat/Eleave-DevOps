import axios from 'axios'
import { useToastStore } from '@/stores/toast'

const api = axios.create({
  baseURL: '/api',
})

// Request Interceptor: แนบ JWT Token อัตโนมัติทุกครั้ง
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// ตัวแปรกันแจ้งเตือนซ้ำข้อความเดิมภายในระยะเวลาสั้นๆ
let lastErrorMessage = ''
let lastErrorTime = 0

// Response Interceptor: ดักจับ Error และแปลงเป็นข้อความภาษาไทยที่เข้าใจง่าย พร้อมแจ้งเตือน Toast
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    let friendlyMessage = 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง'

    if (!error.response) {
      // กรณี Network Error, เน็ตหลุด, เซิร์ฟเวอร์ดับ หรือต่อ Port ไม่ติด
      friendlyMessage = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือสถานะของ Backend'
    } else {
      const { status, data } = error.response

      // 1. ถ้า Backend ส่ง message มา ให้ตรวจสอบว่าเป็นข้อความภาษาไทยที่มีประโยชน์หรือไม่
      if (data && data.message && typeof data.message === 'string') {
        friendlyMessage = data.message
      } else {
        // 2. แปลงรหัสข้อผิดพลาดตาม HTTP Status Code เป็นข้อความภาษาไทยที่ผู้ใช้งานเข้าใจง่าย
        switch (status) {
          case 400:
            friendlyMessage = 'ข้อมูลที่ส่งไม่ถูกต้องหรือกรอกข้อมูลไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง'
            break
          case 401:
            friendlyMessage = 'เซสชันหมดอายุหรือยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่'
            localStorage.removeItem('token')
            break
          case 403:
            friendlyMessage = 'คุณไม่มีสิทธิ์เข้าถึงหรือดำเนินการในส่วนนี้'
            break
          case 404:
            friendlyMessage = 'ไม่พบข้อมูลที่ต้องการในระบบ'
            break
          case 409:
            friendlyMessage = 'ข้อมูลนี้ถูกใช้งานไปแล้วในระบบ กรุณาตรวจสอบข้อมูลซ้ำ'
            break
          case 500:
            friendlyMessage = 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งในภายหลัง'
            break
          case 502:
          case 503:
          case 504:
            friendlyMessage = 'เซิร์ฟเวอร์ปลายทางไม่พร้อมให้บริการในขณะนี้'
            break
          default:
            friendlyMessage = `เกิดข้อผิดพลาดจากระบบ (รหัสสถานะ: ${status})`
            break
        }
      }
    }

    // แปะข้อความที่แปลงแล้วเข้าไปใน error object เพื่อให้ฟังก์ชันภายนอกอ่านได้
    error.friendlyMessage = friendlyMessage

    // แสดงแจ้งเตือน Toast สีแดง (error) อัตโนมัติ (กันซ้ำภายใน 1.5 วินาที)
    const now = Date.now()
    if (friendlyMessage !== lastErrorMessage || now - lastErrorTime > 1500) {
      lastErrorMessage = friendlyMessage
      lastErrorTime = now

      try {
        const toastStore = useToastStore()
        toastStore.add(friendlyMessage, 'error')
      } catch (e) {
        console.error('Toast notification failed:', e)
      }
    }

    return Promise.reject(error)
  },
)

export default api
